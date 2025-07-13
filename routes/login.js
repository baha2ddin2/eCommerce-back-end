const jwt= require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const db = require('../database/db');
const { validateLogin } = require('../schema/login');
const router = require('express').Router()
const bcrypt = require('bcrypt');


/**
 *  @method POST
 *  @route /login
 *  @desc Login user
 *  @access Public
 *  @body {email, password}
 */

router.post('/', asyncHandler(async (req, res) => {
    const  error = validateLogin(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";
    const [results] = await db.query(sql, [email]);

    if (results.length === 0) {
        return res.status(404).json({ error: 'email or password incorrect' });
    }
    const user = results[0];
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // if (!isPasswordValid) {
    //     return res.status(401).json({ error: 'email or password incorrect' });
    // }
    const token = jwt.sign({ user: user.user, role : user.role  }, process.env.JWT_SECRET, { expiresIn: '10 d' });
    res.cookie('token', token, {
    httpOnly: true,
    secure: false, // true in production with HTTPS
    sameSite: 'lax', // 'strict' or 'none' (use 'none' with https and cross-domain)
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({ token, info: {
        user :user.user,
        name : user.name,
        email : user.email,
        phone:user.phone
    }});
}));

module.exports=router
