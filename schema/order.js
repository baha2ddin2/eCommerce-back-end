const joi = require('joi');


function validateOrder(order) {
    const schema = joi.object({
        userId: joi.number().integer().min(1).required(),
        productId: joi.number().integer().min(1).required(),
        total: joi.number().integer().min(1).required(),
        status: joi.string().valid('pending', 'shipped', 'delivered','cancelled').required()
    });
    const { error } = schema.validate(order);
    if (error) {
        return  error.details[0].message;
    }
}

function validateUpdateOrder(order){
    const schema = joi.object({
        userId: joi.number().integer().min(1),
        productId: joi.number().integer().min(1),
        total: joi.number().integer().min(1),
        status: joi.string().valid('pending', 'shipped', 'delivered','cancelled')
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