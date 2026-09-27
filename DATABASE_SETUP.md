# FLYXO — Database Setup (Fix P1000 Error)

Error `P1000: Authentication failed` means **wrong username/password** in `backend/.env`.

---

## Option A — Docker (Easiest, recommended)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and start it.

2. From project root:
   ```bash
   docker compose up -d
   ```

3. Copy Docker env to backend:
   - Open `backend/.env.docker`
   - Copy all content into `backend/.env` (replace old `DATABASE_URL`)

   Key line:
   ```
   DATABASE_URL="postgresql://postgres:flyxo123@localhost:5433/flyxo_db?schema=public"
   ```
   Note: port **5433** (not 5432) to avoid conflict with existing PostgreSQL.

4. Setup database:
   ```bash
   cd backend
   npx prisma db push
   npm run db:seed
   npm run dev
   ```

   You must see: `✅ Database connected`

---

## Option B — Your existing PostgreSQL (port 5432)

1. Open **pgAdmin** or **SQL Shell (psql)**.

2. Set password for user `postgres` (example in psql):
   ```sql
   ALTER USER postgres WITH PASSWORD 'your_new_password';
   ```

3. Create database:
   ```sql
   CREATE DATABASE flyxo_db;
   ```

4. Edit `backend/.env`:
   ```
   DATABASE_URL="postgresql://postgres:your_new_password@localhost:5432/flyxo_db?schema=public"
   ```

5. Run:
   ```bash
   cd backend
   npx prisma db push
   npm run db:seed
   npm run dev
   ```

---

## Verify

Open: http://localhost:5000/api/health

Should show:
```json
"database": "connected"
```

## Demo login (after seed)

| Email | Password |
|-------|----------|
| user@flyxo.com | user123 |
| admin@flyxo.com | admin123 |
