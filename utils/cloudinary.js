const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (fileUpload)=>{
    try{
        const data = await cloudinary.UploadStream.upload(fileUpload,{
            resource_type : "auto",
        })
        return data
    }catch(err){
        return err
    }
}

const removeImage = async (publicId)=>{
    try{
        const result = await cloudinary.uploader.destroy(publicId)
        return result
    }catch(err){
        return err
    }
}

module.exports ={uploadImage ,removeImage}

