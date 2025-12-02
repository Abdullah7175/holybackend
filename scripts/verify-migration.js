// scripts/verify-migration.js
import 'dotenv/config';
import mongoose from 'mongoose';

const OLD_MONGO_URI = 'mongodb+srv://harryat5555_db_user:8H6LTAgxcuyZ9GgP@cluster0.vjjpkkd.mongodb.net/mtumrah-portal?retryWrites=true&w=majority&appName=Cluster0';
const NEW_MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://abdullah7175_db_user:Jr5IDKQv4hPMZOIJ@holytravel-cluster.wni0vvg.mongodb.net/holytravel-portal?retryWrites=true&w=majority&appName=holytravel-cluster';

let oldConnection, newConnection;

async function verifyMigration() {
  try {
    console.log('🔌 Connecting to old database...');
    oldConnection = await mongoose.createConnection(OLD_MONGO_URI).asPromise();
    console.log('✅ Connected to old database');
    console.log(`   Database: ${oldConnection.db.databaseName}`);

    console.log('\n🔌 Connecting to new database...');
    // Ensure database name is in the URI
    let newUri = NEW_MONGO_URI;
    if (!newUri.includes('/holytravel-portal') && !newUri.includes('/test')) {
      // Add database name if not present
      newUri = newUri.replace('mongodb+srv://', 'mongodb+srv://');
      if (newUri.includes('@')) {
        const parts = newUri.split('@');
        const afterAt = parts[1];
        if (!afterAt.includes('/')) {
          newUri = newUri.replace('@', '/holytravel-portal@');
        } else {
          // Database name might be in query string, check
          const dbMatch = afterAt.match(/\/([^?]+)/);
          if (!dbMatch || dbMatch[1] === '') {
            newUri = newUri.replace(/@([^?]+)/, '@holytravel-portal');
          }
        }
      }
    }
    
    newConnection = await mongoose.createConnection(newUri).asPromise();
    console.log('✅ Connected to new database');
    console.log(`   Database: ${newConnection.db.databaseName}`);
    console.log(`   URI used: ${newUri.substring(0, 50)}...`);

    // Check collections in old database
    console.log('\n📋 Old Database Collections:');
    const oldCollections = await oldConnection.db.listCollections().toArray();
    const oldCollectionNames = oldCollections.map(c => c.name).filter(name => !name.startsWith('system.'));
    console.log(`   Found ${oldCollectionNames.length} collections:`);
    oldCollectionNames.forEach(name => {
      console.log(`   - ${name}`);
    });

    // Check document counts in old database
    console.log('\n📊 Old Database Document Counts:');
    for (const collName of oldCollectionNames) {
      const count = await oldConnection.db.collection(collName).countDocuments();
      console.log(`   ${collName}: ${count} documents`);
    }

    // Check collections in new database
    console.log('\n📋 New Database Collections:');
    const newCollections = await newConnection.db.listCollections().toArray();
    const newCollectionNames = newCollections.map(c => c.name).filter(name => !name.startsWith('system.'));
    console.log(`   Found ${newCollectionNames.length} collections:`);
    newCollectionNames.forEach(name => {
      console.log(`   - ${name}`);
    });

    // Check document counts in new database
    console.log('\n📊 New Database Document Counts:');
    if (newCollectionNames.length === 0) {
      console.log('   ⚠️  No collections found in new database!');
      console.log('   This means the migration did not work or data was not migrated.');
    } else {
      for (const collName of newCollectionNames) {
        const count = await newConnection.db.collection(collName).countDocuments();
        console.log(`   ${collName}: ${count} documents`);
      }
    }

    // Compare
    console.log('\n🔍 Comparison:');
    for (const collName of oldCollectionNames) {
      const oldCount = await oldConnection.db.collection(collName).countDocuments();
      const newCount = newCollectionNames.includes(collName) 
        ? await newConnection.db.collection(collName).countDocuments()
        : 0;
      
      const status = oldCount === newCount ? '✅' : '❌';
      console.log(`   ${status} ${collName}: Old=${oldCount}, New=${newCount}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('IP')) {
      console.error('   ⚠️  Make sure your IP is whitelisted in MongoDB Atlas');
    }
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

verifyMigration();

