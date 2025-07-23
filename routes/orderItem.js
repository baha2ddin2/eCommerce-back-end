const router = require('express').Router();
const db = require('../database/db');
const asyncHandler = require('express-async-handler');
const { validateOrderItem, validateUpdateOrderItem } = require('../schema/orderItem');
const { checkTokenAndAdmin, checkUserTokenOrAdmin } = require('../middlewars/checktoken');

/**
 * @method GET
 * @route  /api/ordersItem
 * @access Private (Admin)
 * @description Fetch all order items
 */
router.get('/', checkTokenAndAdmin, asyncHandler(async (req, res) => {
    const sql = "SELECT * FROM order_item"
    const [results] = await db.query(sql);
    res.status(200).json(results);
}));

/**
 * @method GET
 * @route /api/ordersItem/:id
 * @access Private (Admin)
 * @description Fetch an order item by its ID
 */
router.get('/:id', checkTokenAndAdmin, asyncHandler(async (req, res) => {
    const orderItemId = req.params.id;
    const sql = "SELECT * FROM order_item WHERE id = ?";
    const [results] = await db.query(sql, [orderItemId]);
    if (results.length === 0) {
        return res.status(404).json({ error: 'order item not found' });
    }
    res.status(200).json(results[0]);
}));

/**
 * @method GET
 * @route /api/ordersItem/user/:user
 * @access Private (User or Admin)
 * @description Fetch all order items for a specific user
 */
router.get('/user/:user', checkUserTokenOrAdmin, asyncHandler(async (req, res) => {
    const user = req.params.user;
    // Check if user exists
    const existsSql = "select * from users where username = ?"
    const [exists] = await db.query(existsSql, [user]);
    if (exists.length === 0) {
        return res.status(404).json({ error: 'user not found' });
    }
    // Ensure req.user is set by middleware and compare correct fields
    if (!req.user || req.user.user !== user) {
        return res.status(403).json({ error: 'You are not allowed to update this user' });
    }

    const sql = `SELECT
    order_items.id AS order_item_id,
    orders.id AS order_id,
    users.name AS customer_name,
    products.name AS product_name,
    order_items.quantity,
    order_items.price,
    (order_items.quantity * order_items.price) AS total_line_price
    FROM order_items
    JOIN orders ON order_items.order_id = orders.id
    JOIN users ON orders.user = users.user
    JOIN products ON order_items.product_id = products.id
    where users.user = ?`;
    const [results] = await db.query(sql, [user]);
    if (results.length === 0) {
        return res.status(404).json({ error: 'order item not found' });
    }
    res.status(200).json(results);
}));

/**
 * @method POST
 * @route /api/ordersItem
 * @access Public
 * @description Create a new order item
 */
router.post('/', asyncHandler(async (req, res) => {
    // Validate request body
    const validationError = validateOrderItem(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    // Insert order item into the database
    const { orderid, productId, quantity, price } = req.body;
    console.log(req.body)
    const sql = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)";
    const [results] = await db.query(sql, [orderid, productId, quantity, price]);
    res.status(201).json({ id: results.insertId, orderid, productId, quantity, price });
}))

/**
 * @method PUT
 * @route /api/ordersItem/:id
 * @access Private (User or Admin)
 * @description Update an order item by its ID
 */
router.put('/:id', checkUserTokenOrAdmin, asyncHandler(async (req, res) => {
    const orderItemId = req.params.id;
    // Validate request body
    const validationError = validateUpdateOrderItem(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    // Check if the user making the request is the same as the user being updated
    const userSql = `select * from orders
    join order_items on order_items.order_id = orders.id where  order_items.id = ?  `
    const [ result ] = await db.query(userSql, [orderItemId])
    if (req.user.user !== result.user || req.user.role == "admin") {
        return res.status(403).json({ error: 'You are not allowed to update this user' });
    }
    // Update order item in the database
    const { orderId, productId, quantity, price } = req.body;
    const sql = "UPDATE order_item SET order_id = ?, product_id = ?, quantity = ?, price = ? WHERE id = ?";
    db.query(sql, [orderId, productId, quantity, price, orderItemId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'order item not found' });
        }
        // Return the updated order item
        res.status(200).json({ id: orderItemId, productId, quantity, price });
    })
}))

/**
 * @method DELETE
 * @route /api/ordersItem/:id
 * @access Private (User or Admin)
 * @description Delete an order item by its ID
 */
router.delete('/:id', checkUserTokenOrAdmin, asyncHandler(async (req, res) => {
    const orderItemId = req.params.id;
    // Check if the user making the request is the same as the user being deleted
    const userSql = `select * from orders
    join order_item on order_items.order_id = orders.id
    where  order_items.id = ?  `
    const [ result ] = await db.query(userSql, [orderItemId])
    if (req.user.user !== result.user || req.user.role == "admin") {
        return res.status(403).json({ error: 'You are not allowed to update this user' });
    }
    const sql = "DELETE FROM order_item WHERE id = ?";
    const [results] = await db.query(sql, [orderItemId])
    if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'order item not found' });
    }

    return res.status(200).json({ message: 'order item deleted successfully' });
}))

module.exports = router;
