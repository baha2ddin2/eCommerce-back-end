const joi = require('joi');

function validateUser(user) {
    const schema = joi.object({
        name: joi.string().min(3).max(30).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(50).required()
    });
    const { error } = schema.validate(user);
    if (error) {
        return  error.details[0].message;
    }
}
module.exports = {
    validateUser
};