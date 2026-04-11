# LocalCRM — Full-Stack CRM System

LocalCRM is a containerized, full-stack customer relationship management (CRM) system built with ASP.NET Core, PostgreSQL, and a React/Electron desktop client.  

This project demonstrates end-to-end system design, including API development, database integration, frontend interaction, and containerized development environments.

---

## 🚀 Tech Stack

### Backend
- ASP.NET Core (C#)
- Entity Framework Core
- PostgreSQL
- REST API design

### Frontend
- React (TypeScript)
- Vite
- Electron (desktop client)

### Infrastructure
- Docker (PostgreSQL container)
- Dev Containers (GitHub Codespaces-ready)

---

## 📦 Features

- Create and retrieve customer records
- RESTful API endpoints:
  - `GET /health`
  - `GET /customers`
  - `POST /customers`
- Database migrations with EF Core
- Desktop UI for interacting with API
- Containerized development environment

---

## 🧠 What This Project Demonstrates

- Full-stack application architecture
- API ↔ database ↔ frontend integration
- Debugging across multiple systems (TypeScript, .NET, Docker)
- Entity Framework migrations and schema management
- Real-world development workflow inside containerized environments

---

## ⚙️ Running the Project

### 1. Start database
```bash
docker compose -f .devcontainer/docker-compose.yml up -d postgres