import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { ExportService } from "./export.service";

@Controller("export")
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Get(":type")
  async exportCSV(
    @Param("type") type: string,
    @CurrentUser("tenantId") tenantId: string,
    @Res() res: Response
  ) {
    let csv: string;
    let filename: string;

    switch (type) {
      case "events":
        csv = await this.exportService.exportEvents(tenantId);
        filename = "security-events";
        break;
      case "vulnerabilities":
        csv = await this.exportService.exportVulnerabilities(tenantId);
        filename = "vulnerabilities";
        break;
      case "incidents":
        csv = await this.exportService.exportIncidents(tenantId);
        filename = "incidents";
        break;
      case "assets":
        csv = await this.exportService.exportAssets(tenantId);
        filename = "assets";
        break;
      case "compliance":
        csv = await this.exportService.exportCompliance(tenantId);
        filename = "compliance";
        break;
      default:
        return res.status(400).json({ message: "Invalid export type" });
    }

    const date = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}-${date}.csv"`);
    res.send(csv);
  }
}
