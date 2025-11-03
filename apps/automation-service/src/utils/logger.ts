import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
  }),
  
  // Error log file
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'automation-error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'automation-combined.log'),
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create the logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

// Create a stream object with a 'write' function that will be used by `morgan`
export const morganStream = {
  write: (message: string) => {
    logger.http(message.substring(0, message.lastIndexOf('\n')));
  },
};

// Handle uncaught exceptions
logger.exceptions.handle(
  new winston.transports.File({ 
    filename: path.join(process.cwd(), 'logs', 'automation-exceptions.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

// Handle unhandled promise rejections
logger.rejections.handle(
  new winston.transports.File({ 
    filename: path.join(process.cwd(), 'logs', 'automation-rejections.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

// Export default logger
export default logger;














