const express = require('express');
const router = express.Router();
const db = require('../database/db');
const asyncHandler = require('express-async-handler');
const { validateUser, validateUpdateUser } = require('../schema/user');
const bcrypt = require('bcrypt');
const {checkToken, checkTokenAndAdmin, checkUserTokenOrAdmin} = require('../middlewars/checktoken')
const jwt = require("jsonwebtoken")
const path =require("path")
const {removeImage ,uploadImage}= require("../utils/cloudinary")
const fs =require("fs");
const photoUpload = require('../middlewars/photoUpload');



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
 * @route /api/users/:user
 * @access public
 * @description Fetch a user by their user name
 */
router.get('/:user',checkUserTokenOrAdmin ,asyncHandler(async (req, res) => {
    const user = req.params.user;
    const sql = "SELECT * FROM users WHERE `user` = ?";
    const [results] = await db.query(sql, [user]);
    console.log("DB Query results:", results);

    if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(results[0]);
}));

/**
 * @method PUT
 * @route api/users/change-password/:user
 * @access private
 * @description Update the password a user by username
 */
router.put('/change-password/:user', checkToken, asyncHandler(async (req, res) => {
    const user = req.params.user;
    // Update user in the database
    const {oldPassword , password} = req.body
    const [userPassword] = await db.query("SELECT password FROM users WHERE user = ?", [user]);
    if (userPassword.length === 0) {
        return res.status(404).json({ error: 'password not found' });
    }
    const isPasswordValid = await bycrypt.compare(oldPassword, userPassword[0].password);
    if (!isPasswordValid) {
        return res.status(401).json({ error: 'the old password incorect' });
    }
    // Use the hashed password in the update query
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "UPDATE users SET  password = ?  WHERE user = ?";
    const [results] = await db.query(sql, [hashedPassword, user])
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ name :results.name });
}))




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
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (user ,name, email, password, phone) VALUES (?, ?, ?, ?,?)";
    const [rows] = await db.query(sql, [user, name, email, hashedPassword, phone])
    const [fetchedRows] = await db.query("SELECT * FROM users WHERE user = ?", [user]);
    const newUser = fetchedRows[0];
    const token = jwt.sign({ user: newUser.user, role : newUser.role  }, process.env.JWT_SECRET, { expiresIn: '10d' });
    res.cookie('token', token, {
        httpOnly: true,
        secure: false, // true in production with HTTPS
        sameSite: 'lax', // 'strict' or 'none' (use 'none' with https and cross-domain)
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.status(201).json({ user :newUser.user , name :newUser.name, email : newUser.email , phone : newUser.phone  });
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
    const { name, email , phone } = req.body;
    console.log("Updating user with:", { name, email, phone, user });

    // Use the hashed password in the update query
    const sql = "UPDATE users SET name = ?, email = ?, phone = ? WHERE user = ?";
    try{
        const [results] = await db.query(sql, [name, email, String(phone), user])
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ user, name, email,phone });
    }catch(err){
        return res.status(500).json({ error: err });
    }
}))

/**
 * @method PUT
 * @route users/reset-password/:user
 * @access private
 * @description Update the password a user by username
 */
router.put('/reset-password/:user', checkToken, asyncHandler(async (req, res) => {
    const user = req.params.user;
    // Update user in the database
    const  password = req.body.password
    // Use the hashed password in the update query
    // Hash the password before updating it
    const hashedPassword = await bycrypt.hash(password, 10);
    const sql = "UPDATE users SET  password = ?  WHERE user = ?";
    db.query(sql, [ hashedPassword, user], (err, results) => {
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



router.post('/upload-picture', photoUpload, checkTokenAndAdmin, asyncHandler(async(req,res)=>{
    if(!req.file){
        res.status(400).json({error:"no file provided  "})
    }
    const imagePath =path.join(__dirname,`../images/${req.file.filename}` )

    const result = await uploadImage(imagePath)

    const sql = "UPDATE products SET image_url = ?, public_id = ?  WHERE id = ?"
    const [product] = await db.query(sql , [result.secure_url, result.public_id ,req.product.id])
    if (product.affectedRows === 0) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({
        message: "image uploaded successfully",
        image_url: result.secure_url,
        public_id: result.public_id
    })
    fs.unlinkSync(imagePath)
}))

module.exports = router;
