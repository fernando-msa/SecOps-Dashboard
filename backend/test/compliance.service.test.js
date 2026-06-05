const test = require("node:test");
const assert = require("node:assert/strict");

const { BadRequestException } = require("@nestjs/common");
const { ComplianceService } = require("../dist/compliance/compliance.service");
const {
  ComplianceFramework,
  ComplianceStatus,
} = require("../dist/compliance/compliance-check.entity");

function createRepository(rows = []) {
  return {
    create(data) {
      return { id: data.id || `check-${rows.length + 1}`, ...data };
    },
    async save(row) {
      rows.push(row);
      return row;
    },
    async findOne(options = {}) {
      const where = options.where || {};
      return rows.find((row) =>
        Object.entries(where).every(([key, value]) => row[key] === value)
      );
    },
    async update(where, data) {
      const row = rows.find((candidate) =>
        Object.entries(where).every(([key, value]) => candidate[key] === value)
      );
      if (row) Object.assign(row, data);
    },
    async delete() {},
    async find() {
      return rows;
    },
  };
}

function createService(rows = []) {
  return new ComplianceService(createRepository(rows));
}

test("ISO 27001 non-compliant controls require evidence on create", async () => {
  const service = createService();

  await assert.rejects(
    () =>
      service.create({
        tenantId: "tenant-a",
        framework: ComplianceFramework.ISO27001,
        controlId: "A.5.1",
        title: "Information security policies",
        status: ComplianceStatus.NON_COMPLIANT,
        evidence: "   ",
      }),
    BadRequestException
  );
});

test("ISO 27001 non-compliant controls are accepted when evidence is present", async () => {
  const service = createService();

  const result = await service.create({
    tenantId: "tenant-a",
    framework: ComplianceFramework.ISO27001,
    controlId: "A.5.1",
    title: "Information security policies",
    status: ComplianceStatus.NON_COMPLIANT,
    evidence: "Policy review overdue; corrective action opened in ticket SEC-123.",
  });

  assert.equal(result.framework, ComplianceFramework.ISO27001);
  assert.equal(result.status, ComplianceStatus.NON_COMPLIANT);
});

test("ISO 27001 update cannot mark a control non-compliant without evidence", async () => {
  const rows = [
    {
      id: "check-1",
      tenantId: "tenant-a",
      framework: ComplianceFramework.ISO27001,
      status: ComplianceStatus.COMPLIANT,
      evidence: "",
    },
  ];
  const service = createService(rows);

  await assert.rejects(
    () =>
      service.update("check-1", "tenant-a", {
        status: ComplianceStatus.NON_COMPLIANT,
      }),
    BadRequestException
  );
});

test("non-ISO frameworks do not require evidence for non-compliant status", async () => {
  const service = createService();

  const result = await service.create({
    tenantId: "tenant-a",
    framework: ComplianceFramework.NIST,
    controlId: "AC-1",
    title: "Access Control Policy",
    status: ComplianceStatus.NON_COMPLIANT,
  });

  assert.equal(result.framework, ComplianceFramework.NIST);
  assert.equal(result.status, ComplianceStatus.NON_COMPLIANT);
});
