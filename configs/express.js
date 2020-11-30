const express = require('express'),
  morgan = require('morgan'),
  cors = require('cors'),
  path = require('path'),
  helmet = require('helmet'),
  rotatingFileStream = require('rotating-file-stream'),
  moment = require('moment')

const accessLogStream = rotatingFileStream.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log'),
})

module.exports = async (app) => {
  // secure
  app.use(helmet())

  // Connect MongoDB
  require('../configs/databases')

  // CORS
  app.use(
    cors({
      origin: 'http://localhost:3000',
    })
  )

  // Parser Body
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))

  // setup the logger
  morgan.format('date', function () {
    return moment(new Date()).format('DD-MM-YYYY HH:mm:ss')
  })
  // Logger

  app.use(morgan('combined'))

  // app.use(morgan('combined', { stream: accessLogStream }))

  // Passport
  require('../configs/passport')

  // Static file
  app.use('/static', express.static(path.join(__dirname, '../public')))

  // Custom Response Format
  app.use(require('../configs/responseFormat'))

  // cron-job
  require('../configs/cron')
}
