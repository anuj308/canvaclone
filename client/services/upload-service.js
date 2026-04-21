import { getSession } from "next-auth/react"
import axios from "axios";
import { fetchWithAuth } from "./base-service";
import { API_URL } from "./api-config";

const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function uploadFileWithAuth(file,metaData={}){
    const session = await getSession();

    if(!session){
        throw new Error('Not authenicated')
    }

    const formData = new FormData();
    formData.append('file',file)

    Object.entries(metaData).forEach(([key, value])=>{
        formData.append(key,value)
    })

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await axios.post(`${API_URL}/v1/media/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${session.idToken}`,
                    "Content-Type": 'multipart/form-data'
                },
                timeout: 120000,
            });

            return response.data;

        } catch (error) {
            const statusCode = error?.response?.status;
            const shouldRetry = RETRYABLE_STATUS_CODES.has(statusCode) && attempt < 3;

            if (shouldRetry) {
                await sleep(1200 * attempt);
                continue;
            }

            throw new Error(error?.response?.data?.message || 'Upload Failed')
        }
    }
}

export async function generateImageFromAI(prompt){
    try {
        const response = await fetchWithAuth('/v1/media/ai-image-generator',{
            method: 'POST',
            body: {
                prompt
            }
        })

        return response;
    } catch (error) {
        throw new Error(error?.message || 'Failed to generate image from AI');
    }
}