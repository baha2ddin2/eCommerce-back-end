const express = require('express');
const router = express.Router();
const db = require('../database/db');
const asyncHandler = require('express-async-handler');
const { validateUser, validateUpdateUser } = require('../schema/user');
const bycrypt = require('bcrypt');

/**
* @method GET
* @route :/api/users
* @access:public
* @description:fetch all users
*/

router.get('/', asyncHandler(async (req, res) => {
    const sql = "SELECT * FROM users"
    const [results] = await db.query(sql);
    res.status(200).json(results);
}));

/**
 * @method  GET
 * @route  /api/users/:user
 * @access public
 * @description  fetch a user by his user name
 */
router.get('/:id', asyncHandler(async (req, res) => {
    const user = req.params.id;
    const sql = "SELECT * FROM users WHERE id = ?";
    const [results] = await db.query(sql, [user]);
    if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(results[0]);
}));

/**
* @method POST
* @route /api/users
* @access public
* @description create a new user
*/

router.post('/', asyncHandler(async (req, res) => {
    // Validate request body
    const validationError = validateUser(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    // Insert user into the database
    const {user, name, email, password , phone } = req.body;
    // Hash the password before storing it
    const hashedPassword = await bycrypt.hash(password, 10);
    const sql = "INSERT INTO users (user ,name, email, password, phone) VALUES (?, ?, ?, ?,?)";
    db.query(sql, [user, name, email, hashedPassword, phone], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(201).json({ user , name, email , phone  });
    })
}))

/**
 * @method PUT
 * @route /api/users/:user
 * @access public
 * @description update a user by ID
 */

router.put('/:user', asyncHandler(async (req, res) => {
    const user = req.params.id;

    // Validate request body
    const validationError = validateUpdateUser(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    // Update user in the database
    const { name, email, password , phone } = req.body;

    // Hash the password before updating it
    const hashedPassword = await bycrypt.hash(password, 10);
    // Use the hashed password in the update query
    const sql = "UPDATE users SET name = ?, email = ?, password = ?, phone = ? WHERE user = ?";
    db.query(sql, [name, email, hashedPassword, phone, user], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ used, name, email });
    })
}))


/**
 * @method DELETE
 * @route /api/users/:id
 * @access public
 * @description delete a user by ID
 */

router.delete('/:id', asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const sql = "DELETE FROM users WHERE id = ?";
    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).send({ message: 'User deleted successfully' });
    })
}))

module.exports = router;