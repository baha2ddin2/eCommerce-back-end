const joi = require('joi');
function validateReview(review) {
    const schema = joi.object({
        productId: joi.number().required(),
        user : joi.string().min(2).max(20).required(),
        rating: joi.number().min(1).max(5).required(),
        comment: joi.string().min(3).max(100).required()
    });
    const { error } = schema.validate(review);
    if (error) {
        return  error.details[0].message;
    }
}


module.exports = {
    validateReview
};