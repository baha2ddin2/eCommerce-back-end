const router = require('express').Router();
const db = require('../database/db');
const asyncHandler = require('express-async-handler');
const { validateProduct, validateUpdateProduct } = require('../schema/product')

/**
* @method GET
* @route :/api/products
* @access:public
* @description:fetch all product
*/

router.get('/', asyncHandler(async (req, res) => {
    const sql = "SELECT * FROM products"
    const [results] = await db.query(sql);
    res.status(200).json(results);
}));

/**
 * @method GET
 * @route /api/products/:id
 * @access public
 * @description: fetch a products by ID
*/

router.get('/:id', asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const sql = "SELECT * FROM products WHERE id = ?";
    const [results] = await db.query(sql, [productId]);
    if (results.length === 0) {
        return res.status(404).json({ error: 'product not found' });
    }
    res.status(200).json(results[0]);
}));

/**
* @method POST
* @route /api/products
* @access public
* @description create a new user
*/

router.post('/', asyncHandler(async (req, res) => {
    // Validate request body
    const validationError = validateProduct(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    // Insert user into the database
    const { name, description, price, stock, image } = req.body;
    const sql = "INSERT INTO products (name, description, price,stock,image_url) VALUES (?, ?, ? , ?, ? )";
    db.query(sql, [name, description, price, stock, image], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(201).json({ id: results.insertId, description, price, stock, image });
    })
}))

/**
 * @method PUT
 * @route /api/products/:id
 * @access public
 * @description update a product by ID
 */

router.put('/:id', asyncHandler(async (req, res) => {
    const productId = req.params.id;

    // Validate request body
    const validationError = validateUpdateProduct(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    // Update product in the database
    const { name, description, price, stock, image } = req.body;
    const sql = "UPDATE products SET name = ?, description = ?, price = ?,stock = ?,image_url = ? WHERE id = ?";
    db.query(sql, [name, description, price, stock, image, productId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'product not found' });
        }
        res.status(200).json({ id: userId, name, email });
    })
}))

/**
 * @method DELETE
 * @route /api/products/:id
 * @access public
 * @description delete a product by ID
 */

router.delete('/:id', asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [productId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'product not found' });
        }
        res.status(200).send({ message: 'product deleted successfully' });
    })
}))



module.exports = router;

