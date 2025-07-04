const router = require('express').Router();
const db = require('../database/db');
const asyncHandler = require('express-async-handler');
const { validateOrderItem, validateUpdateOrderItem } = require('../schema/orderItem');

/**
* @method GET
* @route  /api/ordersItem
* @access public
* @description : fetch all orders Items
*/

router.get('/', asyncHandler(async (req, res) => {
    const sql = "SELECT * FROM order_item"
    const [results] = await db.query(sql);
    res.status(200).json(results);
}));

/**
 * @method GET
 * @route /api/ordersItem/:id
 * @access public
 * @description: fetch a order item by ID
 */
router.get('/:id', asyncHandler(async (req, res) => {
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
 * @access public
 * @description: fetch a order item by ID
 */
router.get('/user/:user', asyncHandler(async (req, res) => {
    const user = req.params.user;
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
    where users.user= ?`;
    const [results] = await db.query(sql, [user]);
    if (results.length === 0) {
        return res.status(404).json({ error: 'order item not found' });
    }
    res.status(200).json(results[0]);
}));

/**
* @method POST
* @route /api/ordersItem
* @access public
* @description create a new order item
*/

router.post('/', asyncHandler(async (req, res) => {
    // Validate request body
    const validationError = validateOrderItem(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    // Insert order item into the database
    const { orderId, productId, quantity, price } = req.body;
    const sql = "INSERT INTO order_item (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)";
    db.query(sql, [orderId, productId, quantity, price], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(201).json({ id: results.insertId, orderId, productId, quantity, price });
    })
}))

/**
 * @method PUT
 * @route /api/ordersItem/:id
 * @access public
 * @description update a order item by ID
 */

router.put('/:id', asyncHandler(async (req, res) => {
    const orderItemId = req.params.id;

    // Validate request body
    const validationError = validateUpdateOrderItem(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
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
        res.status(200).json({ id: orderItemId, productId, quantity, price });
    })
}))

/**
 * @method DELETE
 * @route /api/users/:id
 * @access public
 * @description delete a order item by ID
 */

router.delete('/:id', asyncHandler(async (req, res) => {
    const orderItemId = req.params.id;
    const sql = "DELETE FROM order_item WHERE id = ?";
    db.query(sql, [orderItemId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'order item not found' });
        }
        res.status(200).send({ message: 'order item deleted successfully' });
    })
}))

module.exports = router;