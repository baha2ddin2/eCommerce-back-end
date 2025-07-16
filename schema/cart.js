const joi = require('joi');


function validateCard(card) {
    const schema = joi.object({
        user: joi.string().min(1).required(),
        productId: joi.number().integer().min(1).required(),
        quantity: joi.number().integer().min(1).required()
    });
    const { error } = schema.validate(card);
    if (error) {
        return  error.details[0].message;
    }
}

function validateUpdateCard(card){
    const schema = joi.object({
        productId: joi.number().integer().min(1),
        quantity: joi.number().integer().min(1),

    });
    const { error } = schema.validate(card);
    if (error) {
        return  error.details[0].message;
    }
}

module.exports = {
    validateCard,
    validateUpdateCard
};