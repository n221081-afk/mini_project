require('dotenv').config({ path: '../.env' });
require('./config/db');

const Department = require('./models/Department');
const Employee = require('./models/Employee');
const User = require('./models/User');

const seedData = async () => {
  try {
    // Clear existing data
    await Department.deleteMany();
    await Employee.deleteMany();
    await User.deleteMany();

    // Seed departments
    const depts = await Department.insertMany([
      { code: 'HR', name: 'Human Resources' },
      { code: 'ENG', name: 'Engineering' },
      { code: 'FIN', name: 'Finance' },
      { code: 'SALES', name: 'Sales' },
      { code: 'OPS', name: 'Operations' }
    ]);

    // Seed employees
    const employees = [];
    const names = [
      { first: 'Alex', last: 'Smith' },
      { first: 'Jamie', last: 'Johnson' },
      { first: 'Taylor', last: 'Williams' },
      { first: 'Jordan', last: 'Brown' },
      { first: 'Morgan', last: 'Jones' },
      { first: 'Casey', last: 'Garcia' },
      { first: 'Skyler', last: 'Miller' },
      { first: 'Riley', last: 'Davis' },
      { first: 'Cameron', last: 'Rodriguez' },
      { first: 'Quinn', last: 'Martinez' }
    ];

    for (let i = 0; i < 10; i++) {
      const name = names[i % names.length];
      employees.push({
        firstName: name.first,
        lastName: name.last + i,
        email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}${i}@example.com`,
        hireDate: new Date(2023, 0, 1 + i),
        department: depts[i % depts.length]._id,
        status: 'active'
      });
    }

    const emps = await Employee.insertMany(employees);

    // Seed users
    const users = [
      { username: 'admin', password: 'password123', role: 'admin', employee: emps[0]._id },
      { username: 'hr_user', password: 'password123', role: 'hr', employee: emps[1]._id },
      { username: 'manager1', password: 'password123', role: 'manager', employee: emps[2]._id }
    ];

    for (let i = 3; i < emps.length; i++) {
      users.push({
        username: `user${i}`,
        password: 'password123',
        role: 'employee',
        employee: emps[i]._id
      });
    }

    await User.insertMany(users);

    console.log('Sample data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();