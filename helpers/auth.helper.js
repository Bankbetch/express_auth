const { v4: uuidv4 } = require('uuid')
const methods = {
  validateTokenFromHeader(req, res, next) {
    if (
      (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
      (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
    ) {
      return req.headers.authorization.split(' ')[1]
      // if (!returnType) next(res.error('No authorization token was found', 401))
    } else {
      return null
    }
  },
  randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let randomString = ''
    for (let i = 0; i < len; i++) {
      const randomPoz = Math.floor(Math.random() * charSet.length)
      randomString += charSet.substring(randomPoz, randomPoz + 1)
    }
    return randomString
  },
  generateToken(authenticable) {
    authenticable.uuid = uuidv4().replace(/-/g, '')
    const setRefreshToken = {
      user: authenticable.id,
      token: methods.randomString(36),
      authId: authenticable.uuid,
    }
    return setRefreshToken
  },
}

module.exports = { ...methods }
