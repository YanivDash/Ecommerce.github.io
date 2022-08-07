const app = require('./app');
const cloudinary = require('cloudinary');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');

// uncaught syntX error
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to uncaught Exception`);

  process.exit(1);
});

// Config

dotenv.config({ path: 'backend/config/config.env' });

// Connecting to database

connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECREt,
});

const server = app.listen(process.env.PORT, () =>
  console.log(`server is working on http://localhost:${process.env.PORT}`)
);

//  unhandled promises

process.on('unhandledRejection', (err) => {
  console.log(`Error ${err.message}`);
  console.log(`Shutting down the server due to unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
