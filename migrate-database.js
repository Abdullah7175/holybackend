import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Old cluster connection (with database name)
const OLD_MONGO_URI = 'mongodb+srv://harryat5555_db_user:8H6LTAgxcuyZ9GgP@cluster0.vjjpkkd.mongodb.net/mtumrah-portal?retryWrites=true&w=majority&appName=Cluster0';

// New cluster connection (with database name)
// Note: If no database name is specified, MongoDB uses 'test' as default
// We need to specify the database name explicitly
const NEW_MONGO_URI = 'mongodb+srv://abdullah7175_db_user:Jr5IDKQv4hPMZOIJ@holytravel-cluster.wni0vvg.mongodb.net/holytravel-portal?retryWrites=true&w=majority&appName=holytravel-cluster';

let oldConnection, newConnection;

async function connectDatabases() {
  try {
    console.log('🔌 Connecting to old database...');
    oldConnection = await mongoose.createConnection(OLD_MONGO_URI).asPromise();
    console.log('✅ Connected to old database');

    console.log('🔌 Connecting to new database...');
    newConnection = await mongoose.createConnection(NEW_MONGO_URI).asPromise();
    console.log('✅ Connected to new database');
  } catch (error) {
    console.error('❌ Connection error:', error);
    throw error;
  }
}

async function migrateCollection(collectionName) {
  try {
    console.log(`\n📦 Migrating collection: ${collectionName}...`);
    
    const oldCollection = oldConnection.db.collection(collectionName);
    const newCollection = newConnection.db.collection(collectionName);
    
    // Get all documents from old collection
    const documents = await oldCollection.find({}).toArray();
    console.log(`   Found ${documents.length} documents`);
    
    if (documents.length === 0) {
      console.log(`   ⚠️  No documents to migrate`);
      return;
    }
    
    // Insert documents into new collection
    if (documents.length > 0) {
      // Clear existing data in new collection (optional - comment out if you want to keep existing data)
      await newCollection.deleteMany({});
      console.log(`   🗑️  Cleared existing data in new collection`);
      
      // Insert all documents
      await newCollection.insertMany(documents);
      console.log(`   ✅ Migrated ${documents.length} documents`);
    }
  } catch (error) {
    console.error(`   ❌ Error migrating ${collectionName}:`, error.message);
  }
}

async function migrateAll() {
  try {
    await connectDatabases();
    
    // Get all collection names from old database
    const collections = await oldConnection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).filter(name => !name.startsWith('system.'));
    
    console.log(`\n📋 Found ${collectionNames.length} collections to migrate:`);
    collectionNames.forEach(name => console.log(`   - ${name}`));
    
    // Migrate each collection
    for (const collectionName of collectionNames) {
      await migrateCollection(collectionName);
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Collections migrated: ${collectionNames.length}`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (oldConnection) {
      await oldConnection.close();
      console.log('\n🔌 Closed old database connection');
    }
    if (newConnection) {
      await newConnection.close();
      console.log('🔌 Closed new database connection');
    }
    process.exit(0);
  }
}

// Run migration
migrateAll();

