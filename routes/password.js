const db = require('../database/db')
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer");
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { validateChangePassword } = require('../schema/password');


/**
 * @method POST
 * @route /api/password/reset
 * @access public
 * @description send link for reset password in the user email
 */

router.post( "/reset",asyncHandler( async (req, res) => {
    const email = req.body.email
    const sql = "SELECT * FROM users WHERE email = ?";
    const [results] = await db.query(sql, [email]);

    if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }
    const user = results[0];
    const secret = process.env.JWT_SECRET + user.password; // Use user's password as part of the secret
    const token = jwt.sign({ user: user.user , email: user.email }, secret, { expiresIn: '1h' });
    const link = `http://localhost:3000/reset-password/${user.user}/${token}`;

    //  Generate a password reset token and send it to the user's email
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        service: "gmail",
        auth: {
            user: process.env.USER_MAIL,
            pass: process.env.USER_PASS
        }
    });

    const mailOptions = {
    from: "your gmail",
        to: user.email,
        subject: "Reset Password",
        html: `<div>
        <h4>Click on the link below to reset your password</h4>
        <p>${link}</p>
        </div>`
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(process.env.USER_MAIL)
            console.log(process.env.USER_PASS)
            return res.status(500).json({ error: 'Failed to send email', det : error.message });
        }
        res.status(200).json({ message: 'Password reset email sent successfully check your email' });
    });
}))

/**
 * @method POST
 * @route /api/password/reset-password/:user/:token
 * @access private
 * @description change the password
 */



router.route('/reset-password/:user/:token',asyncHandler(async (req, res) => {
    const { error } = validateChangePassword(req.body);
    if(error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    sql = "SELECT * FROM users WHERE user = ?";
    const [dbUser] = await db.query(sql, [req.params.user]);

    if (dbUser.length===0) {
        return res.status(404).json({ message: "user not found" });
    }

    const secret = process.env.JWT_SECRET + user.password;
    try {
        jwt.verify(req.params.token, secret);

        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);

        const user = dbUser[0];
        const sql = "UPDATE users SET password = ? WHERE user = ?";
        const [result] = await db.query(sql, [req.body.password, user.user]);
        res.status(200).json({ message: "Password updated successfully" });
        console.log(result)
    } catch (error) {
        console.log(error);
        res.json({ message: error });
    }
}))

module.exports = router