import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import TeamMember from '../models/TeamMember.js';

dotenv.config();

const members = [
  ['James Carter', 'Senior Mortgage Advisor', 'https://randomuser.me/api/portraits/men/32.jpg'],
  ['Sophie Bennett', 'Mortgage Advisor', 'https://randomuser.me/api/portraits/women/44.jpg'],
  ['Oliver Hayes', 'Lead Underwriter', 'https://randomuser.me/api/portraits/men/45.jpg'],
  ['Amelia Turner', 'Advisor', 'https://randomuser.me/api/portraits/women/68.jpg'],
  ['Daniel Price', 'Senior Advisor', 'https://randomuser.me/api/portraits/men/75.jpg'],
  ['Charlotte Reid', 'Compliance Officer', 'https://randomuser.me/api/portraits/women/65.jpg'],
  ['Harry Lawson', 'Mortgage Consultant', 'https://randomuser.me/api/portraits/men/11.jpg'],
  ['Isabella Moore', 'Client Success Manager', 'https://randomuser.me/api/portraits/women/29.jpg'],
];

try {
  await connectDB();
  for (const [displayOrder, [name, role, image]] of members.entries()) {
    const insertOperation = {};
    insertOperation[String.fromCharCode(36) + 'setOnInsert'] = { name, role, image, description: '', displayOrder, active: true };
    await TeamMember.updateOne({ name }, insertOperation, { upsert: true });
  }
  console.log('Team member sync complete.');
  process.exit(0);
} catch (error) {
  console.error('Team member sync failed:', error.message);
  process.exit(1);
}
