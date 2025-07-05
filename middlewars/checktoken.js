const jwt = require('jsonwebtoken');


/**
 * @method checkToken
 * @description 
 */

function checkToken(req, res, next) {
    const token = req.headers.token;
    if (token) {
        try{
            const decoded=jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded
            console.log(decoded)
            next();
        }catch (error) {
            console.log(error)
            return res.status(401).json({ message: " invalid token" })
        }
    }else {
            return res.status(403).json({ message: "No token provided" });
    }
}

/**
 * @method checkTokenAndAdmine
 * @description Middleware to check if the user is an admin
 */

function checkTokenAndAdmine(req,res,next){
    const token = req.headers.token;
    if (token) {
        try{
            const decoded=jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded)
            req.user = decoded
            if(decoded.role === 'admin'){
                next();
            }else{
                return res.status(403).json({ message: "You are not allowed to do that" });
            }
        }catch (error) {
            res.status(401).json({ message: " invalid token" })
        }
    }else {
        return res.status(403).json({ message: "No token provided" });
    }

}

/**
 *  @method checkUserTokenOrAdmin
 *  @description Middleware to check if the user is either an admin or the user themselves
 */

function checkUserTokenOrAdmin(req,res,next){
    const token = req.headers.token;
    if (token) {
        try{
            const decoded=jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded)
            req.user = decoded
            if(decoded.role === 'admin' || decoded.user === req.params.user){
                req.user = decoded
                next();
            }else{
                return res.status(403).json({ message: "You are not allowed to do that" });
            }
        }catch (error) {
            res.status(401).json({ message: " invalid token" })
        }
    }else {
        return res.status(403).json({ message: "No token provided" });
    }


}

module.exports={ checkToken ,checkTokenAndAdmine , checkUserTokenOrAdmin }