const jwt = require('express-jwt'),
  secret = require('../configs/app').secret,
  { validateTokenFromHeader } = require('../helpers/index')

const getTokenFromHeader = (req) => {
  return validateTokenFromHeader(req)
}

const ValidateToken = (req, res, next) => {
  return validateTokenFromHeader(req, res, next, true)
}

const auth = {
  required: jwt({
    secret: secret,
    getToken: getTokenFromHeader,
  }),
  optional: jwt({
    secret: secret,
    credentialsRequired: false,
    getToken: getTokenFromHeader,
  }),
  validToken: ValidateToken,
}

module.exports = auth
