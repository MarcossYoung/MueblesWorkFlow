# MueblesWorkFlow

SaaS application for managing furniture production workflows — tracks orders from creation through delivery, handles payments, monitors finances, and includes an AI assistant for querying business data.

## What It Does

MueblesWorkFlow gives a furniture workshop a single place to manage its entire operation:

- **Sellers** create orders (Pedidos), record deposits and partial payments, and track which pieces are ready for pickup.
- **Workers** follow production queues and see their assigned work orders.
- **Admins** get a full finance dashboard, cost tracking, inventory management, and AI-powered business insights.

Orders move through a lifecycle: created → in production → ready → delivered. Each order can have multiple payments (deposit, partial, final) and is linked to a work order that tracks production status.

## Features

- **Order management** — create, edit, filter, and track furniture orders with client details, dimensions, materials, and delivery dates
- **Payment tracking** — record deposits, partial payments, and finals; see outstanding balances per order
- **Finance dashboard** — monthly revenue charts, income breakdown, and seller-specific income views
- **Cost tracking** — log fixed and variable business costs (admin only)
- **Inventory management** — track raw materials and stock levels
- **AI assistant** (Claude-powered):
  - Chat panel for free-form business queries
  - Smart order form fill from a natural-language description
  - Finance insight cards with AI analysis
  - Weekly digest summary for admins
  - Natural-language order search
- **Role-based access** — three roles with progressively more access: `USER` → `SELLER` → `ADMIN`

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.x / Java 21 |
| Database | PostgreSQL (Neon cloud) |
| Auth | Spring Security + JWT |
| Frontend | React 19 (Create React App) |
| Charts | Recharts |
| AI | Anthropic Claude API (claude-haiku) |
| Automation | N8N webhook (custom AI chatbot flow) |
| Deployment | Netlify (frontend) |

## How to Run

### Backend
```bash
# From project root
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

### Frontend
```bash
cd frontEnd/muebles_workflow
npm install
npm start
# Runs on http://localhost:3000
```

## Environment Variables

Add these to `backEnd/src/main/resources/application.properties`:

```properties
# Database (Neon PostgreSQL)
spring.datasource.url=jdbc:postgresql://<host>/<db>
spring.datasource.username=<user>
spring.datasource.password=<password>

# JWT
jwt.secret=<your-secret>

# Anthropic (AI features)
anthropic.api.key=<your-key>
```
