# ⚡ Smart Energy Monitoring & Billing Platform (IoT)

A full-stack backend system for managing electricity consumption, billing, and analytics for residential societies using IoT-based meter readings.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
  - USER
  - SOCIETY_ADMIN
  - BUILDER_ADMIN

---

### 🏢 Core Modules
- Builder Management
- Society Management
- Flat Management
- User Management

---

### ⚡ Meter Reading System
- Add meter readings per flat
- Chronological tracking of readings
- Validation to prevent invalid readings

---

### 💰 Billing System
- Automatic bill generation using meter readings
- Dynamic rate per society
- Prevent duplicate bill generation
- Stores billing history

---

### 📊 Dashboard & Analytics
- Total consumption per flat
- Total billing amount
- Monthly usage data (graph-ready API)

---

## 🧠 Tech Stack (PERN)

- **PostgreSQL** → Database  
- **Express.js** → Backend framework  
- **Node.js** → Runtime  
- **Prisma ORM** → Database access  

---

## 📁 Project Structure
backend/
src/
modules/
auth/
builder/
society/
flat/
reading/
billing/
dashboard/
middleware/
config/


---

## 🔌 API Endpoints (Important)

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`

### Builder
- CRUD `/api/builder`

### Society
- CRUD `/api/society`

### Flat
- CRUD `/api/flat`

### Reading
- POST `/api/reading`

### Billing
- GET `/api/billing/:flatId`
- GET `/api/billing/history/:flatId`

### Dashboard
- GET `/api/dashboard/:flatId`
- GET `/api/dashboard/monthly/:flatId`

---

## ⚙️ Setup Instructions

### 1. Clone Repo
```bash
git clone <your-repo-link>
cd backend
2. Install Dependencies
npm install
3. Setup Environment Variables
Create .env:

DATABASE_URL=postgresql://user:password@localhost:5432/db_name
JWT_SECRET=your_secret
4. Run Migration
npx prisma migrate dev
5. Start Server
npm run dev
Server runs at:

http://localhost:5000
🧪 Sample Flow
Register user

Login → get token

Create builder → society → flat

Add meter readings

Generate bill

View dashboard & analytics

🎯 Future Improvements
Frontend (React Dashboard)

Role-based UI

Graph enhancements

Rate slabs (tier pricing)

Payment integration

👨‍💻 Author
Asjad Khan
