const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
})

const uploadMediaToCloudinary = (file)=>{
    return new Promise((resolve,reject)=>{
        const uploadStream = cloudinary.uploader.upload_stream({
            resource_type: 'auto'
        },(err,result)=>{
            if(err){
                reject(err)
            }else{
                resolve(result)
            }
        })

        uploadStream.end(file.buffer);
    })
}

module.exports = {uploadMediaToCloudinary}