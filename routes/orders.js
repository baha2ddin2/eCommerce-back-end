const router = require('express').Router();
const db = require('../database/db');
const asyncHandler = require('express-async-handler');
const { validateorder, validateUpdateOrder } = require('../schema/order')

/**
* @method GET
* @route  /api/orders
* @access public
* @description : fetch all orders
*/

router.get('/', asyncHandler(async (req, res) => {
    const sql = "SELECT * FROM orders"
    const [results] = await db.query(sql);
    res.status(200).json(results);
}));

/**
 * @method GET
 * @route /api/orders/:id
 * @access public
 * @description: fetch a orders by ID
 */

router.get('/:id', asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const sql = "SELECT * FROM orders WHERE id = ?";
    const [results] = await db.query(sql, [orderId]);
    if (results.length === 0) {
        return res.status(404).json({ error: 'order not found' });
    }
    res.status(200).json(results[0]);
}));

/**
 * @method GET
 * @route /api/orders/user/:user
 * @access public
 * @description: fetch a orders by user name
 */

router.get('/user/:user', asyncHandler(async (req, res) => {
    const user = req.params.user;
    const sql = "SELECT orders.id AS order_id,users.name AS customer_name,orders.total, orders.status, orders.created_at FROM orders JOIN users ON orders.user = users.user WHERE users.user = ? ";
    const [results] = await db.query(sql, [user]);
    if (results.length === 0) {
        return res.status(404).json({ error: 'order not found' });
    }
    res.status(200).json(results[0]);
}));

/**
 * @method GET
 * @route /api/orders/fullorder/user/:user
 * @access public
 * @description: fetch a orders by user name
 */

router.get('/fullorder/user/:user', asyncHandler(async (req, res) => {
    const user = req.params.user;
    const sql = `SELECT
        o.id AS order_id,
        u.name AS customer_name,
        p.name AS product_name,
        oi.quantity,
        oi.price,
        (oi.quantity * oi.price) AS total_price
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN users u ON o.user = u.user
    JOIN products p ON oi.product_id = p.id
    WHERE u.user = ?`;
    const [results] = await db.query(sql, [user]);
    if (results.length === 0) {
        return res.status(404).json({ error: 'order not found' });
    }
    res.status(200).json(results);
}));

/**
* @method POST
* @route /api/orders
* @access public
* @description create a new order
*/

router.post('/', asyncHandler(async (req, res) => {
    // Validate request body
    const validationError = validateorder(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    // Insert order into the database
    const { userId, total, status } = req.body;
    const sql = "INSERT INTO orders (user_id, total , status ) VALUES (?, ?, ?)";
    db.query(sql, [userId, total, status], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(201).json({ id: results.insertId, userId, total, status });
    })
}))

/**
 * @method PUT
 * @route /api/orders/:id
 * @access public
 * @description update a order by ID
 */

router.put('/:id', asyncHandler(async (req, res) => {
    const orderId = req.params.id;

    // Validate request body
    const validationError = validateUpdateOrder(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    // Update order in the database
    const { userId, total, status } = req.body;

    const sql = "UPDATE orders SET user_id = ?, total = ?, status = ? WHERE id = ?";
    db.query(sql, [userId, total, status, orderId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'order not found' });
        }
        res.status(200).json({ id: orderId, total, status, userId });
    })
}))

/**
 * @method DELETE
 * @route /api/orders/:id
 * @access public
 * @description delete a order by ID
 */

router.delete('/:id', asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const sql = "DELETE FROM orders WHERE id = ?";
    db.query(sql, [orderId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'order not found' });
        }
        res.status(200).send({ message: 'order deleted successfully' });
    })
}))



module.exports = router;

