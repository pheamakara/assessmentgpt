# Family Budget App (React + React Native + Node.js)

## 1. System Architecture Overview
- **Clients**: React (Web) + React Native (Expo) for iOS/Android.
- **Backend API**: Node.js + Express (TypeScript) with JWT auth and bcrypt password hashing.
- **Data**: PostgreSQL as primary store, with local offline stores (IndexedDB on Web, AsyncStorage queue on mobile) for offline-first transactions.
- **Sync**: Clients queue offline writes and automatically sync when online (last-write-wins on server timestamps).

## 2. Folder Structure
```
backend/              # Express API + PostgreSQL integration
frontend/             # React web app (Vite)
mobile/               # Expo React Native app
```

## 3. Source Code
### Backend (Node.js + Express)
- `backend/src/index.ts` - Express app, routes, middleware.
- `backend/src/routes/*.ts` - Auth, budgets, transactions, settings.
- `backend/schema.sql` - PostgreSQL schema for all required tables.

### Frontend (React Web)
- `frontend/src/App.tsx` - Routes and navigation.
- `frontend/src/db/localDb.ts` - IndexedDB (Dexie) offline queue.
- `frontend/src/hooks/useSync.ts` - Syncs queued transactions when online.
- `frontend/src/hooks/useActiveBudget.ts` - Loads the user's active budget.

### Mobile (React Native / Expo)
- `mobile/App.tsx` - Stack navigation.
- `mobile/src/storage/localStore.ts` - AsyncStorage queue for offline transactions.
- `mobile/src/hooks/useActiveBudget.ts` - Loads the user's active budget.

## 4. Database SQL
See `backend/schema.sql` for full PostgreSQL schema covering:
- users
- budgets
- budget_users
- budget_invites
- exchange_rates
- categories
- transactions
- recurring_transactions
- user_settings

## 5. Commands (Local Dev)
### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Web Frontend
```bash
cd frontend
npm install
npm run dev
```

### Mobile (Expo)
```bash
cd mobile
npm install
npm run start
```

## 6. Deployment (Ubuntu VPS)
1. Provision PostgreSQL and create a database user.
2. Copy `backend/.env.example` to `.env` and configure `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`.
3. Build and run the backend:
   ```bash
   npm install
   npm run build
   node dist/index.js
   ```
4. **systemd** service example:
   ```ini
   [Unit]
   Description=Family Budget API
   After=network.target

   [Service]
   WorkingDirectory=/var/www/family-budget/backend
   ExecStart=/usr/bin/node dist/index.js
   Restart=always
   Environment=NODE_ENV=production
   EnvironmentFile=/var/www/family-budget/backend/.env

   [Install]
   WantedBy=multi-user.target
   ```
5. **Nginx** reverse proxy and SSL (Let’s Encrypt):
   ```nginx
   server {
     listen 80;
     server_name budget.example.com;

     location / {
       proxy_pass http://localhost:4000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

## 7. Offline Sync Strategy
- **Web**: IndexedDB stores queued transactions as `pending`. When the device reconnects, `useSync` posts them to `/api/budgets/:id/transactions` and marks them `synced`.
- **Mobile**: AsyncStorage keeps a queue in `localStore`. When online, the app flushes queued transactions (last-write-wins by server `updated_at`).

## 8. API Notes
- `GET /api/budgets/active` returns the most recent budget for the current user.
- `GET /api/budgets/:id/categories` and `POST /api/budgets/:id/categories` manage custom categories.
- `POST /api/auth/refresh` re-issues a JWT for an authenticated user.

## 9. Security Considerations
- Passwords are hashed with bcrypt before storage.
- JWTs are required for protected routes and should be stored securely.
- CORS is restricted via environment configuration.
- Role-based access enforced via budget membership (owner vs member).
- Input validation uses Zod for payloads.
