import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface NotificationPayload {
  title: string;
  message: string;
  severity: "critical" | "high" | "medium" | "low";
  source?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private config: ConfigService) {}

  async sendSlack(payload: NotificationPayload): Promise<boolean> {
    const webhookUrl = this.config.get("SLACK_WEBHOOK_URL");
    if (!webhookUrl) return false;

    const colors: Record<string, string> = {
      critical: "#ef4444",
      high: "#f97316",
      medium: "#eab308",
      low: "#22c55e",
    };

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attachments: [
            {
              color: colors[payload.severity] || "#6b7280",
              title: `[${payload.severity.toUpperCase()}] ${payload.title}`,
              text: payload.message,
              footer: payload.source ? `Source: ${payload.source}` : "SecOps Dashboard",
              ts: Math.floor(Date.now() / 1000),
            },
          ],
        }),
      });
      return res.ok;
    } catch (err) {
      this.logger.error(`Slack notification failed: ${err.message}`);
      return false;
    }
  }

  async sendTelegram(payload: NotificationPayload): Promise<boolean> {
    const botToken = this.config.get("TELEGRAM_BOT_TOKEN");
    const chatId = this.config.get("TELEGRAM_CHAT_ID");
    if (!botToken || !chatId) return false;

    const emoji: Record<string, string> = {
      critical: "🔴",
      high: "🟠",
      medium: "🟡",
      low: "🟢",
    };

    const text =
      `${emoji[payload.severity] || "⚪"} *${payload.title}*\n\n` +
      `${payload.message}\n\n` +
      `Severity: ${payload.severity.toUpperCase()}\n` +
      (payload.source ? `Source: ${payload.source}\n` : "") +
      `Time: ${new Date().toISOString()}`;

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "Markdown",
          }),
        }
      );
      return res.ok;
    } catch (err) {
      this.logger.error(`Telegram notification failed: ${err.message}`);
      return false;
    }
  }

  async sendWebhook(url: string, payload: NotificationPayload): Promise<boolean> {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "security_alert",
          ...payload,
          timestamp: new Date().toISOString(),
        }),
      });
      return res.ok;
    } catch (err) {
      this.logger.error(`Webhook notification failed: ${err.message}`);
      return false;
    }
  }

  async notify(payload: NotificationPayload): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    // Only notify for high/critical by default
    if (payload.severity === "critical" || payload.severity === "high") {
      results.slack = await this.sendSlack(payload);
      results.telegram = await this.sendTelegram(payload);
    }

    return results;
  }

  getConfigStatus() {
    return {
      slack: !!this.config.get("SLACK_WEBHOOK_URL"),
      telegram: !!this.config.get("TELEGRAM_BOT_TOKEN") && !!this.config.get("TELEGRAM_CHAT_ID"),
    };
  }
}
