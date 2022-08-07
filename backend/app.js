const errorMiddleware = require('./middleware/error');
const express = require('express');
const app = express();
const cookiePareser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

app.use(express.json());
app.use(cookiePareser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

// Route imports
const product = require('./routes/productRoutes');
const user = require('./routes/userRoutes');
const order = require('./routes/orderRoutes');

app.use('/api/v1', product);
app.use('/api/v1', user);
app.use('/api/v1', order);

// Middleware for error
app.use(errorMiddleware);

module.exports = app;
