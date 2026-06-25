# 🚀 TaskFlow API

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

A modern, modular backend for a multi-tenant task and project management platform. It is designed to support organizations, workspaces, departments, teams, projects, tasks, comments, invitations, notifications, and dashboard insights in one scalable API.

---

## ✨ Why this project exists

This backend powers a full collaboration workspace where teams can:

- create and manage organizations and workspaces
- organize people into departments and teams
- manage projects and tasks with ownership and deadlines
- collaborate through comments and notifications
- track activity and monitor workspace performance

It is built to feel like a production-ready foundation for a SaaS-style productivity product.

---

## 🧠 Core capabilities

- Secure authentication and authorization with JWT
- Role-based access control for workspace and project operations
- Multi-tenant structure with organization → workspace → department → team → project hierarchy
- Task lifecycle management including status, priority, due dates, and assignment
- Project membership and invitation flow
- Comments, notifications, and activity logging
- Dashboard metrics and analytics-ready endpoints
- Prisma + PostgreSQL persistence with a clean modular architecture

---

## 🛠️ Tech stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod validation
- bcryptjs for password hashing
- JSON Web Token (JWT)
- Helmet and express-rate-limit for security

---

## 🏗️ System architecture

```text
User
  ↓
Auth / JWT
  ↓
Organization → Workspace → Department → Team → Project → Task
  ↓
Comments / Notifications / Activity Logs / Dashboard
```

The backend follows a modular structure where each domain feature is isolated into its own module while sharing common middleware, utilities, and Prisma access.

---

## 📚 Main modules

- Auth: registration, login, profile, workspace switching
- Organization: create and manage organizations
- Workspace: workspace-level management and membership
- Department: organize teams within a workspace
- Team: create teams and manage team membership
- Project: manage project details and members
- Task: create, update, assign, prioritize, and track tasks
- Comment: add and manage task discussion
- Invitation: invite users to join organizations or workspaces
- Notification: alert users about relevant activity
- Activity Log: track system and user actions
- Dashboard: retrieve workspace and task metrics

---

## 🚀 Quick start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1) Install dependencies

```bash
git clone <your-repository-url>
cd task-management-backend
npm install
```

### 2) Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/task_management?schema=public"
JWT_SECRET="your_super_secret_key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
```

### 3) Prepare the database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4) Run the server

```bash
npm run dev
```

For production:

```bash
npm run build
npm start
```

---

## 🔐 API overview

All routes are served from the `/api` base path.

> Public routes: registration and login. Most other endpoints require a bearer token.

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/switch-workspace`

### Organizations

- `POST /api/organizations`
- `GET /api/organizations`
- `GET /api/organizations/:id`
- `PATCH /api/organizations/:id`
- `DELETE /api/organizations/:id`

### Workspaces

- `POST /api/workspaces`
- `GET /api/workspaces`
- `GET /api/workspaces/:id`
- `PATCH /api/workspaces/:id`
- `DELETE /api/workspaces/:id`

### Projects

- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`

### Tasks

- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `PATCH /api/tasks/:id/priority`
- `PATCH /api/tasks/:id/assign`
- `DELETE /api/tasks/:id`

### Comments, Notifications, and Dashboard

- `POST /api/comments/:taskId`
- `GET /api/notifications`
- `GET /api/dashboard/stats`
- `GET /api/activity-logs`

---

## 🧪 Example requests

### Register a user

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"StrongP@ssw0rd"}'
```

### Log in

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"StrongP@ssw0rd"}'
```

### Create a task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"Design review","description":"Prepare the final checklist","projectId":"<PROJECT_ID>"}'
```

---

## 📁 Project structure

```text
src/
├── app.ts
├── server.ts
├── config/
├── errors/
├── lib/
├── middlewares/
├── modules/
│   ├── auth/
│   ├── organization/
│   ├── workspace/
│   ├── department/
│   ├── team/
│   ├── project/
│   ├── task/
│   ├── comment/
│   ├── invitation/
│   ├── notification/
│   ├── dashboard/
│   └── activity-log/
├── prisma/
├── routes/
├── utils/
└── types/
```

---

## 🧩 Development notes

- The project uses Prisma migrations for schema evolution.
- Validation is handled with Zod to keep request handling predictable.
- The app is organized around reusable middleware and service-based modules.
- The architecture is ready for future extensions such as websockets, file uploads, or advanced reporting.

---

## 🤝 Contributing

Contributions are welcome. If you would like to improve the API, add features, or fix issues, feel free to open an issue or submit a pull request.

---

<p align="center">Built for modern collaboration, scalable workflows, and smart team operations.</p>
