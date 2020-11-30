const mongoose = require('mongoose'),
  { caclulateTokenExp } = require('../helpers'),
  uniqueValidator = require('mongoose-unique-validator'),
  jwt = require('jsonwebtoken'),
  config = require('../configs/app'),
  irina = require('irina')

const schema = new mongoose.Schema(
  {
    email: { type: String, index: true, required: true, unique: true, uniqueCaseInsensitive: false },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  },
  { timestamps: true }
)

// Apply the uniqueValidator plugin to userSchema.
schema.plugin(uniqueValidator)

schema.plugin(irina)

// Generate JWT
schema.methods.generateJWT = function (obj) {
  let exp = caclulateTokenExp(config.token_exp_days, config.token_exp_types)
  return jwt.sign(
    {
      id: this._id,
      sub: this.email,
      authId: this.uuid || obj.uuid,
      exp: parseInt(new Date(exp).getTime() / 1000),
    },
    config.secret
    // config.private_key,
    // signOptions
  )
}

schema.methods.toJSON = function () {
  return {
    id: this._id,
    email: this.email,
    role: this.role,
    photoURL:
      this.image ||
      'https://icons-for-free.com/iconfiles/png/512/business+costume+male+man+office+user+icon-1320196264882354682.png',
    // createdAt: this.createdAt,
    // updatedAt: this.updatedAt,
  }
}

module.exports = mongoose.model('User', schema)
