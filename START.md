# FLYXO — How to Run (2 Terminals)

## Error: `ECONNREFUSED` / proxy error

**Frontend chal raha hai, Backend NAHI.**  
Vite `/api` ko `localhost:5000` par bhejta hai — backend band ho to yahi error aata hai.

---

## Step 1 — Backend (pehle yeh start karo)

```bash
cd backend
npm run dev
```

Wait for:
```
✅ Database connected
🚀 FLYXO API running on http://localhost:5000
```

Test: http://localhost:5000/api/health → `"database": "connected"`

---

## Step 2 — Frontend (alag terminal)

```bash
cd frontend
npm run dev
```

Open: http://localhost:5173 (ya jo port Vite dikhaye — 5174 bhi chalega)

**Backend terminal band mat karo.** Agar `app crashed` dikhe, dubara `npm run dev` chalao.

---

## Login (after seed)

| Email | Password |
|-------|----------|
| user@flyxo.com | user123 |

First time DB setup:
```bash
cd backend
npm run db:setup
```
