
const { z } = require('zod');

const errorHandler = (err, req, res, next) => {
  
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'SERVER_ERROR';
  let details = [];


if (err instanceof z.ZodError) {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  message = 'Validation failed';
  
  details = err.errors.map(e => {
    
    const cleanPath = e.path.filter(p => p !== 'body' && p !== 'params' && p !== 'query');
    
    return {
      field: cleanPath.join('.') || e.path[e.path.length - 1],
      message: e.message
    };
  });
}

  // ✅ Multer File Upload Errors
  else if (err.name === 'MulterError') {
    statusCode = 400;
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        code = 'FILE_TOO_LARGE';
        message = 'File size exceeds the allowed limit';
        break;
      case 'LIMIT_FILE_COUNT':
        code = 'TOO_MANY_FILES';
        message = 'Too many files uploaded';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        code = 'UNEXPECTED_FILE';
        message = 'Unexpected file field';
        break;
      case 'MISSING_FIELD_NAME':
        code = 'MISSING_FILE_FIELD';
        message = 'File field name is missing';
        break;
      default:
        code = 'FILE_UPLOAD_ERROR';
        message = 'File upload failed';
    }
  }

  // ✅ Mongoose Validation Error
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // ✅ MongoDB Duplicate Key Error
  else if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_ERROR';
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
    details = [{ field, message: `${field} must be unique` }];
  }

  // ✅ MongoDB Cast Error (Invalid ID)
  else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid ID format';
    details = [{ field: err.path, message: `Invalid ${err.path} format` }];
  }

  // ✅ JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  }

  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token expired';
  }

  // ✅ http-errors package errors
  else if (err.status) {
    code = err.name || 'HTTP_ERROR';
  }

  // ✅ Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // ✅ Send error response
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;