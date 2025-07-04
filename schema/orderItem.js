const joi = require('joi');


function validateOrderItem(orderitem) {
    const schema = joi.object({
        orderid: joi.number().integer().min(1).required(),
        productId: joi.number().integer().min(1).required(),
        quantity: joi.number().integer().min(1).required(),
        price: joi.number().required()
    });
    const { error } = schema.validate(orderitem);
    if (error) {
        return  error.details[0].message;
    }
}

function validateUpdateOrderItem(orderitem){
    const schema = joi.object({
        orderId: joi.number().integer().min(1),
        productId: joi.number().integer().min(1),
        quantity: joi.number().integer().min(1),
        price: joi.number()
    });
    const { error } = schema.validate(orderitem);
    if (error) {
        return  error.details[0].message;
    }
}

module.exports = {
    validateOrderItem,
    validateUpdateOrderItem
};