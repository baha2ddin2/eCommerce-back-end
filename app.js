const express = require('express');
const app = express();
const {notFound,errorhandel}=require('./middlewars/error');
require('dotenv').config();
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// use middelwears
app.use(express.json());

//helmet
app.use(helmet())

//use cookies
app.use(cookieParser());

// cors
app.use(cors({
  origin: 'http://localhost:3000', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization','token'], // Allowed headers
  credentials: true
}));
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url} called`);
  next();
});

// routes
app.use('/api/users',require('./routes/users'))
app.use('/api/products', require('./routes/product'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/orderItem',require('./routes/orderItem'))
app.use('/api/cart',require('./routes/cart'))
app.use('/login',require('./routes/login'))
app.use('/api/reviews',require('./routes/reviews'))
app.use('/api/password',require('./routes/password'))

//error handel
app.use(notFound)
app.use(errorhandel)


app.listen(process.env.PORT , () => {
  console.log(`Server is running on port ${process.env.PORT }`);
  console.log(`http://localhost:${process.env.PORT }`);
})