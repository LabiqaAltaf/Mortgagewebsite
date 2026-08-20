import dotenv from 'dotenv';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Load backend/.env (run from the backend directory via `npm run create-admin`).
dotenv.config();

const passwordRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const rl = readline.createInterface({ input, output });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Add it to backend/.env first.');
    process.exit(1);
  }

  const name = (await rl.question('Admin name: ')).trim();
  const email = (await rl.question('Admin email: ')).trim().toLowerCase();
  const password = await rl.question('Admin password (min 8 characters): ');
  rl.close();

  if (name.length < 2) {
    console.error('Name is required (min 2 characters).');
    process.exit(1);
  }
  if (!passwordRegex.test(email)) {
    console.error('A valid email is required.');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    const passwordHash = await bcrypt.hash(password, 10);

    const existing = await User.findOne({ email });

    if (existing) {
      existing.name = name;
      existing.role = 'admin'; // SECURITY: set server-side only
      existing.isVerified = true;
      existing.status = 'active';
      existing.passwordHash = passwordHash;
      await existing.save();
      console.log(`\nAdmin account updated: ${name} <${email}> (role: admin)`);
    } else {
      await User.create({
        name,
        email,
        passwordHash,
        role: 'admin',
        isVerified: true,
        status: 'active',
      });
      console.log(`\nAdmin account created: ${name} <${email}> (role: admin)`);
    }

    console.log('You can now log in at /admin/login.');
  } catch (err) {
    console.error('Failed to create admin:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

main();