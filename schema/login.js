const joi = require('joi');

function validateLogin(login) {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).required()
    });
    const { error } = schema.validate(login);
    if (error) {
        return  error.details[0].message;
    }
}
module.exports={ validateLogin }