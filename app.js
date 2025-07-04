const express = require('express');
const app = express();
const {notFound,errorhandel}=require('./middlewars/error');
require('dotenv').config();

// use middelwears
app.use(express.json());

// routes
app.use('/api/users',require('./routes/users'))
app.use('/api/products', require('./routes/product'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/orderItem',require('./routes/orderItem'))
app.use('/api/cart',require('./routes/cart'))
app.use('/login',require('./middlewars/login'))

//error handel
app.use(notFound)
app.use(errorhandel)


app.listen(process.env.PORT , () => {
  console.log(`Server is running on port ${process.env.PORT }`);
  console.log(`http://localhost:${process.env.PORT }`);
})