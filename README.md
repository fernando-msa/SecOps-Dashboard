# SecOps Dashboard

![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)
![Tests](https://img.shields.io/badge/tests-node%3Atest-brightgreen?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/backend-NestJS-E0234E?logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/frontend-Next.js-000000?logo=nextdotjs&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Security Operations Center (SOC) — Centralized security event management, vulnerability tracking, incident response playbooks, and compliance monitoring.

## Architecture

```
├── backend/          NestJS API (port 3001)
├── frontend/         Next.js App Router (port 3000)
└── docker-compose.yml  PostgreSQL
```

### Stack

- **Backend**: NestJS + TypeORM + PostgreSQL + JWT + WebSocket
- **Frontend**: Next.js 14 + Tailwind CSS + Recharts + Socket.IO
- **Auth**: JWT with multi-tenant support
- **Real-time**: WebSocket for live security alerts

## Quick Start

### 1. Start Database

```bash
docker-compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env    # configure database credentials
npm install
npm run start:dev       # http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev             # http://localhost:3000
```

### 4. Create Account

Open http://localhost:3000/login and register a new account.

## Features

### Dashboard
- Real-time security event overview
- Stats cards: Open Events, Vulnerabilities, MTTR, Compliance Score
- 30-day alert trend chart
- Severity distribution (critical/high/medium/low)
- Recent alerts timeline

### Security Events
- CRUD with filters (severity, status)
- WebSocket real-time push notifications
- Event stats by severity and status

### Vulnerabilities
- Track CVEs with CVSS scores
- Filter by severity and status
- Affected asset tracking

### Playbooks
- Incident response runbooks
- Steps: manual, automated, approval
- Toggle active/inactive
- Trigger condition configuration

### Metrics
- **MTTR** — Mean Time to Resolve
- **MTTD** — Mean Time to Detect
- Incidents by category breakdown
- 30-day timeline

### Compliance
- Framework tracking: ISO 27001, LGPD, NIST
- Per-framework compliance percentage
- Control status: compliant, non-compliant, partial, N/A
- Evidence and last reviewed date

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account + tenant |
| POST | `/api/auth/login` | Login, returns JWT |

### Security Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List events (filters: severity, status) |
| POST | `/api/events` | Create event |
| GET | `/api/events/stats` | Event statistics |
| GET | `/api/events/recent` | Recent alerts |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |

### Vulnerabilities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vulnerabilities` | List vulnerabilities |
| POST | `/api/vulnerabilities` | Create vulnerability |
| GET | `/api/vulnerabilities/stats` | Vulnerability stats |
| PUT | `/api/vulnerabilities/:id` | Update vulnerability |
| DELETE | `/api/vulnerabilities/:id` | Delete vulnerability |

### Playbooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/playbooks` | List playbooks |
| POST | `/api/playbooks` | Create playbook |
| PATCH | `/api/playbooks/:id/toggle` | Toggle active/inactive |
| PUT | `/api/playbooks/:id` | Update playbook |
| DELETE | `/api/playbooks/:id` | Delete playbook |

### Metrics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/metrics/overview` | Dashboard overview |
| GET | `/api/metrics/mttr` | Mean Time to Resolve |
| GET | `/api/metrics/mttd` | Mean Time to Detect |
| GET | `/api/metrics/incidents-by-category` | Category breakdown |
| GET | `/api/metrics/timeline` | 30-day event timeline |

### Compliance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/compliance` | List compliance checks |
| POST | `/api/compliance` | Create check |
| GET | `/api/compliance/summary` | Per-framework summary |
| GET | `/api/compliance/framework/:name` | Checks by framework |
| PUT | `/api/compliance/:id` | Update check |
| DELETE | `/api/compliance/:id` | Delete check |

## Multi-Tenant

Every entity is scoped to a tenant. The JWT token includes `tenantId`, and all queries are automatically filtered. New accounts create a new tenant automatically.

## WebSocket

Connect to `ws://localhost:3001/events` with `tenantId` query parameter:

```javascript
const socket = io("http://localhost:3001/events", {
  query: { tenantId: "your-tenant-id" }
});

socket.on("newEvent", (event) => {
  console.log("New security event:", event);
});
```

## Ecosystem

Part of a security and operations tooling ecosystem:

- **SecOps Dashboard** — SOC centralizado (this project)
- **FirewallWatch** — Firewall event monitoring
- **SecPolicy-HAMA** — Security policy management
- **InfraPulse** — Infrastructure monitoring
- **OpsBoard** — Operations dashboard

## Quality Engineering

### Automated Tests

The repository includes automated tests using the native Node.js test runner:

```bash
cd backend && npm test
cd frontend && npm run test:ci
```

- Backend tests validate tenant-scoped metrics, MTTR calculation, and incident category aggregation.
- Frontend tests validate i18n dictionary parity and non-empty translation values.

### CI/CD Pipeline

GitHub Actions workflow: `.github/workflows/ci-cd.yml`.

The pipeline runs on pushes, pull requests, and manual dispatches with these stages:

1. Backend typecheck and automated tests.
2. Frontend typecheck, automated tests, and production build.
3. Docker image build for backend and frontend.
4. Production compose validation on `main`/`master` pushes.

### Technical Documentation

Detailed architecture, module responsibilities, scripts, testing strategy, CI/CD flow, security notes, and contribution guidance are available in [`docs/TECHNICAL_DOCUMENTATION.md`](docs/TECHNICAL_DOCUMENTATION.md).

## License

MIT
