const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: { type: String, sparse: true },

  email: { 
    type: String,
    unique: true,
    sparse: true
  },

  name: { type: String },

  password: { type: String, required: true },

  role: { 
    type: String,
    enum: ['admin', 'hr_manager', 'hr', 'manager', 'employee'],
    default: 'employee'
  },

  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },

  // Used by authController forgot/reset-password flow
  passwordResetTokenHash: { type: String, default: null },
  passwordResetExpires: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

User.findByEmail = async function (email) {
  return this.findOne({ email }).lean();
};

User.createUser = async function (data) {
  const doc = await this.create(data);
  return doc._id.toString();
};

User.updatePassword = async function (userId, updates) {
  await this.findByIdAndUpdate(userId, { $set: updates });
};

User.update = async function (userId, updates) {
  await this.findByIdAndUpdate(userId, { $set: updates });
};

User.savePasswordResetToken = async function (userId, token, expiresAt) {
  const tokenHash = hashToken(token);
  await this.findByIdAndUpdate(
    userId,
    {
      $set: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpires: expiresAt,
      },
    }
  );
};

User.findValidResetToken = async function (token) {
  const tokenHash = hashToken(token);
  const record = await this.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).lean();

  if (!record) return null;
  // authController expects `{ user: <id> }` or `{ user_id: <id> }`
  return { user: record._id, user_id: record._id };
};

User.invalidateResetToken = async function (token) {
  const tokenHash = hashToken(token);
  await this.findOneAndUpdate(
    { passwordResetTokenHash: tokenHash },
    { $set: { passwordResetTokenHash: null, passwordResetExpires: null } }
  );
};

module.exports = User;