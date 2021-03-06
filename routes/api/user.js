const router = require('express').Router()
const controllers = require('../../controllers/user.controller')
const auth = require('../auth')
const validator = require('../../validators')
const getDataToken = require('../rolePermissions')
router.get('/index', auth.required, getDataToken.getTokenFromHeader(['USERS', 'USERS_VIEW']), controllers.onGetAll)
router.get('/find-one/:id', auth.required, getDataToken.getTokenFromHeader(['USERS', 'USERS_VIEW']), controllers.onGetById)
router.post(
  '/',
  auth.required,
  [validator.user.get, getDataToken.getTokenFromHeader(['USERS', 'USERS_CREATE']), validator.check],
  controllers.onInsert
)
router.put('/update/:id', auth.required, getDataToken.getTokenFromHeader(['USERS', 'USERS_EDIT']), controllers.onUpdate)
router.delete('/delete/:id', auth.required, getDataToken.getTokenFromHeader(['USERS', 'USERS_DELETE']), controllers.onDelete)
router.get('/me', auth.required, controllers.onGetMyself)
router.post('/login', controllers.onLogin)
router.post('/register', [validator.user.get, validator.check], controllers.onRegister)
router.post('/refresh-token', auth.optional, controllers.onRefreshToken)
router.post('/confirm', controllers.onConfirm)
router.get('/send-lock', controllers.onSendLock)
router.post('/unlock', controllers.onUnlock)
router.delete('/logout', controllers.onDeleteToken)
router.get('/request-recover', controllers.onRequestRecover)
router.post('/recover', controllers.onRecover)
module.exports = router
