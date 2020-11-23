const router = require('express').Router()
const controllers = require('../../controllers/role.controller')
const getDataToken = require('../rolePermissions')
// ['menuName', 'USERS_VIEW']
router.get('/', getDataToken.getTokenFromHeader(['ROLES', 'ROLES_VIEW']), controllers.onGetAll)
router.get('/:id', getDataToken.getTokenFromHeader(['ROLES', 'ROLES_VIEW']), controllers.onGetById)
router.post('/', getDataToken.getTokenFromHeader(['ROLES', 'ROLES_CREATE']), controllers.onInsert)
router.put('/:id', getDataToken.getTokenFromHeader(['ROLES', 'ROLES_EDIT']), controllers.onUpdate)
router.delete('/:id', getDataToken.getTokenFromHeader(['ROLES', 'ROLES_DELETE']), controllers.onDelete)

module.exports = router
