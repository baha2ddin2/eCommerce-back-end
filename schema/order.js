const joi = require('joi');


function validateOrder(order) {
    const schema = joi.object({
        user: joi.string().integer().min(1).required(),
        total: joi.number().integer().min(1).required(),
        status: joi.string().valid('pending', 'shipped', 'delivered','cancelled').required(),
        adress : joi.string().integer().min(1).required()
    });
    const { error } = schema.validate(order);
    if (error) {
        return  error.details[0].message;
    }
}

function validateUpdateOrder(order){
    const schema = joi.object({
        total: joi.number().integer().min(1),
        status: joi.string().valid('pending', 'shipped', 'delivered','cancelled'),
        adress :joi.string().integer().min(1)
    });
    const { error } = schema.validate(order);
    if (error) {
        return  error.details[0].message;
    }
}

module.exports = {
    validateOrder,
    validateUpdateOrder
};