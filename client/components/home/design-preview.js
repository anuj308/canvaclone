'use client'

import { useEffect, useRef, useId } from "react";

function DesignPreview({design}){
    const generatedId = useId();
    const canvasId = `canvas-${design?._id || design?.id || generatedId}`;
    const fabricCanvasRef = useRef(null);
    const PREVIEW_WIDTH = 300;
    const PREVIEW_HEIGHT = 200;

    const disposeCanvas = () => {
        if (fabricCanvasRef.current && typeof fabricCanvasRef.current.dispose === 'function') {
            try {
                fabricCanvasRef.current.dispose();
            } catch (error) {
                console.error('Error while disposing the canvas', error);
            } finally {
                fabricCanvasRef.current = null;
            }
        }
    };

    useEffect(()=>{
        if(!design?.canvasData) return;

        const timer = setTimeout( async () => {
            try {
                disposeCanvas();
                
                const fabric = await import('fabric')
                const canvasElement = document.getElementById(canvasId);
                
                if(!canvasElement) return;
                
                const designPreviewCanvas = new fabric.StaticCanvas(canvasElement,{
                    width: PREVIEW_WIDTH,
                    height: PREVIEW_HEIGHT,
                    renderOnAddRemove: true
                })
                
                fabricCanvasRef.current = designPreviewCanvas;
                
                let canvasData;
                
                try {
                    canvasData = typeof design.canvasData === 'string' ? JSON.parse(design.canvasData) : design.canvasData

                } catch (innerErr) {
                    console.error('Error parsing canvas data');
                    return;
                }
                
                if(canvasData.background){
                    designPreviewCanvas.backgroundColor = canvasData.background;
                }

                await designPreviewCanvas.loadFromJSON(canvasData);

                const sourceWidth = Number(design?.width || canvasData?.width || PREVIEW_WIDTH);
                const sourceHeight = Number(design?.height || canvasData?.height || PREVIEW_HEIGHT);

                const safeWidth = Number.isFinite(sourceWidth) && sourceWidth > 0 ? sourceWidth : PREVIEW_WIDTH;
                const safeHeight = Number.isFinite(sourceHeight) && sourceHeight > 0 ? sourceHeight : PREVIEW_HEIGHT;

                const scale = Math.min(PREVIEW_WIDTH / safeWidth, PREVIEW_HEIGHT / safeHeight);
                const offsetX = (PREVIEW_WIDTH - safeWidth * scale) / 2;
                const offsetY = (PREVIEW_HEIGHT - safeHeight * scale) / 2;

                designPreviewCanvas.setViewportTransform([scale, 0, 0, scale, offsetX, offsetY]);
                designPreviewCanvas.requestRenderAll();
            } catch (error) {
                console.error('Error rendering design preview data', error)
            }
        }, 100);
        
        return ()=>{
            clearTimeout(timer);
            disposeCanvas();
        }
    },[design?._id, design?.canvasData, design?.width, design?.height, canvasId])
    return <canvas id={canvasId} width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT} className="h-full w-full" />
}

export default DesignPreview;