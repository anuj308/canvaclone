import { TextAlignCenter } from 'lucide-react';
import { shapeDefinations } from './shapes/shape-definations';
import { createShape } from './shapes/shape-factory';

export const initializeFabric = async(canvasEl, containerEl)=>{
    try {
        const {Canvas,PencilBrush} = await import('fabric');

        const canvas = new Canvas(canvasEl,{
            preserveObjectStacking: true,
            isDrawingMode: false,
            renderOnAddRemove: true,
        })

        const brush = new PencilBrush(canvas);
        brush.color = "#000000";
        brush.width = 5;
        canvas.freeDrawingBrush = brush;

        return canvas;
    } catch (error) {
        console.error('Failed to load fabric',error)
    }
}
export const centerCanvas = (canvas)=>{
    if(!canvas || !canvas.wrapperEl) return;

    const canvasWrapper = canvas.wrapperEl;

    canvasWrapper.style.width = `${canvas.width}px`;
    canvasWrapper.style.height = `${canvas.height}px`;
    canvasWrapper.style.position = "absolute";
    canvasWrapper.style.top = "50%";
    canvasWrapper.style.left = "50%";
    canvasWrapper.style.transform = "translate(-50%,-50%)";
}

export const fitCanvasToViewport = (canvas, options = {}) => {
    if(!canvas?.wrapperEl) return 1;

    const normalizedOptions = typeof options === 'number'
        ? { maxZoom: options }
        : options;

    const container = canvas.wrapperEl.parentElement;
    if(!container) return canvas.getZoom?.() || 1;

    const padding = normalizedOptions.padding ?? 40;
    const maxZoom = normalizedOptions.maxZoom ?? 1;

    const containerWidth = container.clientWidth || 1;
    const containerHeight = container.clientHeight || 1;
    const availableWidth = Math.max(containerWidth - padding * 2, 1);
    const availableHeight = Math.max(containerHeight - padding * 2, 1);
    const canvasWidth = canvas.width || 1;
    const canvasHeight = canvas.height || 1;

    const zoom = Math.min(availableWidth / canvasWidth, availableHeight / canvasHeight, maxZoom);
    const safeZoom = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;

    const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    vpt[0] = safeZoom;
    vpt[3] = safeZoom;
    vpt[4] = (containerWidth - canvasWidth * safeZoom) / 2;
    vpt[5] = (containerHeight - canvasHeight * safeZoom) / 2;
    canvas.setViewportTransform(vpt);
    canvas.requestRenderAll();

    return safeZoom;
}

export const zoomCanvas = (canvas, direction = "in", step = 0.1, options = {}) => {
    if(!canvas) return 1;

    const minZoom = options.minZoom ?? 0.2;
    const maxZoom = options.maxZoom ?? 3;

    const currentZoom = canvas.getZoom?.() || 1;
    const delta = direction === "out" ? -step : step;
    const targetZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom + delta));

    const centerPoint = typeof canvas.getVpCenter === 'function'
        ? canvas.getVpCenter()
        : { x: (canvas.width || 1) / 2, y: (canvas.height || 1) / 2 };
    const container = canvas.wrapperEl?.parentElement;
    const containerWidth = container?.clientWidth || canvas.width || 1;
    const containerHeight = container?.clientHeight || canvas.height || 1;
    const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];

    vpt[0] = targetZoom;
    vpt[3] = targetZoom;
    vpt[4] = containerWidth / 2 - centerPoint.x * targetZoom;
    vpt[5] = containerHeight / 2 - centerPoint.y * targetZoom;
    canvas.setViewportTransform(vpt);
    canvas.requestRenderAll();
    return targetZoom;
}

const getViewportCenterPoint = (canvas) => {
    if(!canvas) return { left: 100, top: 100 };

    if(typeof canvas.getVpCenter === "function"){
        const point = canvas.getVpCenter();
        return { left: point.x, top: point.y };
    }

    const zoom = canvas.getZoom?.() || 1;
    const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    const container = canvas.wrapperEl?.parentElement;
    const viewportWidth = container?.clientWidth || canvas.getWidth?.() || 1;
    const viewportHeight = container?.clientHeight || canvas.getHeight?.() || 1;

    return {
        left: (viewportWidth / 2 - vpt[4]) / zoom,
        top: (viewportHeight / 2 - vpt[5]) / zoom,
    };
}

export const addShapeToCanvas = async (canvas,shapeType, customProps={})=>{
    if(!canvas) return null;
    try {
        const fabricModule = await import('fabric');
        const centerPoint = getViewportCenterPoint(canvas);

        const shape = createShape(fabricModule,shapeType, shapeDefinations, {
            left:centerPoint.left,
            top:centerPoint.top,
            ...customProps
        })

        if(shape){
            shape.id = `${shapeType}-${Date.now()}`
            canvas.add(shape)
            canvas.setActiveObject(shape)
            canvas.renderAll()
            return shape
        }
    } catch (error) {
        console.error(error)
    }
}

