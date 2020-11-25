const User = require('../models/User'),
  RefreshToken = require('../models/RefreshToken'),
  config = require('../configs/app'),
  jwt = require('jsonwebtoken'),
  _ = require('lodash'),
  crypto = require('crypto'),
  { validateTokenFromHeader } = require('../helpers/index')

const methods = {
  scopeSearch(req) {
    $or = []
    if (req.query.username) $or.push({ username: { $regex: req.query.username } })
    if (req.query.email) $or.push({ email: { $regex: req.query.email } })
    if (req.query.age) $or.push({ age: +req.query.age })
    let query = $or.length > 0 ? { $or } : {}
    let sort = { createdAt: -1 }
    if (req.query.orderByField && req.query.orderBy)
      sort = { [req.query.orderByField]: req.query.orderBy.toLowerCase() == 'desc' ? -1 : 1 }
    return { query: query, sort: sort }
  },

  find(req) {
    let limit = +(req.query.size || config.pageLimit)
    let offset = +(limit * ((req.query.page || 1) - 1))
    let _q = methods.scopeSearch(req)

    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([
          User.find(_q.query).sort(_q.sort).limit(limit).skip(offset).populate('role', ['id', 'roleName']),
          User.countDocuments(_q.query),
        ])
          .then((result) => {
            let rows = result[0]
            let count = result[1]
            resolve({
              rows: rows,
              total: count,
              lastPage: Math.ceil(count / limit),
              currPage: +req.query.page || 1,
            })
          })
          .catch((error) => {
            reject(error)
          })
      } catch (error) {
        reject(error)
      }
    })
  },

  findById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        let obj = await User.findById(id)
        if (!obj) reject(methods.error('Data Not Found', 404))
        resolve(obj.toJSON())
      } catch (error) {
        reject(error)
      }
    })
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = new User(data)
        let inserted = await obj.save()
        resolve(inserted)
      } catch (error) {
        reject(methods.error(error.message, 400))
      }
    })
  },

  update(id, data) {
    return new Promise(async (resolve, reject) => {
      try {
        let obj = await User.findById(id)
        if (!obj) reject(methods.error('Data Not Found', 404))
        await User.updateOne({ _id: id }, data)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  },

  delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        let obj = await User.findById(id)
        if (!obj) reject(methods.error('Data Not Found', 404))
        await User.deleteOne({ _id: id })
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  },

  login(data) {
    return new Promise(async (resolve, reject) => {
      try {
        let obj = await User.findOne({ username: data.username })
        if (!obj) {
          reject(methods.error('username not found or password is invalid.', 401))
        }
        if (!obj.validPassword(data.password)) {
          reject(methods.error('username not found or password is invalid.', 401))
        }
        const setRefreshToken = new RefreshToken({ user: obj.id })
        let inserted = await setRefreshToken.save()
        resolve({ accessToken: obj.generateJWT(obj), refreshToken: inserted.token, userData: obj })
      } catch (error) {
        reject(error)
      }
    })
  },

  deleteToken(req, res, next, headerRefreshToken) {
    return new Promise(async (resolve, reject) => {
      try {
        const getToken = validateTokenFromHeader(req, res, next, true)
        let decoded = jwt.decode(getToken)
        let obj = await RefreshToken.findOne({
          $and: [{ token: headerRefreshToken }, { user: decoded.id }],
        }).populate('user')
        if (obj) {
          await RefreshToken.deleteOne({ token: obj.token })
          resolve()
        } else if (!obj) {
          reject(methods.error('refresh token not found', 401))
        } else if (!obj.user) {
          reject(methods.error('username not found', 401))
        }
      } catch (error) {
        reject(error)
      }
    })
  },

  refreshToken(req, res, next, headerRefreshToken) {
    return new Promise(async (resolve, reject) => {
      try {
        const getToken = validateTokenFromHeader(req, res, next, true)
        let decoded = jwt.decode(getToken)
        let obj = await RefreshToken.findOne({
          $and: [{ token: headerRefreshToken }, { user: decoded.id }],
        }).populate('user')
        // console.log(obj.exp, new Date().toISOString())
        if (obj) {
          const newToken = await RefreshToken.findOneAndUpdate(
            { token: obj.token },
            { token: crypto.randomBytes(36).toString('hex') },
            { new: true, upsert: true }
          )
          const setDataUser = { id: obj.user.id, sub: obj.user.sub }
          resolve({ accessToken: obj.user.generateJWT(setDataUser), refreshToken: newToken.token, userData: obj })
        } else if (!obj) {
          reject(methods.error('refresh token not found', 401))
        } else if (!obj.user) {
          reject(methods.error('username not found', 401))
        }
      } catch (error) {
        reject(error)
      }
    })
  },

  validatorRole(req, res, next, roles) {
    return new Promise(async (resolve, reject) => {
      try {
        let decoded = jwt.decode(req)
        let {
          role: { permissions },
        } = await User.findById(decoded.id).populate('role', ['roleName', 'permissions']).exec()
        const menus = permissions.find((x) => x.menuId === roles[0])
        const findMenuById = menus.menuPermissions.some((menus) => menus.menuPermissionId === roles[1])
        if (!permissions.some((x) => x.menuId === roles[0])) {
          reject(next(methods.error('Unauthenticated', 403)))
        } else if (!findMenuById) {
          reject(next(methods.error('Permission denied', 403)))
        } else {
          resolve(next())
        }
      } catch (error) {
        reject(next(methods.error('Unauthenticated', 403)))
      }
    })
  },

  error(msg, status = 500) {
    let error = new Error(msg)
    error.status = status
    return error
  },
}

module.exports = { ...methods }
