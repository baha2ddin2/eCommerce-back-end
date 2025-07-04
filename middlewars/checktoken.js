function checkToken(req, res, next) {
    const token = req.headers.token;
    if (!token) {
        try{
            const decoded=jwt.verify(token, process.env.SECRET_KEY);
            req.user = decoded
            next();
        }catch (error) {
            res.status(401).json({ message: " invalid token" })
        }
    }else {
            return res.status(403).json({ message: "No token provided" });
    }
}

module.exports=checkToken