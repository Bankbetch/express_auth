const router = require('express').Router()
const auth = require('../auth')

router.use('/users', require('./user'))
router.use('/posts', auth.required, require('./post'))
router.use('/roles', auth.required, require('./role'))

module.exports = router