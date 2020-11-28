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
  optional: jwt({
    secret: secret,
    credentialsRequired: false,
    getToken: getTokenFromHeader,
  }),
}

module.exports = auth
