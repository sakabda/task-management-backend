# 🚀 Task Management Backend

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

A modular backend API for team-based task and project management, built with Express, TypeScript, and Prisma.

---

## ✨ Features

- Authentication with email/password registration and login
- JWT-based authorization
- Workspace-aware sessions and workspace switching
- Task creation, assignment, status updates, and priority changes
- Project management with project membership
- Task comments and threaded collaboration
- Notification read/unread handling
- Dashboard metrics endpoint
- Prisma-powered PostgreSQL persistence

---

## 🧩 Tech Stack

- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod validation
- bcryptjs for password hashing
- JSON Web Tokens for auth
- Helmet and express-rate-limit for security

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or later
- PostgreSQL v14 or later
- npm

### Installation

```bash
git clone <repository-url>
cd task-management-backend
npm install
```

### Environment

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/task_management?schema=public"
JWT_SECRET="your_strong_jwt_secret"
JWT_EXPIRES_IN="7d"
PORT=5000
```

### Environment Variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string for Prisma |
| `JWT_SECRET` | Secret key used to sign JWTs |
| `JWT_EXPIRES_IN` | Token expiration time (e.g. `7d`) |
| `PORT` | Port where the server runs |

### Database setup

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Run

```bash
npm run dev
```

For production:

```bash
npm run build
npm start
```

---

## 🚧 Project Structure

```bash
src/
├── app.ts              # Express app setup
├── server.ts           # App bootstrap
├── modules/            # Feature modules and domain logic
│   ├── auth/           # Authentication and user sessions
│   ├── task/           # Task CRUD and workflow operations
│   ├── project/        # Project CRUD and membership
│   ├── comment/        # Task comments
│   ├── notification/   # Notification routes and actions
│   ├── dashboard/      # Dashboard stats endpoint
│   └── ...            # Other modules such as workspace, team, department
├── middlewares/        # Auth, validation, error handling, security
├── prisma/             # Prisma schema, migrations, client setup
├── utils/              # Shared helpers and response helpers
└── routes/             # API route registration
```

---

## 📡 API Endpoints

All routes are mounted under `/api`.

> Most endpoints require `Authorization: Bearer <TOKEN>`.
> `POST /api/auth/register` and `POST /api/auth/login` are public.

### Auth

- `POST /api/auth/register` — Register a new user (public)
- `POST /api/auth/login` — Login and receive JWT (public)
- `GET /api/auth/me` — Get current user profile (auth required)
- `POST /api/auth/switch-workspace` — Change active workspace (auth required)
- `GET /api/auth/users/:projectId` — List users in a project (auth required)

### Tasks

- `POST /api/tasks` — Create a task (auth required)
- `GET /api/tasks` — List tasks (auth required)
- `GET /api/tasks/my-assigned` — Tasks assigned to current user (auth required)
- `GET /api/tasks/board` — Get task board view (auth required)
- `GET /api/tasks/overdue` — Get overdue tasks (auth required)
- `GET /api/tasks/upcoming` — Get upcoming tasks (auth required)
- `GET /api/tasks/:id` — Get task details (auth required)
- `PATCH /api/tasks/:id` — Update a task (auth required)
- `PATCH /api/tasks/:id/assign` — Assign a task (auth required)
- `PATCH /api/tasks/:id/status` — Update task status (auth required)
- `PATCH /api/tasks/:id/priority` — Update task priority (auth required)
- `DELETE /api/tasks/:id` — Delete a task (auth required)

### Projects

- `POST /api/projects` — Create a project (auth required)
- `GET /api/projects` — List projects (auth required)
- `GET /api/projects/:id` — Get a project (auth required)
- `PATCH /api/projects/:id` — Update a project (auth required)
- `DELETE /api/projects/:id` — Delete a project (auth required)
- `POST /api/projects/:projectId/members` — Add a project member (auth required)
- `GET /api/projects/:projectId/members` — List project members (auth required)
- `DELETE /api/projects/members/:memberId` — Remove project member (auth required)

### Workspaces

- `POST /api/workspaces` — Create a workspace (auth required)
- `GET /api/workspaces` — List workspaces (auth required)
- `GET /api/workspaces/:id` — Get a workspace (auth required)
- `PATCH /api/workspaces/:id` — Update a workspace (auth required)
- `DELETE /api/workspaces/:id` — Delete a workspace (auth required)

### Departments

- `GET /api/workspaces/:workspaceId/departments` — List departments in a workspace (auth required)
- `POST /api/workspaces/:workspaceId/departments` — Create a department in a workspace (auth required)
- `PATCH /api/workspaces/departments/:id` — Update a department (auth required)
- `DELETE /api/workspaces/departments/:id` — Delete a department (auth required)

### Teams

- `GET /api/workspaces/:workspaceId/teams` — List teams in a workspace (auth required)
- `POST /api/workspaces/:workspaceId/teams` — Create a team in a workspace (auth required)
- `GET /api/workspaces/teams/:id` — Get a team (auth required)
- `PATCH /api/workspaces/teams/:id` — Update a team (auth required)
- `DELETE /api/workspaces/teams/:id` — Delete a team (auth required)
- `POST /api/workspaces/teams/:id/members` — Add a member to a team (auth required)
- `DELETE /api/workspaces/teams/:id/members/:memberId` — Remove a member from a team (auth required)

### Organizations

- `POST /api/organizations` — Create an organization (auth required)
- `GET /api/organizations` — List organizations (auth required)
- `GET /api/organizations/:id` — Get an organization (auth required)
- `PATCH /api/organizations/:id` — Update an organization (auth required)
- `DELETE /api/organizations/:id` — Delete an organization (auth required)

### Comments

- `POST /api/comments/:taskId` — Add a comment to a task (auth required)
- `GET /api/comments/:taskId` — List comments for a task (auth required)
- `PATCH /api/comments/:id` — Update a comment (auth required)
- `DELETE /api/comments/:id` — Delete a comment (auth required)

### Notifications

- `GET /api/notifications` — Get user notifications (auth required)
- `PATCH /api/notifications/:id/read` — Mark a notification as read (auth required)
- `PATCH /api/notifications/read-all` — Mark all notifications as read (auth required)

### Activity Logs

- `GET /api/activity-logs` — Get all activity logs (admin only)

### Dashboard

- `GET /api/dashboard/stats` — Get aggregated dashboard metrics (auth required)

---

## 💡 Usage Examples

### Register a user

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongP@ssw0rd","name":"Jane Doe"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongP@ssw0rd"}'
```

### Create a task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"Finish report","description":"Complete the Q2 summary","projectId":"<PROJECT_ID>"}'
```

### Fetch dashboard stats

```bash
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 📦 npm Scripts

- `npm run dev` — Start the development server with hot reload
- `npm run build` — Compile TypeScript files
- `npm start` — Run the compiled production server

---

## 🤝 Contributing

Contributions are welcome. Open an issue or submit a pull request.

---

<p align="center">Built for secure and scalable task management</p>
