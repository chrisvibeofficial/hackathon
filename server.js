require('dotenv').config();
require('./configs/database')
const express = require('express');
const PORT = process.env.PORT || 1234;
const cors = require('cors');
const app = express();
const userRouter = require('./routes/user');
const planRouter = require('./routes/plan');
const paymentRouter = require('./routes/payment');


app.use(express.json());
app.use(cors());

app.use('/v1', userRouter);
app.use('/v1', planRouter);
app.use('/v1', paymentRouter);


app.listen(PORT, () => {
  console.log(`Server is running on Port: ${PORT}`)
});