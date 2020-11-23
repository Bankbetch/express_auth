const UserService = require('../services/user.service')
class checkRoleAndPermissions {
  /**
   * Roles authorization function called by route
   * @param {Array} roles - roles specified on the route
   */

  static getTokenFromHeader = (roles) => async (req, res, next) => {
    if (
      (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
      (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
    ) {
      this.getDataToken(req.headers.authorization.split(' ')[1], res, next, roles)
    }
    return null
  }
  static getDataToken(req, res, next, roles) {
    UserService.validatorRole(req, res, next, roles)
  }
}

module.exports = checkRoleAndPermissions
