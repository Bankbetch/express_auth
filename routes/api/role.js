const router = require('express').Router()
const controllers = require('../../controllers/role.controller')
const getDataToken = require('../rolePermissions')
const auth = require('../auth')
// ['menuName', 'USERS_VIEW']
router.get('/', auth.required, getDataToken.getTokenFromHeader(['ROLES', 'ROLES_VIEW']), controllers.onGetAllByPermission)
router.get('/index', auth.required, getDataToken.getTokenFromHeader(['ROLES', 'ROLES_VIEW']), controllers.onGetAll)
router.get('/:id', auth.required, getDataToken.getTokenFromHeader(['ROLES', 'ROLES_VIEW']), controllers.onGetById)
router.post('/', auth.required, getDataToken.getTokenFromHeader(['ROLES', 'ROLES_CREATE']), controllers.onInsert)
router.put('/:id', auth.required, getDataToken.getTokenFromHeader(['ROLES', 'ROLES_EDIT']), controllers.onUpdate)
router.delete('/:id', auth.required, getDataToken.getTokenFromHeader(['ROLES', 'ROLES_DELETE']), controllers.onDelete)

module.exports = router
