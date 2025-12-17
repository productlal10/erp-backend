
```markdown
# ERP Backend

This folder contains the **backend** of the ERP application. Follow the steps below to run the backend locally for testing and development.

---

## Prerequisites

Make sure you have the following installed on your computer:

* **Node.js** (v16 or above)
* **npm** (comes with Node.js)
* **Git**
* **PostgreSQL**

> **Note:** Node.js needs to be installed only once on your computer.

---

## Install Required Software

### 1. Install Node.js & npm
Download and install from: [https://nodejs.org](https://nodejs.org)

**Verify installation:**
```bash
node -v
npm -v

```

### 2. Install PostgreSQL

Download from: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)

Make sure the **PostgreSQL service** is running on your machine.

---

## Database Setup

Create a PostgreSQL database named **ERP**:

```sql
CREATE DATABASE ERP;

```

> **Note:** You do NOT need to create tables manually. Sequelize will create tables automatically when the server starts.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone [https://github.com/productlal10/erp-backend.git](https://github.com/productlal10/erp-backend.git)
cd erp-backend

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Environment Setup

Create a file named `.env` inside the **backend** folder and configure your credentials:

```env
DB_NAME=ERP
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_DIALECT=postgres
PORT=4000

```

---

## Run the Backend

```bash
node server2.js

```

The backend will run on: **[http://localhost:4000](https://www.google.com/search?q=http://localhost:4000)**

---

## Verify Backend

* **Database Connection:** Database connects successfully.
* **Auto-Migrations:** Tables are created automatically in PostgreSQL.
* **Terminal:** Backend runs without errors in the terminal.

---

## Common Issues

* **DB connection error** → Double-check your `.env` values (username/password).
* **Database not found** → Ensure the database name in PostgreSQL is exactly **ERP**.
* **Port in use** → Change the `PORT` value in the `.env` file if 4000 is already taken.
