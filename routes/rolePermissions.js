const UserService = require('../services/user.service')
class checkRoleAndPermissions {
  /**
   * Roles authorization function called by route
   * @param {Array} roles - roles specified on the route
   */

  static getTokenFromHeader = (roles) => async (req, res, next) => {
    UserService.validatorRole(req, res, next, req.headers['x-refresh-token'], roles)
  }
}

module.exports = checkRoleAndPermissions
