function notFound(req,res,next){
    const error = new Error( `Not Found - ${req.originalUrl}` );
    res.status(404);
    next(error);
}

function errorhandel(err, req, res, next) {
  // Handle the error
  console.error(err.stack); // Log the error stack for debugging
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ message: err.message });
}

module.exports = {
    notFound,
    errorhandel
};