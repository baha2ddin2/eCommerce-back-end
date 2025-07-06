const router = require('express').Router();
const db = require('../database/db');
const asyncHandler = require('express-async-handler');
const { validateUpdateCard, validateCard } = require('../schema/cart')
const {checkTokenAndAdmin, checkUserTokenOrAdmin} = require('../middlewars/checktoken')

/**
* @method GET
* @route  /api/cart
* @access private
* @description : fetch all carts
*/

router.get('/', checkTokenAndAdmin ,asyncHandler(async (req, res) => {
    const sql = "SELECT * FROM cart"
    const [results] = await db.query(sql);
    res.status(200).json(results);
}));

/**
 * @method GET
 * @route /api/cart/:id
 * @access private
 * @description: fetch a cart by ID
 */
router.get('/:id', checkTokenAndAdmin ,asyncHandler(async (req, res) => {
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
 * @access private
 * @description: fetch all cart by user
 */
router.get('/user/:user', checkUserTokenOrAdmin ,asyncHandler(async (req, res) => {
    const user = req.params.user

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
    cart.id AS cart_id,
    users.name AS customer_name,
    products.name AS product_name,
    cart.quantity,
    products.price,
    (cart.quantity * products.price) AS total_line_price
    FROM cart
    JOIN users ON cart.user = users.user
    JOIN products ON cart.product_id = products.id
    WHERE cart.user = ?`
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
    const { user, productId, quantity } = req.body;
    const sql = "INSERT INTO cart (user, product_id, quantity) VALUES (?, ?, ?)";
    db.query(sql, [user, productId, quantity], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(201).json({ id: results.insertId, user, productId, quantity });
    })
}))

/**
 * @method PUT
 * @route /api/cart/:id
 * @access private
 * @description update a cart by ID
 */

router.put('/:id', checkUserTokenOrAdmin ,asyncHandler(async (req, res) => {
    const cartId = req.params.id;
    // Validate request body
    const validationError = validateUpdateCard(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    const userSql ="select * from cart where id = ?"
    const [result] = await db.query(userSql , [cartId])
    if (req.user.user !== result.user|| req.user.role !== "admin") {
        return res.status(403).json({ error: 'You are not allowed to update this user' });
    }

    // Update cart in the database
    const { productId, quantity } = req.body;
    const sql = "UPDATE cart SET  product_id = ?, quantity = ? WHERE id = ?";
    db.query(sql, [ productId, quantity, cartId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'cart not found' });
        }
        if (req.user.user !== results.user|| req.user.role !== "admin") {
        return res.status(403).json({ error: 'You are not allowed to update this user' });
        }
        res.status(200).json({ id: cartId , productId, quantity });
    })
}))

/**
 * @method DELETE
 * @route /api/cart/:id
 * @access public
 * @description delete a cart by ID
 */

router.delete('/:id', checkTokenAndAdmin ,asyncHandler(async (req, res) => {
    const cartId = req.params.id;
    const sql = "DELETE FROM cart WHERE id = ?";
    const userSql ="select * from cart where id = ?"
    const [result] = await db.query(userSql , [cartId])
    if (req.user.user !== result.user || req.user.role !== "admin") {
        return res.status(403).json({ error: 'You are not allowed to deleted this user' });
    }
    const [results] = await db.query(sql, [cartId])
    if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'cart not found' });
    }

    return res.status(200).json({ message: 'cart deleted successfully' });
}))

module.exports = router;