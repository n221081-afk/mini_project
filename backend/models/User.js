const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'hr_manager', 'employee'], default: 'employee' }
}, { timestamps: true });

const passwordResetTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

const UserModel = {
  findByEmail: async (email) => {
    const user = await User.findOne({ email }).lean();
    return user ? { ...user, id: user._id.toString() } : null;
  },

  findById: async (id) => {
    const user = await User.findById(id).lean();
    return user ? { ...user, id: user._id.toString() } : null;
  },

  create: async (userData) => {
    const user = await User.create(userData);
    return user._id.toString();
  },

  update: async (id, userData) => {
    await User.findByIdAndUpdate(id, { $set: userData });
  },

  savePasswordResetToken: async (userId, token, expiresAt) => {
    await PasswordResetToken.create({ user: userId, token, expiresAt });
  },

  findValidResetToken: async (token) => {
    const record = await PasswordResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    }).lean();
    return record ? { ...record, user_id: record.user?.toString() } : null;
  },

  invalidateResetToken: async (token) => {
    await PasswordResetToken.updateOne({ token }, { $set: { used: true } });
  }
};

module.exports = UserModel;
