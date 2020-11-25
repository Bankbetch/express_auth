const express = require('express'),
      morgan = require('morgan'),
      cors = require('cors')
      passport = require("passport"),
      path = require('path'),
      helmet = require("helmet"),
      rotatingFileStream = require('rotating-file-stream');

const accessLogStream = rotatingFileStream.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log')
})

module.exports = async (app) => {
  // secure 
  app.use(helmet())
    
  // Connect MongoDB
  require('../configs/databases')

  // CORS
  app.use(cors({
    origin: 'http://localhost:3000'
  }))

  // Parser Body
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Logger
  app.use(morgan('dev'))
  // setup the logger
  app.use(morgan('combined', { stream: accessLogStream }))

  // Passport
  require('../configs/passport');

  // Static file
  app.use('/static', express.static(path.join(__dirname, '../public')))

  // Custom Response Format
  app.use(require('../configs/responseFormat'))

}