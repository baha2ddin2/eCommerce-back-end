const router = require('express').Router();
const db = require('../database/db');
const asyncHandler = require('express-async-handler');
const { validateReview } = require('../schema/review')
const { checkToken } = require('../middlewars/checktoken');

/**
 * @method GET
 * @route /api/reviews
 * @access public
 * @description Fetch all reviews
 */
router.get('/', asyncHandler(async (req, res) => {
    const sql = "SELECT * FROM reviews"
    const [results] = await db.query(sql);
    res.status(200).json(results);
}));

/**
 * @method GET
 * @route /api/reviews/:id
 * @access public
 * @description Fetch a reviews by ID
 */

router.get('/:id', asyncHandler(async (req, res) => {
    const reviewId = req.params.id;
    const sql = "SELECT * FROM reviews WHERE product_id = ?";
    const [results] = await db.query(sql, [reviewId]);
    if (results.length === 0) {
        return res.status(404).json({ error: 'review not found' });
    }
    res.status(200).json(results);
}));

/**
 * @method POST
 * @route /api/reviews
 * @access public
 * @description Create a new review
 */
router.post('/' ,asyncHandler(async (req, res) => {
    // Validate request body
    const validationError = validateReview(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    // Insert review into the database
    const { productId, user, rating, comment } = req.body;
    const sql = "INSERT INTO reviews (product_id , user , rating , comment) VALUES (?, ?, ?, ?)";
    try{
        const results = db.query(sql, [productId, user, rating, comment])
        res.status(201).json({ id: results.insertId, productId , user , rating , comment});
    }catch(err){
        return res.status(500).json({ error: 'Database query failed' });
    }
}))

/**
 * @method PUT
 * @route /api/products/:id
 * @access private (admin only)
 * @description Update a product by ID
 */

// router.put('/:id',, asyncHandler(async (req, res) => {
//     const productId = req.params.id;

//     // Validate request body
//     const validationError = validateUpdateProduct(req.body);
//     if (validationError) {
//         return res.status(400).json({ error: validationError });
//     }
//     // Update product in the database
//     const { name, mark, category, description, price, stock, image } = req.body;
//     const sql = "UPDATE products SET name = ?, mark = ?, category = ?, description = ?, price = ?, stock = ?, image_url = ? WHERE id = ?";
//     db.query(sql, [name, mark, category, description, price, stock, image, productId], (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: 'Database query failed' });
//         }
//         if (results.affectedRows === 0) {
//             return res.status(404).json({ error: 'product not found' });
//         }
//         res.status(200).json({ id: productId, name, description, price, stock, image });
//     })
// }))

/**
 * @method DELETE
 * @route /api/reviews/:id
 * @access private
 * @description Delete a review by ID
 */
router.delete('/:id', checkToken , asyncHandler(async (req, res) => {
    const reviewId = req.params.id;
    const sql = "DELETE FROM reviews WHERE product_id = ?";
    [results] = await db.query(sql, [reviewId])
    if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'review not found' });
    }

    return res.status(200).json({ message: 'review deleted successfully' });
}))

module.exports = router;
