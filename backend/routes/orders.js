const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/menu', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM menu_items");
    res.json(rows);
  } catch (err) {
    console.error('Error fetching menu:', err);
    res.status(500).json({ message: 'Server error loading menu.' });
  }
});

router.post('/orders', async (req, res) => {
  const { userId, orderType, scheduleDate, scheduleTime, items, totalAmount } = req.body;

  if (!userId || !items || items.length === 0) {
    return res.status(400).json({ message: 'Invalid order data.' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const orderQuery = `
      INSERT INTO orders (customer_id, order_type, schedule_date, schedule_time, total_amount, status) 
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;
    
    const dbOrderType = orderType === 'pickup' ? 'pick-up' : 'dine-in';
    const currentDate = scheduleDate || new Date().toISOString().slice(0, 10);
    const currentTime = scheduleTime || '12:00:00';

    const [orderResult] = await connection.execute(orderQuery, [
      userId, 
      dbOrderType, 
      currentDate, 
      currentTime, 
      totalAmount
    ]);

    const orderId = orderResult.insertId;

    const itemQuery = `
      INSERT INTO order_items (order_id, item_id, quantity, price_at_time) 
      VALUES (?, ?, ?, ?)
    `;

    for (const item of items) {
      await connection.execute(itemQuery, [
        orderId, 
        item.item_id || item.id, 
        item.quantity, 
        item.price
      ]);
    }

    await connection.commit();
    connection.release();

    res.status(201).json({ 
      message: 'Advance order successfully placed!', 
      orderId: orderId 
    });

  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('Error placing order:', err);
    res.status(500).json({ message: 'Server error while processing your order.' });
  }
});

module.exports = router;