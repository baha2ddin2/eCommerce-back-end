const express = require('express');
const app = express();
require('dotenv').config();

// use middelwears
app.use(express.json());

app.use('/api/users',require('./routes/users'))



app.listen(process.env.PORT , () => {
  console.log(`Server is running on port ${process.env.PORT }`);
  console.log(`http://localhost:${process.env.PORT }`);
})