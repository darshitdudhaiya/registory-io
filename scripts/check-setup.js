const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

async function checkSetup() {
  console.log('========================================');
  console.log('       REGISTRY SYSTEM HEALTH CHECK     ');
  console.log('========================================\n');

  const envPath = path.join(__dirname, '../.env.local');

  if (!fs.existsSync(envPath)) {
    console.log('❌ Error: .env.local file is missing!');
    console.log('   Please create one or check the directory structure.\n');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      envVars[key] = value;
    }
  });

  const uri = envVars['MONGODB_URI'];
  const secret = envVars['JWT_SECRET'];

  if (!secret || secret.includes('super_secret_session_token_key_12938479182374')) {
    console.log('⚠️  Warning: JWT_SECRET is using the default placeholder.');
    console.log('   Consider replacing it with a secure random string for production.');
  } else {
    console.log('✅ JWT_SECRET: Configured');
  }

  if (!uri || uri.includes('cluster.xxxx.mongodb.net') || uri.includes('username:password')) {
    console.log('❌ Error: MONGODB_URI is using the placeholder template!');
    console.log('   Please replace it with your actual MongoDB Atlas connection string in .env.local');
    console.log('   Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority\n');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB...');
  try {
    const start = Date.now();
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connection: SUCCESS (took ${Date.now() - start}ms)`);
    await mongoose.disconnect();
    console.log('\n🎉 System is ready! Run "npm run dev" to start the application.');
  } catch (error) {
    console.log('\n❌ MongoDB Connection: FAILED');
    console.log(`   Details: ${error.message}\n`);
    console.log('   Please double-check:');
    console.log('   1. Username and password in your MONGODB_URI.');
    console.log('   2. Network access - is IP Access Control enabled in MongoDB Atlas (allow access from anywhere)?');
    console.log('   3. Special characters in username/password are URL encoded (e.g. "@" as "%40").\n');
    process.exit(1);
  }
}

checkSetup();
