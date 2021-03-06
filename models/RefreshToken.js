const mongoose = require('mongoose'),
  uniqueValidator = require('mongoose-unique-validator'),
  config = require('../configs/app'),
  { caclulateTokenExp } = require('../helpers')

const schema = new mongoose.Schema(
  {
    token: { type: String, index: true, required: true, unique: true },
    exp: {
      type: Date,
      default: caclulateTokenExp(config.refresh_exp_days, config.refresh_exp_types),
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authId: { type: String, index: true, required: true, unique: true },
  },
  { timestamps: true }
)

// Apply the uniqueValidator plugin to userSchema.
schema.plugin(uniqueValidator, { status: 400 })

// Custom JSON Response
schema.methods.toJSON = function () {
  return {
    token: this.roleName,
    exp: this.roleDescription,
    user: this.user,
  }
}

// Custom field before save
schema.pre('save', function (next) {
  next()
})

module.exports = mongoose.model('RefreshToken', schema)
