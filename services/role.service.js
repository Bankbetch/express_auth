const Role = require('../models/Role')
const config = require('../configs/app')

const methods = {
  scopeSearch(req) {
    $or = []
    if (req.query.roleName) $or.push({ roleName: { $regex: req.query.roleName } })
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
        Promise.all([Role.find(_q.query).sort(_q.sort).limit(limit).skip(offset), Role.countDocuments(_q.query)])
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
        let obj = await Role.findById(id)
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
        const obj = new Role(data)
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
        let obj = await Role.findById(id)
        if (!obj) reject(methods.error('Data Not Found', 404))
        await Role.updateOne({ _id: id }, data)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  },

  delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        let obj = await Role.findById(id)
        if (!obj) reject(methods.error('Data Not Found', 404))
        await Role.deleteOne({ _id: id })
        resolve()
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