export const addTextToCanvas = async (canvas, text, options = {}, withBackground = false)=>{
    if(!canvas) return null;

    try {
        const {IText} = await import('fabric');
        const centerPoint = getViewportCenterPoint(canvas);

        const defaultProps = {
            left: centerPoint.left,
            top: centerPoint.top,
            fontSize: 24,
            fontFamily: 'Arial',
            fill: '#000000',
            padding: withBackground ? 10 : 0,
            TextAlign: 'left',
            id: `text-${Date.now()}`
        }

        const textObj = new IText(text,{
            ...defaultProps,
            ...options
        })

        canvas.add(textObj)
        canvas.setActiveObject(textObj)
        canvas.renderAll()
    } catch (error) {
        return null
    }
}

export const addImageToCanvas = async (canvas,imageUrl)=>{
    if(!canvas) return null;

    try {
        const {Image: FabricImage } = await import("fabric")

        let imageObj = new Image()
        imageObj.crossOrigin = 'Anonymous'
        imageObj.src = imageUrl

        return new Promise((resolve,reject)=>{
            imageObj.onload = ()=>{
                const centerPoint = getViewportCenterPoint(canvas);
                let image = new FabricImage(imageObj)
                image.set({
                    id : `image-${Date.now()}`,
                    top: centerPoint.top,
                    left: centerPoint.left,
                    padding: 10,
                    cornorSize: 10
                })
                const maxDimension = 400;

                if(image.width > maxDimension || image.height > maxDimension){
                    if(image.width > image.height){
                        const scale = maxDimension/image.width;
                        image.scale(scale)
                    }else {
                        const scale = maxDimension/image.height;
                        image.scale(scale)
                    }
                }

                canvas.add(image)
                canvas.setActiveObject(image)
                canvas.renderAll()
                resolve(image)
            }

            imageObj.onerror = ()=>{
                reject(new Error('failed to load image',imageUrl))
            }
        })

    } catch (error) {
        console.error('Error adding image')
        return null;
    }
}

export const toogleDrawingMode = (canvas,isDrawingMode,drawingColor="#000000",brushWidth=5)=>{
    if(!canvas) return null;
    try {
        canvas.isDrawingMode = isDrawingMode;
        if(isDrawingMode){
            canvas.freeDrawingBrush.color = drawingColor;
            canvas.freeDrawingBrush.brushWidth = brushWidth;
        }

        return true;
    } catch (error) {
        return false;
    }
}

export const toogleErasingMode = (canvas,isErasing,previousColor = "#000000",eraseWidth=20)=>{
    if(!canvas || !canvas.freeDrawingBrush) return false;
    
    try {
       if(isErasing){
        canvas.freeDrawingBrush.color = "#ffffff";
        canvas.freeDrawingBrush.width = eraseWidth;
    } else{
        canvas.freeDrawingBrush.color = previousColor;
        canvas.freeDrawingBrush.width = 5;
    }
    
    return true;
} catch (error) {
    return false;
}
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export const updateDrawingBrush = (canvas,properties={})=>{
    if(!canvas || !canvas.freeDrawingBrush) return false;

    try {
        const {color,width,opacity} = properties;

        if(width !== undefined){
            canvas.freeDrawingBrush.width = width;
        }

        if(color !== undefined && opacity !== undefined){
            const rgb = hexToRgb(color);
            if(rgb){
                canvas.freeDrawingBrush.color = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
            }
        } else if(color !== undefined){
            canvas.freeDrawingBrush.color = color;
        }
        
        return true;
    } catch (error) {
        return false;
    }
}

export const cloneSelectedObject = async (canvas)=>{
    if(!canvas) return

    const activeObject = canvas.getActiveObject();
    if(!activeObject) return;

    try {
        const clonedObj = await activeObject.clone();

        clonedObj.set({
            left : activeObject.left + 10,
            top: activeObject.top + 10,
            id: `${activeObject.type  || 'Object'}-${Date.now()}`
        })

        canvas.add(clonedObj);
        canvas.renderAll();

        return clonedObj;
    } catch (error) {
        console.error("Error while cloning",e)
        return null;
    }
}

export const deleteSelectedObject = async (canvas)=>{
     if(!canvas) return

    const activeObject = canvas.getActiveObject();
    if(!activeObject) return;

    try {
        canvas.remove(activeObject);
        canvas.discardActiveObject()
        canvas.renderAll();

        return true;
    } catch (error) {
        console.error("Error while deleting",e)
        return false;
    }
}

export const customizeBoundingBox = (canvas)=>{
    if(!canvas) return;

    try {
        canvas.on('object:added', (e)=>{
            if(e.target){
                e.target.set({
                    borderColor: '#2196f3',
                    cornerColor: '#ffffff',
                    cornerStrokeColor: '#2196f3',
                    cornerSize: 10,
                    transparentCorners: false,
                })
            }
        })

        canvas.getObjects().forEach(obj=>{
            obj.set({
                borderColor: '#2196f3',
                cornerColor: '#ffffff',
                cornerStrokeColor: '#2196f3',
                cornerSize: 10,
                transparentCorners: false,
        })
        })

        canvas.renderAll();
    } catch (error) {
        console.error("Failed to customise bounding box");
    }
}