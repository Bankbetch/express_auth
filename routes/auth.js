const jwt = require('express-jwt'),
  secret = require('../configs/app').secret,
  { validateTokenFromHeader } = require('../helpers/index')

const getTokenFromHeader = (req, res, next) => {
  return validateTokenFromHeader(req, res, next)
}

const auth = {
  required: jwt({
    secret: secret,
    getToken: getTokenFromHeader,
  }),
  optional(err, req, res, next) {
    // jwt expired
    if (err.message === 'jwt expired') next()
    next(err)
  },
}

module.exports = auth
