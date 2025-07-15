const jwt = require('jsonwebtoken');


/**
 * @method checkToken
 * @description Middleware to check if the token is valid
 */

function checkToken(req, res, next) {
    const token = req.cookies.token;
    if (token) {
        try{
            const decoded=jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded
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

function checkTokenAndAdmin(req,res,next){
    const token = req.cookies.token;
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

function checkUserTokenOrAdmin(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    console.log("URL param user:", req.params.user);

    const tokenUser = decoded.user?.trim();
    const paramUser = req.params.user?.trim();

    if (decoded.role === 'admin' || tokenUser === paramUser) {
      req.user = decoded;
      next();
    } else {
      return res.status(403).json({ message: "You are not allowed to do that" });
    }
  } catch (error) {
    console.error("JWT error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
}


module.exports={ checkToken ,checkTokenAndAdmin , checkUserTokenOrAdmin }