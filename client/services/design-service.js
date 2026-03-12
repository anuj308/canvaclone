import { fetchWithAuth } from "./base-service";

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000';
const DESIGN_SERVICE_URL = process.env.NEXT_PUBLIC_DESIGN_SERVICE_URL || '';

let warmupPromise = null;
let gatewayWarmupPromise = null;
let publicDesignWarmupPromise = null;
let servicesAwake = false;

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function warmUpApiGateway(options = {}) {
    if (servicesAwake || gatewayWarmupPromise) {
        return gatewayWarmupPromise;
    }

    gatewayWarmupPromise = fetch(`${API_URL}/health`, {
        method: 'GET',
        keepalive: options.keepalive ?? false,
    }).finally(() => {
        gatewayWarmupPromise = null;
    });

    return gatewayWarmupPromise;
}

export async function warmUpPublicDesignService(options = {}) {
    if (!DESIGN_SERVICE_URL) {
        return null;
    }

    if (servicesAwake || publicDesignWarmupPromise) {
        return publicDesignWarmupPromise;
    }

    publicDesignWarmupPromise = fetch(`${DESIGN_SERVICE_URL}/health`, {
        method: 'GET',
        keepalive: options.keepalive ?? false,
        mode: 'cors',
    }).finally(() => {
        publicDesignWarmupPromise = null;
    });

    return publicDesignWarmupPromise;
}

export async function warmUpPublicServices(options = {}) {
    await Promise.allSettled([
        warmUpApiGateway(options),
        warmUpPublicDesignService(options),
    ]);
}

export async function warmUpDesignService(maxAttempts = 2) {
    if (servicesAwake) return;

    if (warmupPromise) {
        return warmupPromise;
    }

    warmupPromise = (async () => {
        let lastError = null;

        try {
            await warmUpPublicServices();
        } catch (error) {
            lastError = error;
        }

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const response = await getUserDesigns();
                servicesAwake = true;
                return response;
            } catch (error) {
                lastError = error;

                if (attempt < maxAttempts) {
                    await wait(2000 * attempt);
                }
            }
        }

        throw lastError;
    })();

    try {
        return await warmupPromise;
    } finally {
        warmupPromise = null;
    }
}

export async function getUserDesigns(){
    return fetchWithAuth(`/v1/designs`)
}

export async function getUserDesignById(designId){
    return fetchWithAuth(`/v1/designs/${designId}`)
}

export async function saveDesign(designData,designId = null){
    return fetchWithAuth(`/v1/designs`,{
        method: 'POST',
        body: {
            ...designData,
            designId 
        }
    })

}
export async function deleteDesign(designId){
    return fetchWithAuth(`/v1/designs/${designId}`,{
        method: "DELETE"
    })
}

export async function saveCanvasState(canvas, designId = null,title="Untitled Design"){
    if(!canvas) return false;

    try {
        const canvasData = canvas.toJSON(['id','filters'])

        const designData = {
            name : title,
            canvasData: JSON.stringify(canvasData),
            width: canvas.width,
            height: canvas.height
        }

        return saveDesign(designData, designId);

    } catch (error) {
        console.error('Error Saving canvas state', error);
        throw error;
    }
}