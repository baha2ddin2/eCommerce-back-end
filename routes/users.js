const express = require('express');
const router = express.Router();
const db = require('../database/db');
const asyncHandler = require('express-async-handler');
const { validateUser, validateUpdateUser } = require('../schema/user');
const bycrypt = require('bcrypt');
const {checkToken, checkTokenAndAdmin, checkUserTokenOrAdmin} = require('../middlewars/checktoken')

/**
 * @method GET
 * @route /api/users
 * @access private
 * @description Fetch all users
 */
router.get('/', checkTokenAndAdmin, asyncHandler(async (req, res) => {
    const sql = "SELECT * FROM users"
    const [results] = await db.query(sql);
    res.status(200).json(results);
}));

/**
 * @method GET
 * @route /api/users/:id
 * @access public
 * @description Fetch a user by their ID
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
 * @description Create a new user
 */
router.post('/', asyncHandler(async (req, res) => {
    // Validate request body
    const validationError = validateUser(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    //check if already exists
    const userExistsSql = "SELECT * FROM users WHERE user = ? OR email = ?";
    const [userExists] = await db.query(userExistsSql, [req.body.user, req.body.email]);
    if (userExists.length > 0) {
        return res.status(400).json({ error: 'Username or email already exists' });
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
 * @access private
 * @description Update a user by username
 */
router.put('/:user', checkToken, asyncHandler(async (req, res) => {
    const user = req.params.user;
    // Validate request body
    const validationError = validateUpdateUser(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }
    //check if user exist
    const userExistsSql = "SELECT * FROM users WHERE user = ?";
    const [userExists] = await db.query(userExistsSql, [user]);
    if (userExists.length == 0) {
        return res.status(400).json({ error: 'the user not exists' });
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
        res.status(200).json({ user, name, email });
    })
}))

/**
 * @method PUT
 * @route reset-password/users/:user
 * @access private
 * @description Update the password a user by username
 */
router.put('/:user', checkToken, asyncHandler(async (req, res) => {
    const user = req.params.user;
    // Update user in the database
    const   password = req.body.password
    // Use the hashed password in the update query
    const sql = "UPDATE users SET  password = ?  WHERE user = ?";
    db.query(sql, [ password, user], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ name :results.name , });
    })
}))



/**
 * @method DELETE
 * @route /api/users/:id
 * @access private
 * @description Delete a user
 */
router.delete('/:user', checkUserTokenOrAdmin, asyncHandler(async (req, res) => {
    // Check if the user making the request is the same as the user being deleted or is an admin
    if (req.user.user !== user || req.user.role !== "admin") {
        return res.status(403).json({ error: 'You are not allowed to delete this user' });
    }
    const user = req.params.user;
    const sql = "DELETE FROM users WHERE user = ?";
    const [results] = await db.query(sql, [user])
    if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'user not found' });
    }

    return res.status(200).json({ message: 'user deleted successfully' });
    })
)

module.exports = router;
