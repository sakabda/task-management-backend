# 🚀 Task Flow: Enterprise Task Management Backend

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**Task Flow** is a high-performance, modular backend engine designed for modern task management applications. Built with a focus on type safety, scalability, and developer experience, it provides a robust foundation for building enterprise-grade project management tools.

---

## ✨ Key Features

### 🔐 Security & Access Control
- **Advanced Auth**: Secure user registration and login with `bcryptjs` password hashing.
- **JWT Authorization**: Stateless session management with JSON Web Tokens.
- **RBAC (Role-Based Access Control)**: Granular permissions for Admins and Users.

### 📁 Project & Task Orchestration
- **Modular Projects**: Group tasks into projects for better organization.
- **Dynamic Tasks**: Comprehensive task attributes including title, description, priority (`LOW`, `MEDIUM`, `HIGH`), and status (`TODO`, `IN_PROGRESS`, `DONE`).
- **Seamless Assignments**: Delegate tasks to team members with automated notifications.

### 🤝 Collaboration & Transparency
- **Interactive Comments**: Task-level discussions to keep team communication in context.
- **Automated Activity Logs**: A forensic record of every action (Create, Update, Delete, Assign) across the system.
- **Instant Notifications**: Real-time alerts for task updates and assignments.

### 📊 System Intelligence
- **Analytics Dashboard**: Get high-level insights into task distribution and project health.
- **Optimized Queries**: Efficient data retrieval powered by Prisma and PostgreSQL.

---

## 🛠 Tech Stack

- **Framework**: [Express.js](https://expressjs.com/) - Fast, unopinionated, minimalist web framework.
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript for reliable development.
- **ORM**: [Prisma](https://www.prisma.io/) - Next-generation Node.js and TypeScript ORM.
- **Database**: [PostgreSQL](https://www.postgresql.org/) - The world's most advanced open-source relational database.
- **Validation**: [Zod](https://zod.dev/) - TypeScript-first schema declaration and validation.
- **Security**: [Helmet](https://helmetjs.github.io/), [Express Rate Limit](https://www.npmjs.com/package/express-rate-limit).

---

## 🚀 Getting Started

### 📋 Prerequisites

- **Node.js**: v18.x or later
- **PostgreSQL**: v14.x or later
- **npm** or **pnpm** (preferred)

### 🛠 Installation & Setup

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd task-management-backend
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   # Database Connection
   DATABASE_URL="postgresql://johndoe:mypassword@localhost:5432/taskflow_db?schema=public"

   # Security
   JWT_SECRET="generate_a_strong_secret_here"
   JWT_EXPIRES_IN="7d"

   # Server
   PORT=5000
   ```

3. **Initialize Database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Launch Application**
   ```bash
   # Development Mode (Hot Reload)
   npm run dev

   # Production Build
   npm run build
   npm start
   ```

---

## 📂 Project Architecture

```bash
src/
├── modules/           # Domain-driven feature modules
│   ├── auth/          # Authentication engine
│   ├── task/          # Task management core
│   ├── project/       # Project organization
│   ├── activity-log/  # System audit trails
│   └── ...            # Other modular domains
├── middlewares/       # Security, Validation, and Global Error handlers
├── prisma/            # Shared Prisma Client instance
├── utils/             # Reusable business logic & helpers
└── app.ts             # Application configuration
```

---

## 📡 API Overview

The API is accessible under the `/api` prefix.

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/auth/register` | `POST` | Create a new user account |
| `/tasks` | `GET/POST` | Manage task inventory |
| `/projects` | `GET/POST` | Manage collaborative projects |
| `/dashboard` | `GET` | Retrieve system-wide statistics |

---

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

---


<p align="center">Made with ❤️ for productive teams</p>
