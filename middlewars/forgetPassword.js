const db = require('../database/db')
const asyncHandler = require('express-async-handler')
const { link } = require('joi')
const jwt = require('jsonwebtoken')

module.exports.forgetPassword = asyncHandler( async (req, res, next) => {
    const email = req.body.email
    const sql = "SELECT * FROM users WHERE email = ?";
    const [results] = await db.query(sql, [email]);

    if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }
    const user = results[0];
    const secret = process.env.JWT_SECRET + user.password; // Use user's password as part of the secret
    const token = jwt.sign({ user: user.user , email: user.email }, secret, { expiresIn: '1h' });
    const link = `http://my-app.com/reset-password/${user.user}/${token}`;

    // todo Generate a password reset token and send it to the user's email

    res.status(200).json({ message: 'Password reset email sent' });
})