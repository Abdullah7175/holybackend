# Fix Your .env File

## Problem
Your `.env` file has `MONGO_URI` without a database name. This causes the app to connect to the wrong database (or default "test" database).

## Current (WRONG):
```env
MONGO_URI=mongodb+srv://abdullah7175_db_user:Jr5IDKQv4hPMZOIJ@holytravel-cluster.wni0vvg.mongodb.net/?retryWrites=true&w=majority&appName=holytravel-cluster
```

## Fixed (CORRECT):
```env
MONGO_URI=mongodb+srv://abdullah7175_db_user:Jr5IDKQv4hPMZOIJ@holytravel-cluster.wni0vvg.mongodb.net/holytravel-portal?retryWrites=true&w=majority&appName=holytravel-cluster
```

**Notice:** Added `/holytravel-portal` before the `?` in the connection string.

## Steps to Fix:

1. **Update your `.env` file:**
   ```env
   MONGO_URI=mongodb+srv://abdullah7175_db_user:Jr5IDKQv4hPMZOIJ@holytravel-cluster.wni0vvg.mongodb.net/holytravel-portal?retryWrites=true&w=majority&appName=holytravel-cluster
   ```

2. **Run migration again:**
   ```bash
   npm run migrate
   ```

3. **Verify migration:**
   ```bash
   npm run verify-migration
   ```

4. **Check users:**
   ```bash
   npm run check-users
   ```

5. **Create admin if needed:**
   ```bash
   npm run create-admin admin@mtumrah.com StrongPass#2025! Admin
   ```

## Complete .env File (Recommended):

```env
NODE_ENV=development
JWT_SECRET=yourStrongSecretKey
DEFAULT_COMPANY_ID=68ca6b8ecf042c6674756403
ADMIN_EMAIL=admin@mtumrah.app
ADMIN_PASSWORD=StrongPass#2025!
ADMIN_NAME=Super Admin
PORT=7000
HOST=0.0.0.0

# MongoDB Connection (WITH database name)
MONGO_URI=mongodb+srv://abdullah7175_db_user:Jr5IDKQv4hPMZOIJ@holytravel-cluster.wni0vvg.mongodb.net/holytravel-portal?retryWrites=true&w=majority&appName=holytravel-cluster

CORS_ORIGIN=https://booking.holytravelsandtour.com,http://booking.holytravelsandtour.com:7000,http://localhost:5173,http://127.0.0.1:5173
CLIENT_ORIGIN=https://booking.holytravelsandtour.com,http://localhost:5173
```

## Why This Matters:

- **Without database name:** MongoDB connects to default "test" database
- **With database name:** MongoDB connects to "holytravel-portal" database
- **Migration script** uses "holytravel-portal" database
- **Your app** must also use "holytravel-portal" to see the migrated data

