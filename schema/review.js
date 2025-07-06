const joi = require('joi');
function validateReview(review) {
    const schema = joi.object({
        productId: joi.string().min(3).max(30).required(),
        user : joi.string().min(2).max(20).required(),
        rating: joi.number().min(1).max(5).required(),
        Comment: joi.number().min(0).required()
    });
    const { error } = schema.validate(review);
    if (error) {
        return  error.details[0].message;
    }
}


module.exports = {
    validateReview
};