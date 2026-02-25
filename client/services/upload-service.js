import { getSession } from "next-auth/react"
import axios from "axios";


const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000'

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

    try {
        const response = await axios.post(`${API_URL}/v1/media/upload`, formData, {
            headers: {
                Authorization: `Bearer ${session.idToken}`,
                "Content-Type": 'multipart/form-data'
            }
        });

        return response.data;

    } catch (error) {
        throw new Error(error?.response?.data?.message || 'Upload Failed')
    }
}