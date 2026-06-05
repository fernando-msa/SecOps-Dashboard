const test = require("node:test");
const assert = require("node:assert/strict");

const { MetricsService } = require("../dist/metrics/metrics.service");
const { EventStatus } = require("../dist/security-events/security-event.entity");
const { ComplianceStatus } = require("../dist/compliance/compliance-check.entity");

function createRepository(rows) {
  return {
    async find(options = {}) {
      const where = options.where || {};
      return rows.filter((row) =>
        Object.entries(where).every(([key, value]) => row[key] === value)
      );
    },
  };
}

function createService({ events = [], vulnerabilities = [], compliance = [] } = {}) {
  return new MetricsService(
    createRepository(events),
    createRepository(vulnerabilities),
    createRepository(compliance)
  );
}

test("getOverview aggregates tenant-scoped SOC metrics", async () => {
  const service = createService({
    events: [
      { tenantId: "tenant-a", status: EventStatus.OPEN },
      { tenantId: "tenant-a", status: EventStatus.RESOLVED },
      { tenantId: "tenant-b", status: EventStatus.OPEN },
    ],
    vulnerabilities: [
      { tenantId: "tenant-a", status: "open" },
      { tenantId: "tenant-a", status: "resolved" },
      { tenantId: "tenant-b", status: "open" },
    ],
    compliance: [
      { tenantId: "tenant-a", status: ComplianceStatus.COMPLIANT },
      { tenantId: "tenant-a", status: ComplianceStatus.NON_COMPLIANT },
      { tenantId: "tenant-b", status: ComplianceStatus.COMPLIANT },
    ],
  });

  assert.deepEqual(await service.getOverview("tenant-a"), {
    totalEvents: 2,
    openEvents: 1,
    totalVulnerabilities: 2,
    openVulnerabilities: 1,
    complianceScore: 50,
    totalComplianceChecks: 2,
  });
});

test("getMTTR returns average resolution time in hours", async () => {
  const service = createService({
    events: [
      {
        tenantId: "tenant-a",
        status: EventStatus.RESOLVED,
        createdAt: new Date("2026-06-01T00:00:00.000Z"),
        updatedAt: new Date("2026-06-01T02:00:00.000Z"),
      },
      {
        tenantId: "tenant-a",
        status: EventStatus.RESOLVED,
        createdAt: new Date("2026-06-01T00:00:00.000Z"),
        updatedAt: new Date("2026-06-01T05:00:00.000Z"),
      },
      {
        tenantId: "tenant-a",
        status: EventStatus.OPEN,
        createdAt: new Date("2026-06-01T00:00:00.000Z"),
        updatedAt: new Date("2026-06-01T10:00:00.000Z"),
      },
    ],
  });

  assert.deepEqual(await service.getMTTR("tenant-a"), {
    mttr: 3.5,
    unit: "hours",
    sampleSize: 2,
  });
});

test("getIncidentsByCategory groups missing categories as Uncategorized", async () => {
  const service = createService({
    events: [
      { tenantId: "tenant-a", category: "Malware" },
      { tenantId: "tenant-a", category: "Malware" },
      { tenantId: "tenant-a", category: null },
      { tenantId: "tenant-b", category: "Phishing" },
    ],
  });

  assert.deepEqual(await service.getIncidentsByCategory("tenant-a"), [
    { category: "Malware", count: 2 },
    { category: "Uncategorized", count: 1 },
  ]);
});
