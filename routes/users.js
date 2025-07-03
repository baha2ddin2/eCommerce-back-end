const express = require('express');
const router = express.Router();
const db = require('../db');
const asyncHandler = require('express-async-handler');
const { validateUser } = require('../schema/user');
const bycrypt = require('bcryptjs');

/*
* @methode:GET
* @route:/api/users
* @access:public
* @description:fetch all users
*/

router.get('/', asyncHandler(async (req, res) => {
    const sql = "SELECT * FROM users"
    const [results] = await db.query(sql);
    res.status(200).json(results);
}));

/**
 * @method:GET
 * @route :/api/users/:id
 * @access :public
 * @description:fetch a user by ID
 */
router.get('/:id', asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const sql = "SELECT * FROM users WHERE id = ?";
    const [results] = await db.query(sql, [userId]);
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
    const { name, email, password } = req.body;
    // Hash the password before storing it
    const hashedPassword = await bycrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(201).json({ id: results.insertId, name, email });
    })
}))

/**
 * @method PUT
 * @route /api/users/:id
 * @access public
 * @description update a user by ID
 */

router.put('/:id', asyncHandler(async (req, res) => {
    const userId = req.params.id;

    // Validate request body
    const validationError = validateUser(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    // Update user in the database
    const { name, email, password } = req.body;

    // Hash the password before updating it
    const hashedPassword = await bycrypt.hash(password, 10);
    // Use the hashed password in the update query
    const sql = "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?";
    db.query(sql, [name, email, hashedPassword, userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ id: userId, name, email });
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


