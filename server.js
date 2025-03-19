require('dotenv').config();
require('./configs/database')
const express = require('express');
const PORT = process.env.PORT || 1234;
const cors = require('cors');
const app = express();
const userRouter = require('./routes/user');


app.use(express.json());
app.use(cors());
app.use('/v1', userRouter);


app.listen(PORT, () => {
  console.log(`Server is running on Port: ${PORT}`)
});