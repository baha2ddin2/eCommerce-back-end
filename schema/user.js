const joi = require('joi');

function validateUser(user) {
    const schema = joi.object({
        user :joi.string().min(3).max(30).required(),
        name: joi.string().min(3).max(30).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(50).required(),
        phone : joi.string().pattern(/^\d{10}$/).required(),
    });
    const { error } = schema.validate(user);
    if (error) {
        return  error.details[0].message;
    }
}

function validateUpdateUser(user) {
    const schema = joi.object({
        user :joi.string().min(3).max(30),
        name: joi.string().min(3).max(30),
        email: joi.string().email(),
        password: joi.string().min(6).max(50).optional(),
        phone : joi.string().pattern(/^\d{10}$/),
    });
    const { error } = schema.validate(user);
    if (error) {
        return  error.details[0].message;
    }
}
module.exports = {
    validateUser,
    validateUpdateUser
};