import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { TenantsModule } from "./tenants/tenants.module";
import { SecurityEventsModule } from "./security-events/security-events.module";
import { VulnerabilitiesModule } from "./vulnerabilities/vulnerabilities.module";
import { PlaybooksModule } from "./playbooks/playbooks.module";
import { MetricsModule } from "./metrics/metrics.module";
import { ComplianceModule } from "./compliance/compliance.module";
import { SiemModule } from "./siem/siem.module";
import { ThreatIntelModule } from "./threat-intel/threat-intel.module";
import { AssetsModule } from "./assets/assets.module";
import { IncidentsModule } from "./incidents/incidents.module";
import { SoarModule } from "./soar/soar.module";
import { ExportModule } from "./export/export.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { TwoFAModule } from "./twofa/twofa.module";
import { AuditModule } from "./audit/audit.module";
import { ApiKeysModule } from "./apikeys/apikeys.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get("DATABASE_HOST", "localhost"),
        port: config.get<number>("DATABASE_PORT", 5432),
        username: config.get("DATABASE_USER", "secops"),
        password: config.get("DATABASE_PASSWORD", "secops_secret"),
        database: config.get("DATABASE_NAME", "secops_db"),
        autoLoadEntities: true,
        synchronize: true, // disable in production
      }),
    }),
    AuthModule,
    UsersModule,
    TenantsModule,
    SecurityEventsModule,
    VulnerabilitiesModule,
    PlaybooksModule,
    MetricsModule,
    ComplianceModule,
    SiemModule,
    ThreatIntelModule,
    AssetsModule,
    IncidentsModule,
    SoarModule,
    ExportModule,
    NotificationsModule,
    TwoFAModule,
    AuditModule,
    ApiKeysModule,
  ],
})
export class AppModule {}
