// scripts/check-users.js
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Agent from '../models/Agent.js';

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
    console.log(`   URI: ${uri.substring(0, 50)}...`);
    await mongoose.connect(uri);
    console.log('✅ Connected to database');
    console.log(`   Database: ${mongoose.connection.db.databaseName}\n`);

    // Check Users collection
    console.log('📋 Checking Users collection...');
    const users = await User.find({}).select('+passwordHash').lean();
    console.log(`   Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email}`);
      console.log(`      Name: ${user.name}`);
      console.log(`      Role: ${user.role}`);
      console.log(`      ID: ${user._id}`);
      console.log(`      Has Password Hash: ${!!user.passwordHash}`);
      console.log('');
    });

    // Check Agents collection
    console.log('📋 Checking Agents collection...');
    const agents = await Agent.find({}).select('+passwordHash').lean();
    console.log(`   Found ${agents.length} agents:\n`);
    
    agents.forEach((agent, index) => {
      console.log(`   ${index + 1}. ${agent.email}`);
      console.log(`      Name: ${agent.name}`);
      console.log(`      Role: ${agent.role || 'agent'}`);
      console.log(`      ID: ${agent._id}`);
      console.log(`      Has Password Hash: ${!!agent.passwordHash}`);
      console.log('');
    });

    // Test password for specific user if provided
    const testEmail = process.argv[2];
    const testPassword = process.argv[3];
    
    if (testEmail && testPassword) {
      console.log(`\n🔐 Testing password for: ${testEmail}`);
      
      // Try User model first
      const user = await User.findOne({ email: testEmail }).select('+passwordHash');
      if (user) {
        console.log(`   Found in Users collection`);
        const match = await bcrypt.compare(testPassword, user.passwordHash);
        console.log(`   Password match: ${match ? '✅ YES' : '❌ NO'}`);
        if (!match) {
          console.log(`   ⚠️  Password does not match!`);
        }
      } else {
        // Try Agent model
        const agent = await Agent.findOne({ email: testEmail }).select('+passwordHash');
        if (agent) {
          console.log(`   Found in Agents collection`);
          const match = await bcrypt.compare(testPassword, agent.passwordHash);
          console.log(`   Password match: ${match ? '✅ YES' : '❌ NO'}`);
          if (!match) {
            console.log(`   ⚠️  Password does not match!`);
          }
        } else {
          console.log(`   ❌ User/Agent not found with email: ${testEmail}`);
        }
      }
    } else {
      console.log('\n💡 Tip: To test a password, run:');
      console.log('   node scripts/check-users.js <email> <password>');
    }

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error(err.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
})();

