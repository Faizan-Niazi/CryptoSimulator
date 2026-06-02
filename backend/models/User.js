const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { FallbackUser } = require('./dbWrapper');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.model('User', UserSchema);

// Transparent export
module.exports = {
  findOne: function(...args) {
    if (global.useFallbackDb) return FallbackUser.findOne(...args);
    return MongooseUser.findOne(...args);
  },
  create: function(...args) {
    if (global.useFallbackDb) return FallbackUser.create(...args);
    return MongooseUser.create(...args);
  },
  findById: function(...args) {
    if (global.useFallbackDb) return FallbackUser.findById(...args);
    return MongooseUser.findById(...args);
  },
  find: function(...args) {
    if (global.useFallbackDb) {
      // In leaderboard, User.find({}, 'username email') is used. Let's return mock users list!
      const fs = require('fs');
      const path = require('path');
      const DATA_DIR = path.join(__dirname, '../data');
      const filePath = path.join(DATA_DIR, 'users.json');
      if (fs.existsSync(filePath)) {
        try {
          return JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
        } catch(e) {
          return [];
        }
      }
      return [];
    }
    return MongooseUser.find(...args);
  }
};
