'use client'

import { useEditorStore } from "@/store";
import { useEffect,useState, useRef } from "react";
import { shapeDefinations, shapeTypes } from "@/fabric/shapes/shape-definations";

function ElementPanel(){

    const {canvas} = useEditorStore();
    const miniCanvasRef = useRef({});
    const canvasElementRef = useRef({});
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(()=>{
        if(isInitialized) return;
 
        const timer = setTimeout(async()=>{
            try {
                const fabric = await import('fabric');
                for(const shapeType of shapeTypes){
                    const canvasElement = canvasElementRef.current[shapeType];
                    if(!canvasElement) continue;
                    const canvasId = `mini-canvas-${shapeType}-${Date.now()}`
                    canvasElement.id = canvasId;

                    try {
                        const defination = shapeDefinations[shapeType]
                        const StaticCanvas = fabric.StaticCanvas || fabric.staticCanvas;
                        if(!StaticCanvas) continue;

                        const miniCanvas = new StaticCanvas(canvasId,{
                            width: 100,
                            height: 100,
                            backgroundColor: 'transparent',
                            renderOnAddRemove: true,
                        })

                        miniCanvasRef.current[shapeType] = miniCanvas
                        defination.thumbnail(fabric,miniCanvas)
                        miniCanvas.renderAll()
                    } catch (definitionErr) {
                        console.error('Error While creating defination', definitionErr)
                    }
                }
                setIsInitialized(true)
            } catch (error) {
                console.error("Failed to init",error)
            }
        },100)
        return ()=>  clearTimeout(timer);
    },[isInitialized])

    useEffect(()=>{
        return ()=> {
            Object.values(miniCanvasRef.current).forEach(miniCanvas=> {
                if(miniCanvas && typeof miniCanvas.dispose === 'function'){
                    try{
                        miniCanvas.dispose()
                    }catch(e){
                        console.error("Error in disposing canvas",e)
                    }
                }
            })
            miniCanvasRef.current={};
            setIsInitialized(false);
        }
    },[])

    const setCanvasRef = (getCurrentElement, shapeType)=>{
        if(getCurrentElement){
            canvasElementRef.current[shapeType] = getCurrentElement
        }
    }

    return (
        <div className="h-full overflow-y-auto p-2">
            <div className="grid grid-cols-3 gap-1">
                {
                    shapeTypes.map(shapeType=> (
                        <div style={{height: '90px'}} className="cursor-pointer flex flex-col items-center justify-center" key={shapeType}>
                            <canvas
                            width="100"
                            height="100"
                            ref={(el)=> setCanvasRef(el,shapeType)}
                            />
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default ElementPanel;