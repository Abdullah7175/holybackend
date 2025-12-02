# Database Migration Instructions

## Step 1: Update Environment Variables

Create or update your `.env` file in the `mtumrah-backend-final` directory with the new MongoDB connection string:

```
MONGO_URI=mongodb+srv://abdullah7175_db_user:Jr5IDKQv4hPMZOIJ@holytravel-cluster.wni0vvg.mongodb.net/holytravel-portal?retryWrites=true&w=majority
```

**Important:** Make sure to add this to your `.env` file. The `db.js` file reads from `process.env.MONGO_URI`.

## Step 2: Run the Migration Script

The migration script will copy all data from the old cluster to the new cluster.

```bash
cd mtumrah-backend-final
npm run migrate
```

This will:
- Connect to the old database (mtumrah-portal)
- Connect to the new database (holytravel-portal)
- Copy all collections and their data
- Clear existing data in the new database before migration (to avoid duplicates)

## Step 3: Verify Migration

After migration, verify that:
1. All collections were migrated
2. Document counts match between old and new databases
3. Test the application to ensure data is accessible

## Step 4: Update Application

Once migration is complete and verified:
1. Update your `.env` file with the new `MONGO_URI`
2. Restart your backend server
3. Test all functionality

## Notes

- The migration script will DELETE all existing data in the new database before copying
- Make sure to backup your data before running migration
- The script connects to both databases simultaneously
- All collections (except system collections) will be migrated

