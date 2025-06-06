# 🌙 Dream Log

Dream Log is a simple fullstack web application for logging your dreams. Write down your dreams, store them, and view them later — all with a clean and minimal setup using modern web tools.

---

## ✨ Features

- 📝 Submit dreams via a simple frontend form
- 📬 Dreams are saved via an Express + Prisma backend
- 💾 Stored in a PostgreSQL database
- 📃 View all dreams in reverse chronological order
- 🔧 Built with TypeScript for both client and server

---

## 🛠️ Tech Stack

| Layer      | Technology           |
|------------|----------------------|
| Frontend   | React + TypeScript   |
| Backend    | Express + TypeScript |
| ORM        | Prisma               |
| Database   | PostgreSQL           |
| Dev Tools  | Nodemon, ts-node     |

---

## 🚀 Getting Started

---

### 1. Clone the repository

git clone https://github.com/avaburnham/dream-log.git
cd dream-log

---

### 2. Install Dependencies
bash
npm install

---

### 3. Set up the database
DATABASE_URL=postgresql://youruser:yourpassword@localhost:5432/dreamlog

### run the Prisma migration:
npx prisma migrate dev --name init

### 4. Start the backend server
npm run dev

## 🧪  API Endpoints
GET /dreams
Returns all dreams in reverse chronological order.

POST /dreams
Creates a new dream.