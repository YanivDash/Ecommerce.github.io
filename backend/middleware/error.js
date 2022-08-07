const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Mongodb wrong ID error
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid:${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // mongoose Duplicate key  error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  //  json web token error
  if (err.name === 'jsonWebTokenError') {
    const message = `Json Web Token is Invalid, Try gain`;
    err = new ErrorHandler(message, 400);
  }

  // Jwt expire
  if (err.name === 'jsonWebTokenExpire') {
    const message = `Json Web Token is Expired, Try gain`;
    err = new ErrorHandler(message, 400);
  }

  // sending Response
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
