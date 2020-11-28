const mongoose = require('mongoose'),
  { toDateTime } = require('../helpers'),
  uniqueValidator = require('mongoose-unique-validator')

const schema = new mongoose.Schema(
  {
    roleName: { type: String, index: true, required: true, unique: true, uniqueCaseInsensitive: false },
    roleDescription: { type: String },
    permissions: {
      type: Array,
      default: [
        {
          menuName: null,
          menuId: null,
          menuPermissions: [],
        },
      ],
    },
  },
  { timestamps: true }
)

// Apply the uniqueValidator plugin to userSchema.
schema.plugin(uniqueValidator, { status: 400 })

// Custom JSON Response
schema.methods.toJSON = function () {
  return {
    id: this._id,
    roleName: this.roleName,
    roleDescription: this.roleDescription,
    permissions: this.permissions,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

// Custom field before save
schema.pre('save', function (next) {
  next()
})

module.exports = mongoose.model('Role', schema)
