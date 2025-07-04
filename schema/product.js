const joi = require('joi');
function validateProduct(product) {
    const schema = joi.object({
        name: joi.string().min(3).max(30).required(),
        price: joi.number().min(0).required(),
        description: joi.string().min(5).max(1000).required(),
        stock: joi.number().integer().min(0).required(),
        image : joi.string().uri().optional()
    });
    const { error } = schema.validate(product);
    if (error) {
        return  error.details[0].message;
    }
}

function validateUpdateProduct(product){
    const schema = joi.object({
        name: joi.string().min(3).max(30),
        price: joi.number().min(0),
        description: joi.string().min(5).max(1000),
        stock: joi.number().integer().min(0),
        image : joi.string().uri().optional()
    });
    const { error } = schema.validate(product);
    if (error) {
        return  error.details[0].message;
    }
}

module.exports = {
    validateProduct,
    validateUpdateProduct
};