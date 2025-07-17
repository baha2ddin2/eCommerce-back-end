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
    const validationError = validateCard(req.body);
    if (validationError) {
        console.error(validationError)
        return res.status(400).json({ error: validationError });
    }
    const { user, productId, quantity } = req.body;
    try{
        const exists = await db.query('SELECT * FROM cart WHERE user = ? AND product_id = ?',[user, productId])
        if (exists.length > 0) {
            return res.status(400).json({ error: 'Product already in cart' });
        }
    }catch(err){
        return res.status(500).json({ error: 'Database error' });
    }
    const sql = "INSERT INTO cart (user, product_id, quantity) VALUES (?, ?, ?)";
    try {
        const result = await db.query(sql, [user, productId, quantity])
        res.status(201).json({ id: result.insertId, user, productId, quantity });
    } catch (error) {
        console.error('Database insertion error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}));




/**
 * @method PUT
 * @route /api/cart/:id
 * @access private
 * @description update a cart by ID
 */

router.put('/:id', checkUserTokenOrAdmin, asyncHandler(async (req, res) => {
    const cartId = req.params.id;
    // Validate request body
    const validationError = validateUpdateCard(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    const userSql = "SELECT * FROM cart WHERE id = ?";
    const [rows] = await db.query(userSql, [cartId]);
    if (rows.length === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
    }
    const cart = rows[0];
    // 🛡️ Check if the user owns the cart or is admin
    if (req.user.user !== cart.user && req.user.role !== "admin") {
        return res.status(403).json({ error: 'You are not allowed to update this cart' });
    }
    const { quantity } = req.body;
    const updateSql = "UPDATE cart SET quantity = ? WHERE id = ?";
    const [updateResult] = await db.query(updateSql, [quantity, cartId]);
    if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: 'Cart not updated' });
    }
    res.status(200).json({ cart_id: cartId, quantity });
}));


/**
 * @method DELETE
 * @route /api/cart/:id
 * @access public
 * @description delete a cart by ID
 */

router.delete('/:id', checkTokenAndAdmin, asyncHandler(async (req, res) => {
  const cartId = req.params.id;
  const [result] = await db.query("SELECT * FROM cart WHERE id = ?", [cartId]);

  if (!result || result.length === 0) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  const cart = result[0]; // get the item from array
  if (req.user.user !== cart.user && req.user.role !== "admin") {
    return res.status(403).json({ error: 'You are not allowed to delete this cart item' });
  }
  const [results] = await db.query("DELETE FROM cart WHERE id = ?", [cartId]);
  return res.status(200).json({ message: 'Cart deleted successfully', id: cartId });
}));


module.exports = router;