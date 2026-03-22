const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-jwt-secret-key',
    { expiresIn: '7d' }
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const token = generateToken(user);
    const employee = await Employee.findByUserId(user._id || user.id);
    
    sendSuccess(res, {
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
    sendError(res, 500, 'Server error', error);
  }
};

exports.logout = async (req, res) => {
  sendSuccess(res, { message: 'Logged out successfully' });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 400, 'Email is required');
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return sendSuccess(res, { message: 'If the email exists, a reset link will be sent' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);
    await User.savePasswordResetToken(user._id || user.id, token, expiresAt);

    // In production: send email with reset link
    sendSuccess(res, { 
      message: 'If the email exists, a reset link will be sent',
      resetToken: process.env.NODE_ENV === 'development' ? token : undefined
    });
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return sendError(res, 400, 'Token and new password are required');
    }

    const resetRecord = await User.findValidResetToken(token);
    if (!resetRecord) {
      return sendError(res, 400, 'Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(resetRecord.user || resetRecord.user_id, { password: hashedPassword });
    await User.invalidateResetToken(token);

    sendSuccess(res, { message: 'Password reset successfully' });
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};
