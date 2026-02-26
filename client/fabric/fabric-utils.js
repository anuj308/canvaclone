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

    canvasWrapper.style.width = `${canvas.width}`;
    canvasWrapper.style.top = "50%";
    canvasWrapper.style.left = "50%";
    canvasWrapper.style.transform = "translate(-50%,-50%)";
}

export const addShapeToCanvas = async (canvas,shapeType, customProps={})=>{
    if(!canvas) return null;
    try {
        const fabricModule = await import('fabric');

        const shape = createShape(fabricModule,shapeType, shapeDefinations, {
            left:100,
            top:100,
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

        const defaultProps = {
            left: 100,
            top: 100,
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
                let image = new FabricImage(imageObj)
                image.set({
                    id : `image-${Date.now()}`,
                    top: 100,
                    left: 100,
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