
# ⚡ Smart Energy Monitoring & Billing Platform (IoT)

A full-stack backend system for managing electricity consumption, billing, and analytics for residential societies using IoT-based meter readings.

---

## 🚀 Overview

This project simulates a real-world electricity management system where:

- Meter readings are recorded per flat
- Bills are automatically generated
- Users can track electricity usage
- Admins manage societies and infrastructure

---

## 🧠 Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-Based Access Control (RBAC)
  - USER → access own flat only
  - SOCIETY_ADMIN → manage society
  - BUILDER_ADMIN → full access

---

### 🏢 Core Modules
- Builder Management
- Society Management (with dynamic rate per unit)
- Flat Management
- User Management

---

### ⚡ Meter Reading System
- Add meter readings per flat
- Ensures readings are increasing
- Stores historical data

---

### 💰 Billing System
- Calculates consumption:
units = latest reading - previous reading

- Uses dynamic rate (per society)
- Prevents duplicate bill generation
- Stores billing history

---

### 📊 Dashboard & Analytics
- Total units consumed per flat
- Total billing amount
- Monthly usage (graph-ready API)

---

## 🧰 Tech Stack (PERN)

- **PostgreSQL** → Database  
- **Express.js** → Backend framework  
- **Node.js** → Runtime  
- **Prisma ORM** → Database ORM  

---

## 📁 Project Structure

```bash
backend/
│
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── builder/
│   │   ├── society/
│   │   ├── flat/
│   │   ├── reading/
│   │   ├── billing/
│   │   └── dashboard/
│   │
│   ├── middleware/
│   ├── config/
│   │
│   ├── app.js
│   └── server.js
│
├── prisma/
│   └── schema.prisma
│
├── package.json
├── .env
└── README.md
```
## 🔌 Important API Endpoints

### 🔐 Auth
- POST `/api/auth/register`
- POST `/api/auth/login`

### 🏢 Builder
- POST `/api/builder`

### 🏠 Society
- POST `/api/society`

### 🏢 Flat
- POST `/api/flat`

### ⚡ Reading
- POST `/api/reading`

### 💰 Billing
- GET `/api/billing/:flatId`
- GET `/api/billing/history/:flatId`

### 📊 Dashboard
- GET `/api/dashboard/:flatId`
- GET `/api/dashboard/monthly/:flatId`

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository
```bash
git clone <your-repo-link>
cd backend
```
### 2️⃣ Install Dependencies
```bash
npm install
```
### 3️⃣ Setup Environment Variables
```bash
Create a .env file:
DATABASE_URL=postgresql://user:password@localhost:5432/db_name
JWT_SECRET=your_secret
``` 
### 4️⃣ Run Database Migration
```bash
npx prisma migrate dev
```
### 5️⃣ Start Server
```bash
npm run dev
Server runs at: http://localhost:5000
```
### 🧪 Sample Flow
- Register user
- Login → get JWT token
- Create builder → society → flat
- Add meter readings
- Generate bill
- View dashboard data

### 🎯 Future Improvements
- Frontend (React Dashboard)
- Payment Integration
- Smart IoT Device Integration
- Tier-based billing (slabs)
- Mobile app support

### 👨‍💻 Author
 **Asjad Khan**

### ⭐ Summary
- This project demonstrates:
- Backend system design
- Real-world business logic (billing)
- Database modeling (relations)
- API security (JWT + RBAC)
- Clean modular architecture

