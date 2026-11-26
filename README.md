# AeroTrust

### Decentralized Aviation Asset & Maintenance Intelligence Platform

![Status](https://img.shields.io/badge/Status-Active_Development-blue)
![Version](https://img.shields.io/badge/Version-0.1.0-cyan)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-3178C6)
![Hedera](https://img.shields.io/badge/Hedera-Planned_Integration-black)

AeroTrust is an experimental aviation intelligence platform exploring the intersection of decentralized trust, knowledge graphs, asset traceability and predictive maintenance.

The project investigates how modern software engineering and distributed ledger technologies could improve the visibility, integrity and traceability of aviation asset information throughout its lifecycle.

---

## Project Vision

The aviation industry depends on complex networks of aircraft, engines, components, manufacturers, maintenance facilities and inspection records.

AeroTrust explores a unified intelligence workspace where these relationships can be visualized, analyzed and eventually verified through decentralized infrastructure.

The long-term objective is to connect:

- Aviation asset lifecycle management
- Interactive knowledge graphs
- Digital asset passports
- Predictive maintenance intelligence
- Tamper-evident maintenance records
- Distributed ledger verification

---

## Knowledge Graph

![Knowledge Graph](screenshots/knowledge-graph.png)

An interactive aviation knowledge graph representing relationships between aircraft, engines, components, manufacturers, airlines, maintenance facilities and inspection records.

### Features

- Interactive graph visualization
- Dynamic entity selection
- Entity relationship exploration
- Intelligent entity search
- Category-based filtering
- Entity metadata inspection
- Camera navigation and zoom
- Deterministic network generation

### Synthetic Dataset

| Entity | Count |
|---|---:|
| Aircraft | 24 |
| Engines | 48 |
| Components | 384 |
| Manufacturers | 12 |
| Airlines | 8 |
| Maintenance facilities | 16 |
| Inspection records | 320 |
| Digital asset passports | 456 |
| Ledger record placeholders | 456 |
| **Total entities** | **1,724** |
| **Total relationships** | **2,536** |

---

## Asset Registry

![Asset Registry](screenshots/asset-registry.png)

A centralized interface for exploring aviation assets and their associated lifecycle information.

### Features

- Aircraft, engine and component registry
- Asset status monitoring
- Search and category filtering
- Asset metadata inspection
- Fleet statistics
- Status distribution
- Pagination
- CSV export

---

## Predictive Maintenance Intelligence

![Predictive Maintenance](screenshots/predictive-maintenance.png)

An experimental maintenance intelligence dashboard powered by deterministic simulated engine telemetry and rule-based condition assessments.

### Monitored Parameters

- Exhaust gas temperature
- Engine vibration
- Oil temperature
- Oil pressure
- Fuel flow
- N1 rotational speed
- N2 rotational speed
- Operating hours
- Component health scores
- Simulated maintenance risk

### Features

- Interactive engine selection
- Historical telemetry visualization
- Component health monitoring
- Risk classification
- Illustrative remaining-life estimates
- Maintenance recommendations
- Fleet-level condition statistics

The current prototype generates simulated telemetry for 48 engines, with 96 readings per engine.

A trained machine learning model and real sensor integration are planned for future development.

---

## Powerplant Intelligence Network

![Powerplant Intelligence Network](screenshots/powerplant-network.png)

A multi-layer dependency visualization connecting engine architecture with component condition information and simulated maintenance assessments.

The network consists of five layers:

1. Powerplant
2. Engine subsystems
3. Individual components
4. Condition intelligence
5. Maintenance assessments

### Features

- Dynamic dependency network generation
- Interactive component inspection
- Relationship highlighting
- Directional connections
- Condition metric nodes
- Risk-based assessment nodes
- Zoom controls
- Expanded visualization mode

Subsystem groupings are illustrative rather than certified engineering representations.

---

## Hedera Integration

The project was initiated while completing three Hedera certification programs:

- Hedera Certified Associate Developer (HCDA)
- Hedera Certified Foundation (HCF)
- Hedera Business Foundation (HBF)

AeroTrust is designed to explore the application of distributed ledger technology to aviation asset traceability.

### Planned Capabilities

- Hedera Consensus Service integration
- Digital asset passport verification
- Maintenance record anchoring
- Cryptographic document hashing
- Tamper-evident inspection history
- Transaction verification
- Hedera Testnet integration

The current version contains synthetic passport records and ledger placeholders.

Live Hedera transactions and decentralized verification have not yet been implemented.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend application |
| TypeScript | Type-safe development |
| Vite | Development and build tooling |
| Tailwind CSS | Interface styling |
| Sigma.js | Knowledge graph rendering |
| Graphology | Graph data structures |
| ForceAtlas2 | Graph layout capabilities |
| Recharts | Telemetry and statistical visualization |
| Zustand | Application state management |
| Lucide React | Interface icons |
| SVG | Dependency network visualization |

### Planned Technologies

- Python
- FastAPI
- PostgreSQL
- Machine learning
- Hedera SDK
- Docker

---

## Project Structure

```text
AeroTrust/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── graph/
│   │   │   └── maintenance/
│   │   ├── data/
│   │   ├── graph/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   └── App.tsx
│   └── package.json
├── docs/
├── screenshots/
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js compatible with the project's Vite version
- npm
- Git

### Installation

```bash
git clone https://github.com/zied3332/AeroTrust.git

cd AeroTrust/frontend

npm install

npm run dev
```

Open the local development URL displayed in the terminal.

### Production Build

```bash
npm run build
```

### Code Quality

```bash
npm run lint
```

---

## Development Roadmap

### Phase 1 — Aviation Intelligence Frontend

- [x] Application workspace
- [x] Synthetic aviation dataset
- [x] Interactive knowledge graph
- [x] Entity search and filtering
- [x] Aviation asset registry
- [x] Simulated engine telemetry
- [x] Maintenance intelligence dashboard
- [x] Powerplant dependency network

### Phase 2 — Decentralized Trust

- [ ] Hedera Testnet integration
- [ ] Digital asset passport interface
- [ ] Maintenance record anchoring
- [ ] Cryptographic verification
- [ ] Transaction explorer

### Phase 3 — Backend Infrastructure

- [ ] REST API
- [ ] Persistent database
- [ ] Authentication and authorization
- [ ] Asset lifecycle management
- [ ] Maintenance record management
- [ ] Automated testing

### Phase 4 — Advanced Aviation Intelligence

- [ ] Python telemetry processing pipeline
- [ ] Anomaly detection
- [ ] Machine learning models
- [ ] Remaining useful life estimation
- [ ] Advanced graph analytics
- [ ] External aviation data integration

---

## Disclaimer

AeroTrust is an independent educational and experimental software engineering project.

All aviation assets, maintenance records, telemetry and condition assessments in the current prototype are synthetic.

The platform is not intended for operational aviation decisions, aircraft certification, airworthiness assessments or safety-critical maintenance planning.

---

## Author

**Zied Alimi**

Computer Engineering Student — ESPRIT School of Engineering

Interests: Software Engineering, Distributed Systems, Aviation Technology, Artificial Intelligence and Data Engineering.

[GitHub](https://github.com/zied3332)

---

**AeroTrust — Exploring the future of trusted aviation intelligence.**
