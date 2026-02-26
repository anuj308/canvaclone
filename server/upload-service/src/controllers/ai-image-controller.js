const {uploadMediaToCloudinary} = require("../utils/cloudinary")
const Media = require("../models/media")

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_API_HOST = "https://api.stability.ai";
const STABILITY_IMAGE_ENDPOINT = `${STABILITY_API_HOST}/v2beta/stable-image/generate/core`;

const generateImageFromAiAndUploadToDb = async (req,res)=>{
    const prompt = req.body?.prompt;
    const normalizedPrompt = typeof prompt === 'string' ? prompt.trim() : '';
    const userId = req.user.userId;

    if (!normalizedPrompt) {
        return res.status(400).json({
            success: false,
            message: 'Prompt is required'
        })
    }

    if (!STABILITY_API_KEY) {
        return res.status(500).json({
            success: false,
            message: 'STABILITY_API_KEY is not configured on upload-service'
        })
    }

    try {
        const formData = new FormData();
        formData.append('prompt', normalizedPrompt);
        formData.append('output_format', 'png');

        const stabilityResponse = await fetch(STABILITY_IMAGE_ENDPOINT, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${STABILITY_API_KEY}`,
                Accept: 'image/*'
            },
            body: formData
        });

        if (!stabilityResponse.ok) {
            let errorMessage = 'Failed to generate image from Stability API';

            try {
                const errorData = await stabilityResponse.json();
                const firstError = Array.isArray(errorData?.errors) ? errorData.errors[0] : undefined;
                errorMessage = firstError || errorData?.message || errorData?.name || errorMessage;
            } catch {
                const errorText = await stabilityResponse.text();
                if (errorText) {
                    errorMessage = errorText;
                }
            }

            return res.status(stabilityResponse.status || 500).json({
                success: false,
                message: errorMessage
            })
        }

        const arrayBuffer = await stabilityResponse.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer)

        if (!imageBuffer.length) {
            throw new Error('No image bytes returned from Stability API');
        }

        const responseMimeType = stabilityResponse.headers.get('content-type') || 'image/png';
        
        const file = {
            buffer: imageBuffer,
            originalImage: `ai-generated-${Date.now()}.png`,
            mimetype: responseMimeType,
            size: imageBuffer.length,
            width: 1024,
            height: 1024,
        }
        
        const cloudinaryResult = await uploadMediaToCloudinary(file);
        
        const newlyCreatedMedia = new Media({
            userId,
            name: `Ai generated ${normalizedPrompt.substring(0,50)}${normalizedPrompt.length > 50 ? '...': ''}`,
            cloudinaryId: cloudinaryResult.public_id,
            url: cloudinaryResult.secure_url,
            mimeType: responseMimeType,
            size: imageBuffer.length,
            width: 1024,
            height: 1024
        }) 

        await newlyCreatedMedia.save();

        res.status(201).json({
            success: true,
            data: newlyCreatedMedia,
            prompt: normalizedPrompt,
            seed: null,
            message: "Ai image generated and store to db"
        })
    } catch (error) {
        const message = error?.message || "Failed to generate ai image and store to db please try again later";

        res.status(500).json({
            success: false,
            message
        })
    }
}

module.exports = {generateImageFromAiAndUploadToDb}