const mongoose = require('mongoose');

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

  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

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

module.exports = User;