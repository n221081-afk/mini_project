const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Employee = require('../models/Employee');

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT secret is not configured');
  }
  return jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    const employee = await Employee.findByUserId(user._id || user.id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      employee: employee ? { id: employee.id, employee_code: employee.employee_code } : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.json({ message: 'If the email exists, a reset link will be sent' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);
    await User.savePasswordResetToken(user._id || user.id, token, expiresAt);

    // In production: send email with reset link
    res.json({ 
      message: 'If the email exists, a reset link will be sent',
      resetToken: process.env.NODE_ENV === 'development' ? token : undefined
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const resetRecord = await User.findValidResetToken(token);
    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(resetRecord.user || resetRecord.user_id, { password: hashedPassword });
    await User.invalidateResetToken(token);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserId = await User.createUser({
      name,
      email,
      password: hashedPassword,
      role: role || 'employee'
    });

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully', 
      user: { id: newUserId, name, email, role: role || 'employee' } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.setupAdmin = async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' }).lean();
    
    // If admin exists, forcefuly reset their password to "admin123" properly hashed
    if (adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.update(adminExists._id, { password: hashedPassword, email: 'sdchandu213@gmail.com' });
      return res.status(200).json({ 
        success: true, 
        message: 'Existing admin password has been forcefully reset and email updated to sdchandu213@gmail.com', 
        email: 'sdchandu213@gmail.com', 
        password: 'admin123' 
      });
    }
    
    // Otherwise create the new fallback admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'System Admin',
      email: 'sdchandu213@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Fallback admin created successfully', 
      email: 'sdchandu213@gmail.com', 
      password: 'admin123' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
