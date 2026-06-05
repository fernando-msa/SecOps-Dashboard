import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";
import * as net from "node:net";

export type DependencyCheck = {
  status: "up" | "down";
  latencyMs?: number;
  error?: string;
};

@Injectable()
export class HealthService {
  constructor(
    private dataSource: DataSource,
    private config: ConfigService,
  ) {}

  getHealth() {
    return {
      status: "ok",
      service: "secops-dashboard-backend",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    };
  }

  async getReadiness() {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const dependencies = { database, redis };
    const ready = Object.values(dependencies).every(
      (check) => check.status === "up",
    );
    const response = {
      status: ready ? "ready" : "not_ready",
      timestamp: new Date().toISOString(),
      dependencies,
    };

    if (!ready) {
      throw new ServiceUnavailableException(response);
    }

    return response;
  }

  private async checkDatabase(): Promise<DependencyCheck> {
    const startedAt = Date.now();
    try {
      await this.dataSource.query("SELECT 1");
      return { status: "up", latencyMs: Date.now() - startedAt };
    } catch (error) {
      return {
        status: "down",
        latencyMs: Date.now() - startedAt,
        error:
          error instanceof Error ? error.message : "Unknown database error",
      };
    }
  }

  private async checkRedis(): Promise<DependencyCheck> {
    const host = this.config.get<string>("REDIS_HOST", "localhost");
    const port = Number(this.config.get<number>("REDIS_PORT", 6379));
    const timeoutMs = Number(
      this.config.get<number>("REDIS_HEALTH_TIMEOUT_MS", 1000),
    );
    const startedAt = Date.now();

    return new Promise((resolve) => {
      const socket = net.createConnection({ host, port });
      let settled = false;

      const finish = (check: DependencyCheck) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        resolve({ ...check, latencyMs: Date.now() - startedAt });
      };

      socket.setTimeout(timeoutMs);
      socket.once("connect", () => socket.write("*1\r\n$4\r\nPING\r\n"));
      socket.once("data", (data) => {
        const response = data.toString();
        finish(
          response.startsWith("+PONG")
            ? { status: "up" }
            : {
                status: "down",
                error: `Unexpected Redis response: ${response.trim()}`,
              },
        );
      });
      socket.once("timeout", () =>
        finish({ status: "down", error: "Redis health check timed out" }),
      );
      socket.once("error", (error) =>
        finish({ status: "down", error: error.message }),
      );
    });
  }
}
