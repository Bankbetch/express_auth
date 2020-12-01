const User = require('../models/User'),
  RefreshToken = require('../models/RefreshToken'),
  config = require('../configs/app'),
  jwt = require('jsonwebtoken'),
  _ = require('lodash'),
  { validateTokenFromHeader, randomString, generateToken } = require('../helpers/index')

const methods = {
  scopeSearch(req) {
    $or = []
    if (req.query.email) $or.push({ email: { $regex: req.query.email } })
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
        let obj = await User.findById(id).populate('role', ['id', 'roleName'])
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
        User.register(data, (error, registerable) => {
          if (error) {
            reject(methods.error(error.message, 400))
          } else {
            registerable.sendConfirmation((error, confirmable) => {
              console.log(confirmable)
            })
            resolve(registerable)
          }
        })
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

  login(data, ipInfo) {
    return new Promise(async (resolve, reject) => {
      try {
        User.authenticate(data, async (error, authenticable) => {
          if (error) {
            // User.findOne({ email: data.email }).exec((error, user) => {
            //   user.lock((lockError, lockable) => {})
            // })
            reject(methods.error(error.message, 401))
          } else {
            const setRefreshToken = new RefreshToken(generateToken(authenticable))
            let inserted
            await Promise.all([setRefreshToken.save(), authenticable.track(ipInfo, (error, trackable) => {})]).then(
              (res) => (inserted = res[0])
            )
            resolve({
              accessToken: authenticable.generateJWT(authenticable),
              refreshToken: inserted.token,
              userData: authenticable,
            })
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  },
  deleteTokenByCron() {
    return new Promise(async (resolve, reject) => {
      try {
        await RefreshToken.deleteMany({ exp: { $lt: new Date() } })
        resolve()
      } catch (error) {
        console.log(error)
        reject(error)
      }
    })
  },
  deleteToken(req, res, next, headerRefreshToken) {
    return new Promise(async (resolve, reject) => {
      try {
        let { obj } = await methods.checkToken(req, res, next, headerRefreshToken)
        if (obj) {
          await RefreshToken.deleteOne({ token: obj.token })
          resolve()
        } else if (!obj) {
          reject(methods.error('refresh token not found', 401))
        } else if (!obj.user) {
          reject(methods.error('email not found', 401))
        }
      } catch (error) {
        reject(error)
      }
    })
  },

  refreshToken(req, res, next, headerRefreshToken) {
    return new Promise(async (resolve, reject) => {
      try {
        let { obj, decoded } = await methods.checkToken(req, res, next, headerRefreshToken)
        if (obj) {
          if (obj.exp < new Date()) {
            await RefreshToken.deleteOne({ token: obj.token })
            reject(methods.error('Session expried', 401))
          } else {
            const newToken = await RefreshToken.findOneAndUpdate(
              { token: obj.token },
              { token: randomString(36) },
              { new: true, upsert: true }
            )
            const setDataUser = { id: obj.user.id, sub: obj.user.sub, uuid: decoded.authId }
            resolve({ accessToken: obj.user.generateJWT(setDataUser), refreshToken: newToken.token, userData: obj.user })
          }
        } else if (!obj) {
          reject(methods.error('refresh-token not found or refresh-token not match', 401))
        } else if (!obj.user) {
          reject(methods.error('email not found', 401))
        }
      } catch (error) {
        reject(methods.error(error.message, 401))
      }
    })
  },

  validatorRole(req, res, next, headerRefreshToken, roles) {
    return new Promise(async (resolve, reject) => {
      try {
        let { obj, decoded } = await methods.checkToken(req, res, next, headerRefreshToken)
        if (obj) {
          let {
            role: { permissions },
          } = await User.findById(decoded.id).populate('role', ['roleName', 'permissions']).exec()
          const menus = permissions.find((x) => x.menuId === roles[0])
          const findMenuById = menus.menuPermissions.some((menus) => menus.menuPermissionId === roles[1])
          if (!permissions.some((x) => x.menuId === roles[0])) {
            reject(next(methods.error('Unauthenticated', 401)))
          } else if (!findMenuById) {
            reject(next(methods.error('Permission denied', 403)))
          } else {
            resolve(next())
          }
        } else {
          reject(next(methods.error('Unauthenticated', 401)))
        }
      } catch (error) {
        reject(next(methods.error('Unauthenticated', 401)))
      }
    })
  },
  async checkToken(req, res, next, headerRefreshToken) {
    try {
      const getToken = validateTokenFromHeader(req, res, next)
      const decoded = jwt.decode(getToken)
      if (!decoded) return methods.error('refresh-token not found or refresh-token not match', 401)
      const obj = await RefreshToken.findOne({
        $and: [{ token: headerRefreshToken }, { user: decoded.id }, { authId: decoded.authId }],
      }).populate('user')
      return { obj: obj, decoded: decoded }
    } catch (error) {
      throw error
    }
  },
  confirmToken(confirm, ipInfo) {
    return new Promise(async (resolve, reject) => {
      try {
        await User.confirm(confirm, async (error, confirmable) => {
          if (error) {
            reject(methods.error(error.message, 404))
          } else {
            if (confirmable.confirmedAt === null) {
              const setRefreshToken = new RefreshToken(generateToken(confirmable))
              let inserted
              await Promise.all([setRefreshToken.save(), confirmable.track(ipInfo, (error, trackable) => {})]).then(
                (res) => (inserted = res[0])
              )
              resolve({
                accessToken: confirmable.generateJWT(confirmable),
                refreshToken: inserted.token,
                userData: confirmable,
              })
            } else {
              reject(methods.error('Account has confirmed', 401))
            }
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  },
  sendLock(email) {
    return new Promise(async (resolve, reject) => {
      try {
        await User.findOne({ email: email }).exec((error, user) => {
          if (user) resolve({ token: user.unlockToken })
          else reject(methods.error('User not found', 404))
        })
      } catch (error) {
        reject(error)
      }
    })
  },
  unlock(token) {
    return new Promise(async (resolve, reject) => {
      try {
        await User.findOne({ unlockToken: token }).exec(async (err, user) => {
          if (user) {
            if (user.unlockedAt) reject(methods.error('Unlocked token not found', 404))
            else
              await User.unlock(token, async (error, lockable) => {
                if (error) {
                  reject(error)
                } else {
                  resolve()
                }
              })
          } else {
            reject(methods.error('Unlocked token not found', 404))
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  },
  requestRecover(email) {
    return new Promise(async (resolve, reject) => {
      try {
        await User.requestRecover({ email: email }, (error, recoverable) => {
          if (error) {
            console.log(error)
          } else {
            resolve({ token: recoverable.recoveryToken })
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  },
  recover({ recoveryToken, password }) {
    return new Promise(async (resolve, reject) => {
      try {
        await User.findOne({ recoveryToken: recoveryToken }).exec(async (e, user) => {
          if (user) {
            if (user.recoveredAt === null) {
              await User.recover(recoveryToken, password, (error, recoverable) => {
                if (error) {
                  reject(methods.error(error.message, 401))
                } else {
                  resolve()
                }
              })
            } else {
              reject(methods.error('Recovery token not found', 404))
            }
          } else {
            reject(methods.error('Recovery token not found', 404))
          }
        })
      } catch (error) {
        reject(error)
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
