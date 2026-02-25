const {uploadMediaToCloudinary} = require('../utils/cloudinary')
const Media = require('../models/media')

const uploadMedia = async(req,res)=>{
    try {
        if(!req.file){
            return res.status(400).json({
                success: false,
                message: 'No File Found!'
            })

            const {originalname, mimeType, size, width, height} = req.file;error
            const {userId} = req.user;

            const cloudinaryResult = await uploadMediaToCloudinary(req.file);

            const newlyCreateMedia = new Media({
                userId,
                name: originalname,
                cloudinaryId: cloudinaryResult.public_id,
                url: cloudinaryResult.secure_url,
                mimeType: mimeType,
                size,
                width,
                height
            })

            await newlyCreateMedia.save();

            res.status(201).json({
                success: true,
                data: newlyCreateMedia
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating asset'
        })
    }
}

const getAllMediasByUser = async(req,res)=>{

    try {
        const medias = await Media.find({userId: req.user.userId}).sort({createdAt: -1});

        res.status(200).json({
            success: true,
            data: medias
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Falied to fetch assets'
        })
    }
}

module.exports = {uploadMedia,getAllMediasByUser}