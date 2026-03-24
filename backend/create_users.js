require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('./config/db');
require('./models/User');

const User = mongoose.model('User');

async function createUsers() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create admin
    let admin = await User.findByEmail('sdchandu213@gmail.com');
    if (!admin) {
      await User.create({ name: 'Admin User', email: 'sdchandu213@gmail.com', password: hashedPassword, role: 'admin' });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    // Create HR
    let hr = await User.findByEmail('jagadeeshgokarla67@gmail.com');
    if (!hr) {
      await User.create({ name: 'HR Manager', email: 'jagadeeshgokarla67@gmail.com', password: hashedPassword, role: 'hr_manager' });
      console.log('HR user created');
    } else {
      console.log('HR user already exists');
    }

    // Create employee
    let emp = await User.findByEmail('emp1@enterprisehr.com');
    if (!emp) {
      await User.create({ name: 'Employee 1', email: 'emp1@enterprisehr.com', password: hashedPassword, role: 'employee' });
      console.log('Employee user created');
    } else {
      console.log('Employee user already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createUsers();