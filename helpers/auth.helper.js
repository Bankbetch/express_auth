const methods = {
  validateTokenFromHeader(req, res, next, returnType) {
    if (
      (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
      (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
    ) {
      if (!returnType) next()
      return req.headers.authorization.split(' ')[1]
    } else {
      if (!returnType) next(res.error('No authorization token was found', 401))
      return null
    }
  },
}

module.exports = { ...methods }
