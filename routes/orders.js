const router = require('express').Router();
const db = require('../database/db');
const asyncHandler = require('express-async-handler');
const { validateorder, validateUpdateOrder } = require('../schema/order')
const { checkTokenAndAdmin, checkUserTokenOrAdmin } = require('../middlewars/checktoken');


/**
* @method GET
* @route  /api/orders
* @access privet
* @description : fetch all orders
*/

router.get('/', checkTokenAndAdmin  , asyncHandler(async (req, res) => {
    const sql = "SELECT * FROM orders"
    const [results] = await db.query(sql);
    res.status(200).json(results);
}));

/**
 * @method GET
 * @route /api/orders/:id
 * @access privet
 * @description: fetch a orders by ID
 */

router.get('/:id', checkTokenAndAdmin ,asyncHandler(async (req, res) => {
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
 * @access private
 * @description: fetch a orders by user name
 */

router.get('/user/:user', checkUserTokenOrAdmin ,asyncHandler(async (req, res) => {
    const user = req.params.user;
    //check if user exists
    const existsSql = "select * from users where user = ?"
    const [result] = await db.query(existsSql, [user]);
    if (result.length === 0) {
        return res.status(404).json({ error: 'user not found' });
    }
    // Check if the user making the request is the same as the user being updated
    if (req.user.user !== user) {
        return res.status(403).json({ error: 'You are not allowed to update this user' });
    }
    const sql = "SELECT orders.id AS order_id,users.name AS customer_name,orders.total, orders.status, orders.created_at , orders.adress FROM orders JOIN users ON orders.user = users.user WHERE users.user = ? ";
    const [results] = await db.query(sql, [user]);
    if (results.length === 0) {
        return res.status(404).json({ error: 'order not found' });
    }
    res.status(200).json(results[0]);
}));

/**
 * @method GET
 * @route /api/orders/fullorder/user/:user
 * @access private
 * @description: fetch a orders by user name
 */

router.get('/fullorder/user/:user', checkUserTokenOrAdmin , asyncHandler(async (req, res) => {
    const user = req.params.user;
    //check if user exists
    const existsSql = "select * from users where user = ?"
    const [result] = await db.query(existsSql, [user]);
    if (result.length === 0) {
        return res.status(404).json({ error: 'user not found' });
    }
    // Check if the user making the request is the same as the user being updated
    if (req.user.user !== user) {
        return res.status(403).json({ error: 'You are not allowed to update this user' });
    }

    const sql = `SELECT
        o.id AS order_id,
        u.name AS customer_name,
        p.name AS product_name,
        oi.quantity,
        oi.price,
        (oi.quantity * oi.price) AS total_price
        o.adress
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
    const { user, total, status } = req.body;
    const sql = "INSERT INTO orders (user, total , status , adress ) VALUES (?, ?, ?)";
    db.query(sql, [user, total, status], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(201).json({ id: results.insertId, user, total, status });
    })
}))

/**
 * @method PUT
 * @route /api/orders/:id
 * @access private
 * @description update a order by ID
 */

router.put('/:id', checkTokenAndAdmin, asyncHandler(async (req, res) => {
    const orderId = req.params.id;

    // Validate request body
    const validationError = validateUpdateOrder(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    // Update order in the database
    const { total, status } = req.body;

    const sql = "UPDATE orders SET total = ?, status = ? WHERE id = ?";
    db.query(sql, [total, status, orderId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'order not found' });
        }
        res.status(200).json({ id: orderId, total, status, user: results.user });
    })
}))

/**
 * @method DELETE
 * @route /api/orders/:id
 * @access private
 * @description delete a order by ID
 */

router.delete('/:id', checkTokenAndAdmin, asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const sql = "DELETE FROM orders WHERE id = ?";
    const [results] = await db.query(sql, [orderId])
    if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'order not found' });
    }

    return res.status(200).json({ message: 'order deleted successfully' });
}))
module.exports = router;