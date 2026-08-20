import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Testimonial from '../models/Testimonial.js';

dotenv.config();
const testimonials = [
  { name: 'Sarah Mitchell', info: 'First-time buyer · Manchester', rating: 5, avatar: 'https://randomuser.me/api/portraits/women/12.jpg', text: 'The whole process was completely stress-free. They found me a brilliant deal and kept me informed every single step of the way.' },
  { name: 'David Thompson', info: 'Remortgage · Leeds', rating: 5, avatar: 'https://randomuser.me/api/portraits/men/22.jpg', text: 'Honest, friendly and incredibly efficient. They saved me a significant amount compared to my previous lender.' },
  { name: 'Priya Sharma', info: 'Buy-to-let · Birmingham', rating: 5, avatar: 'https://randomuser.me/api/portraits/women/33.jpg', text: 'Even with a fairly complicated case, they found a solution when other brokers said it was impossible. Highly recommended.' },
  { name: 'Mark Williams', info: 'Moving home · Bristol', rating: 5, avatar: 'https://randomuser.me/api/portraits/men/51.jpg', text: 'Professional from start to finish. They handled everything and we moved into our dream home without any drama.' },
];
try {
  await connectDB();
  for (const item of testimonials) await Testimonial.updateOne({ name: item.name }, { $setOnInsert: { ...item, verified: true, active: true } }, { upsert: true });
  console.log('Testimonial sync complete.');
  process.exit(0);
} catch (error) { console.error(error.message); process.exit(1); }
