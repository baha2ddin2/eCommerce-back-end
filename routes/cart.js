const router = require('express').Router();
const db = require('../database/db');
const asyncHandler = require('express-async-handler');
const { validateUpdateCard, validateCard } = require('../schema/cart')

/**
* @method GET
* @route  /api/cart
* @access public
* @description : fetch all carts
*/

router.get('/', asyncHandler(async (req, res) => {
    const sql = "SELECT * FROM cart"
    const [results] = await db.query(sql);
    res.status(200).json(results);
}));

/**
 * @method GET
 * @route /api/cart/:id
 * @access public
 * @description: fetch a cart by ID
 */
router.get('/:id', asyncHandler(async (req, res) => {
    const cartId = req.params.id;
    const sql = "SELECT * FROM cart WHERE id = ?";
    const [results] = await db.query(sql, [cartId]);
    if (results.length === 0) {
        return res.status(404).json({ error: 'order not found' });
    }
    res.status(200).json(results[0]);
}));

/**
 * @method GET
 * @route /api/cart/user/:user
 * @access public
 * @description: fetch all cart by user
 */
router.get('/user/:user', asyncHandler(async (req, res) => {
    const user = req.params.user
    const sql = "SELECT cart.id AS cart_id, users.name AS customer_name, products.name AS product_name, cart.quantity, products.price,(cart.quantity * products.price) AS total_line_price FROM cart JOIN users ON cart.user = users.user JOIN products ON cart.product_id = products.id WHERE cart.user = ?";
    const [results] = await db.query(sql, [user]);
    if (results.length === 0) {
        return res.status(404).json({ error: 'order not found' });
    }
    res.status(200).json(results);
}));



/**
* @method POST
* @route /api/cart
* @access public
* @description create a new cart
*/

router.post('/', asyncHandler(async (req, res) => {
    // Validate request body
    const validationError = validateCard(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    // Insert user into the database
    const { userId, productId, quantity } = req.body;
    const sql = "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)";
    db.query(sql, [userId, productId, quantity], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(201).json({ id: results.insertId, userId, productId, quantity });
    })
}))

/**
 * @method PUT
 * @route /api/cart/:id
 * @access public
 * @description update a cart by ID
 */

router.put('/:id', asyncHandler(async (req, res) => {
    const cartId = req.params.id;

    // Validate request body
    const validationError = validateUpdateCard(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    // Update user in the database
    const { userId, productId, quantity } = req.body;

    // Use the hashed password in the update query
    const sql = "UPDATE cart SET user_id = ?, product_id = ?, quantity = ? WHERE id = ?";
    db.query(sql, [userId, productId, quantity, cartId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'cart not found' });
        }
        res.status(200).json({ id: cartId, userId, productId, quantity });
    })
}))

/**
 * @method DELETE
 * @route /api/cart/:id
 * @access public
 * @description delete a cart by ID
 */

router.delete('/:id', asyncHandler(async (req, res) => {
    const cartId = req.params.id;
    const sql = "DELETE FROM cart WHERE id = ?";
    db.query(sql, [cartId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'cart not found' });
        }
        res.status(200).send({ message: 'cart deleted successfully' });
    })
}))



module.exports = router;

