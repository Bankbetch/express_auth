const mongoose = require('mongoose'),
  fs = require('fs'),
  { caclulateTokenExp } = require('../helpers'),
  uniqueValidator = require('mongoose-unique-validator'),
  crypto = require('crypto'),
  jwt = require('jsonwebtoken'),
  config = require('../configs/app')

const schema = new mongoose.Schema(
  {
    username: {
      type: String,
      index: true,
      required: true,
      unique: true,
      uniqueCaseInsensitive: false,
    },
    password: { type: String, index: true },
    salt: {
      type: String,
      required: true,
      default: crypto.randomBytes(20).toString('hex'),
    },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  },
  { timestamps: true }
)

// Apply the uniqueValidator plugin to userSchema.
schema.plugin(uniqueValidator)

// Generate JWT
schema.methods.generateJWT = function (obj) {
  let exp = caclulateTokenExp(config.token_exp_days, config.token_exp_types)
  return jwt.sign(
    {
      id: this._id,
      sub: this.username,
      authId: this.uuid || obj.uuid,
      exp: parseInt(new Date(exp).getTime() / 1000),
    },
    config.secret
    // config.private_key,
    // signOptions
  )
}

// Custom JSON Response
schema.methods.toJSON = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    photoURL:
      this.image ||
      'https://icons-for-free.com/iconfiles/png/512/business+costume+male+man+office+user+icon-1320196264882354682.png',
    // createdAt: this.createdAt,
    // updatedAt: this.updatedAt,
  }
}

// Hash Password
schema.methods.passwordHash = function (password, salt) {
  // return crypto.createHash('sha1').update(password).digest('hex')
  return crypto.createHmac('sha512', salt).update(password).digest('hex')
}

// Verify Password
schema.methods.validPassword = function (password) {
  return this.passwordHash(password, this.salt) === this.password
}

// Custom field before save
schema.pre('save', function (next) {
  this.password = this.passwordHash(this.password, this.salt)
  next()
})

module.exports = mongoose.model('User', schema)
