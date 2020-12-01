const Service = require('../services/user.service'),
  getIP = require('ipware')().get_ip
// validate module

const methods = {
  async onGetAll(req, res) {
    try {
      let result = await Service.find(req)
      res.success(result)
    } catch (error) {
      res.error(error.message, error.status)
    }
  },

  async onGetById(req, res) {
    try {
      let result = await Service.findById(req.params.id)
      res.success(result)
    } catch (error) {
      res.error(error.message, error.status)
    }
  },

  async onInsert(req, res) {
    try {
      let result = await Service.insert(req.body)
      res.success(result, 201)
    } catch (error) {
      res.error(error.message, error.status)
    }
  },

  async onUpdate(req, res) {
    try {
      await Service.update(req.params.id, req.body)
      res.success('success')
    } catch (error) {
      res.error(error.message, error.status)
    }
  },

  async onDelete(req, res) {
    try {
      await Service.delete(req.params.id)
      res.success('success', 204)
    } catch (error) {
      res.error(error.message, error.status)
    }
  },

  async onLogin(req, res) {
    const ipInfo = getIP(req)
    try {
      let result = await Service.login(req.body, ipInfo.clientIp)
      res.success(result)
    } catch (error) {
      res.error(error.message, error.status)
    }
  },

  async onRegister(req, res) {
    try {
      let result = await Service.insert(req.body)
      res.success(result, 201)
    } catch (error) {
      res.error(error.message, error.status)
    }
  },

  async onRefreshToken(req, res, next) {
    try {
      let result = await Service.refreshToken(req, res, next, req.headers['x-refresh-token'])
      res.success(result)
    } catch (error) {
      res.error(error.message, error.status)
    }
  },
  async onDeleteToken(req, res, next) {
    try {
      let result = await Service.deleteToken(req, res, next, req.headers['x-refresh-token'])
      res.success(result)
    } catch (error) {
      res.error(error.message, error.status)
    }
  },
  async onConfirm(req, res) {
    const ipInfo = getIP(req)
    try {
      let result = await Service.confirmToken(req.query.confirm, ipInfo.clientIp)
      res.success(result)
    } catch (error) {
      res.error(error.message, error.status)
    }
  },
  async onSendLock(req, res) {
    try {
      let result = await Service.sendLock(req.query.email)
      res.success(result)
    } catch (error) {
      res.error(error.message, error.status)
    }
  },
  async onUnlock(req, res) {
    try {
      let result = await Service.unlock(req.body.email)
      res.success(result)
    } catch (error) {
      res.error(error.message, error.status)
    }
  },
  async onRequestRecover(req, res) {
    try {
      let result = await Service.requestRecover(req.query.email)
      res.success(result)
    } catch (error) {
      res.error(error.message, error.status)
    }
  },
}

module.exports = { ...methods }
