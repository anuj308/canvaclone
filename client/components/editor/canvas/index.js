'use client'

import { useEditorStore } from "@/store";
import { initializeFabric } from "@/fabric/fabric-utils";
import { useEffect, useRef } from "react";

function Canvas(){

    const canvasRef = useRef(null);
    const canvasContainerRef = useRef(null);
    const fabricCanvasRef = useRef(null);
    const initAttemptedRef = useRef(null);

    const {setCanvas} = useEditorStore();

    useEffect(()=>{
        const cleanUpCanvas = ()=>{
            if(fabricCanvasRef.current){

                try {
                    fabricCanvasRef.current.off();

                    fabricCanvasRef.current.off('object:added')
                    fabricCanvasRef.current.off('object:modified')
                    fabricCanvasRef.current.off('object:removed')
                    fabricCanvasRef.current.off('object:created')
                } catch (error) {
                    console.error('Error removing event listeners',error)
                }
                try {
                    fabricCanvasRef.current.dispose()
                } catch (error) {
                    console.error('Error disposing canvas',error)
                }

                fabricCanvasRef.current = null;
                setCanvas(null);
            }
        }

        cleanUpCanvas()
        // reset init flag
        initAttemptedRef.current = false;

        // init our canvas
        const initcanvas = async ()=>{
            if(typeof window === undefined || !canvasRef.current || initAttemptedRef.current){
                return;
            }

            initAttemptedRef.current = true;

            try {
                const fabricCanvas = await initializeFabric(canvasRef.current, canvasContainerRef.current);

                if(!fabricCanvas){
                    console.error('Failed to initialize Fabric.js canvas')
                    return;
                }

                fabricCanvasRef.current = fabricCanvas;
                // set the canvas in store
                setCanvas(fabricCanvas);

                console.log('Canvas init is done and set in store');

                // apply custome style for the controls
                // todo
                // setup event listeners
                const handleCanvasChange = ()=>{
                    // implement auto save and save the canvas data
                    console.log('Canvas object changed')
                }

                fabricCanvas.on('object:added',handleCanvasChange)
                fabricCanvas.on('object:modified',handleCanvasChange)
                fabricCanvas.on('object:removed',handleCanvasChange)
                fabricCanvas.on('object:created',handleCanvasChange)

            } catch (error) {
                console.error('Failed to init canvas',error);
            }
        }

        const timer = setTimeout(()=>{
            initcanvas()
        },50)

        return ()=>{
            clearTimeout(timer);
            cleanUpCanvas();
        }
    },[])
    return ( 
        <div className="relative w-full h-[600px] overflow-auto" ref={canvasContainerRef}> 
            <canvas ref={canvasRef}/>
        </div>
    )
}

export default Canvas;