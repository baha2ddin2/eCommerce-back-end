const path = require("path")
const multer = require("multer")

const photoStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, path.join(__dirname, "../images"))
    },
    filename: (req ,file,cb)=>{
        if(file){
            cb(null,new Date().toISOString().replace(/:/g,"-")+file.originalname )
        }else{
            cb(null , false)
        }
    }
})

const photoUpload = multer({
    storage : photoStorage,
    fileFilter: (req,file , cb)=>{
        if(file.mimetype.startsWith("image")){
            cb(null,true)
        }else{
            cb({message:"unsupported file format"},false)
        }
    }
})

module.exports = photoUpload