// scripts/create-admin.js
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

let uri = process.env.MONGO_URI;
if (!uri) {
  console.error('❌ MONGO_URI missing in .env');
  process.exit(1);
}

// Ensure database name is in the URI
// Pattern: mongodb+srv://user:pass@host/dbname?query
const uriMatch = uri.match(/^(mongodb\+srv:\/\/[^@]+@[^/]+)(\/([^?]+))?(\?.*)?$/);
if (uriMatch) {
  const basePart = uriMatch[1]; // mongodb+srv://user:pass@host
  const dbName = uriMatch[3]; // database name if exists
  const queryString = uriMatch[4] || ''; // ?query=string
  
  // If no database name found, add it before the query string
  if (!dbName) {
    uri = basePart + '/holytravel-portal' + queryString;
    console.log('⚠️  Database name not found in URI, using: holytravel-portal');
  }
}

(async () => {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(uri);
    console.log('✅ Connected to database');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);

    // Get email and password from command line args or use defaults
    const email = process.argv[2] || 'admin@holytravel.com';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Admin';

    console.log(`\n📝 Creating/updating admin user...`);
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Find or create user
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { 
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'admin',
        name: name,
        isActive: true
      },
      { 
        upsert: true, 
        new: true, 
        setDefaultsOnInsert: true 
      }
    );

    console.log('\n✅ Admin user created/updated successfully!');
    console.log(`   ID: ${user._id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`\n🔑 You can now login with:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.code === 11000) {
      console.error('   Duplicate email - user might already exist');
    }
    await mongoose.disconnect();
    process.exit(1);
  }
})();

