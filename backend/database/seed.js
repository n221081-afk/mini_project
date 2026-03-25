require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('../config/db');

// Require models to register schemas
require('../models/User');
require('../models/Department');
require('../models/Employee');
require('../models/Attendance');
require('../models/Leave');
require('../models/Payroll');
require('../models/Recruitment');
require('../models/Performance');

const User = mongoose.model('User');
const Department = mongoose.model('Department');
const Employee = mongoose.model('Employee');
const Attendance = mongoose.model('Attendance');
const Leave = mongoose.model('Leave');
const Payroll = mongoose.model('Payroll');
const Recruitment = mongoose.model('Recruitment');
const Performance = mongoose.model('Performance');

const departments = [
  { name: 'Engineering', code: 'ENG' },
  { name: 'HR', code: 'HR' },
  { name: 'Finance', code: 'FIN' },
  { name: 'Marketing', code: 'MKT' },
  { name: 'Operations', code: 'OPS' }
];
const firstNames = ['John', 'Jane', 'Robert', 'Emily', 'Michael', 'Sarah', 'David', 'Lisa', 'James', 'Maria', 'William', 'Jennifer', 'Richard', 'Linda', 'Thomas', 'Patricia'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Taylor'];
const designations = ['Software Engineer', 'Senior Developer', 'HR Manager', 'Accountant', 'Marketing Executive', 'Operations Manager', 'Team Lead', 'Analyst'];

async function seed() {
  try {
    // Clear existing data
    await Department.deleteMany();
    await Employee.deleteMany();
    await User.deleteMany();
    await Attendance.deleteMany();
    await Leave.deleteMany();
    await Payroll.deleteMany();
    await Recruitment.deleteMany();
    await Performance.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 10);

    let adminUser = await User.findByEmail('sdchandu213@gmail.com');
    if (!adminUser) await User.create({ name: 'Admin User', email: 'sdchandu213@gmail.com', password: hashedPassword, role: 'admin' });
    else await User.update(adminUser._id, { password: hashedPassword });
    adminUser = await User.findByEmail('sdchandu213@gmail.com');

    let hrUser = await User.findByEmail('jagadeeshgokarla67@gmail.com');
    if (!hrUser) await User.create({ name: 'HR Manager', email: 'jagadeeshgokarla67@gmail.com', password: hashedPassword, role: 'hr_manager' });
    else await User.update(hrUser._id, { password: hashedPassword });

    const deptIds = [];
    for (const deptData of departments) {
      let dept = await Department.findOne({ name: deptData.name });
      if (!dept) dept = await Department.create({ name: deptData.name, code: deptData.code });
      deptIds.push(dept._id);
    }

    for (let i = 1; i <= 30; i++) {
      const fn = firstNames[(i - 1) % firstNames.length];
      const ln = lastNames[(i - 1) % lastNames.length];
      const email = `emp${i}@enterprisehr.com`;
      let user = await User.findByEmail(email);
      if (!user) {
        const userId = await User.create({ name: `${fn} ${ln}`, email, password: hashedPassword, role: 'employee' });
        user = { _id: userId };
      } else {
        user = { _id: user._id || user.id };
      }
      const exists = await Employee.findOne({ email });
      if (!exists) {
        await Employee.create({
          user: user._id,
          employee_code: `EMP${String(i).padStart(4, '0')}`,
          first_name: fn,
          last_name: ln,
          email,
          phone: `9876543${String(i).padStart(3, '0')}`,
          department: deptIds[(i - 1) % deptIds.length],
          designation: designations[i % designations.length],
          salary: 30000 + Math.floor(Math.random() * 70000),
          join_date: new Date(2023, i % 12, 1),
          status: 'active'
        });
      }
    }

    const employees = await Employee.find({ status: 'active' }).select('_id').limit(30).lean();
    const empIds = employees.map(e => e._id);

    const now = new Date();

    for (const empId of empIds.slice(0, 25)) {
      for (let m = 0; m < 3; m++) {
        const baseDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const daysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
        for (let d = 1; d <= Math.min(daysInMonth, 22); d++) {
          const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), d);
          if (date.getDay() !== 0 && date.getDay() !== 6) {
            const dateStr = date.toISOString().split('T')[0];
            const startOfDay = new Date(dateStr + 'T00:00:00');
            await Attendance.findOneAndUpdate(
              { employee: empId, date: { $gte: startOfDay, $lte: new Date(dateStr + 'T23:59:59.999') } },
              {
                $set: {
                  employee: empId,
                  date: startOfDay,
                  status: 'present',
                  clock_in: '09:00:00',
                  clock_out: '18:00:00'
                }
              },
              { upsert: true }
            );
          }
        }
      }
    }

    const empList = await Employee.find({ status: 'active' }).select('_id salary').lean();
    
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    for (const emp of empList) {
      for (const month of [prevMonth, currentMonth]) {
        const basic = emp.salary;
        const hra = Math.round(basic * 0.2);
        const gross = basic + hra;
        const pf = Math.round(basic * 0.12);
        const tax = gross > 500000 ? Math.round((gross - 500000) * 0.2) : 0;
        const net = gross - pf - tax;
        await Payroll.findOneAndUpdate(
          { employee: emp._id, month },
          {
            $set: {
              employee: emp._id,
              month,
              basic_salary: basic,
              hra,
              allowances: 0,
              bonus: 0,
              tax,
              pf,
              other_deductions: 0,
              net_salary: net,
              status: 'processed'
            }
          },
          { upsert: true }
        );
      }
    }

    const leaveTypes = ['sick_leave', 'casual_leave', 'paid_leave', 'work_from_home'];
    const statuses = ['pending', 'approved', 'rejected'];
    for (let i = 0; i < 10; i++) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (i - 5));
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      await Leave.create({
        employee: empIds[i % empIds.length],
        leave_type: leaveTypes[i % 4],
        start_date: start,
        end_date: end,
        reason: 'Sample reason',
        status: statuses[i % 3]
      });
    }

    const jobs = ['Software Engineer', 'HR Associate', 'Financial Analyst'];
    for (let i = 0; i < 5; i++) {
      await Recruitment.create({
        job_title: jobs[i % 3],
        candidate_name: `Candidate ${i + 1}`,
        candidate_email: `candidate${i + 1}@email.com`,
        stage: ['application_received', 'interview_scheduled', 'selected', 'rejected'][i % 4],
        status: 'active'
      });
    }

    for (let i = 0; i < 15; i++) {
      await Performance.create({
        employee: empIds[i],
        review_date: new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - 15)),
        rating: 3 + (i % 3),
        comments: 'Good performance'
      });
    }

    console.log('Seed completed successfully!');
    console.log('Login: sdchandu213@gmail.com / jagadeeshgokarla67@gmail.com / emp1@enterprisehr.com - password: password123');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
