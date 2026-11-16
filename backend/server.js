const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

const authRoutes = require('./routes/auth');
const ordersRoutes = require('./routes/orders'); 

app.use('/api/auth', authRoutes);
app.use('/api', ordersRoutes); 

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});