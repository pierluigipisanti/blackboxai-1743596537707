require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Slot = require('./models/Slot');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create test user
    const hashedPassword = await bcrypt.hash(process.env.TEST_PASSWORD, 10);
    const user = new User({
      email: process.env.TEST_EMAIL,
      password: hashedPassword,
      role: 'admin'
    });
    await user.save();
    console.log('Test user created');

    // Create sample slots
    const now = new Date();
    const slots = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      
      for (let h = 9; h < 17; h++) {
        const startTime = new Date(date);
        startTime.setHours(h, 0, 0, 0);
        
        const endTime = new Date(date);
        endTime.setHours(h + 1, 0, 0, 0);
        
        slots.push(new Slot({
          startTime,
          endTime
        }));
      }
    }

    await Slot.insertMany(slots);
    console.log(`${slots.length} slots created`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();