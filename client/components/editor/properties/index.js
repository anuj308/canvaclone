'use client'

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cloneSelectedObject, deleteSelectedObject } from "@/fabric/fabric-utils";
import { useEditorStore } from "@/store";
import { Copy, FlipHorizontal, FlipVertical, MoveDown, MoveUp, Trash } from "lucide-react";
import { useEffect, useState } from "react";

function Properties(){
    const {canvas} = useEditorStore();

    // active object
    const [selectedObject, setSelectedObject] = useState(null);
    
    // common

    const [opacity,setOpacity] = useState(10);
    const [width,setWidth] = useState(0);
    const [height,setHeight] = useState(0);
    
    // text
    // const [fontSize,setFontSize] = useState(24);
    // const [fontFamily,setFontFamily] = useState('Arial');
    // const [fontWeight,setFontWeight] = useState('normal');
    // const [fontStyle,setFontStyle] = useState('normal');
    // const [underline,setUnderline] = useState(false);
    // const [textColor,setTextColor] = useState("#000000");
    // const [textBackgroundColor,setBackgroundColor] = useState("");
    // const [letterSpacing,setLetterSpacing] = useState(0);
    const [textProperties,setTextProperties] = useState({
        text: "",
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        underline: false,
        textColor: "#000000",
        textBackgroundColor: "",
        letterSpacing: 0,
    })

    // shapes

    // images

    // addtional

    useEffect(()=>{
        if(!canvas) return;
        const handleSelectionCreated = ()=>{
            const activeObject = canvas.getActiveObject();

            if(activeObject){
                setSelectedObject(activeObject);
                // update commom properties when loaded
                setOpacity(Math.round(activeObject.opacity*100 || 100));
                setWidth(Math.round(activeObject.width* activeObject.scaleX));
                setHeight(Math.round(activeObject.height* activeObject.scaleY));
            }

        }
        const handleSelectionCleared = ()=>{

        }

        const activeObject = canvas.getActiveObject();
        if(activeObject){
            handleSelectionCreated();
        }

        canvas.on("selection:created", handleSelectionCreated);
        canvas.on("selection:updated", handleSelectionCreated);
        canvas.on("object:modified", handleSelectionCreated);
        canvas.on("selection:cleared", handleSelectionCleared);
        
        return ()=>{
            canvas.off("selection:created", handleSelectionCreated);
            canvas.off("selection:updated", handleSelectionCreated);
            canvas.off("object:modified", handleSelectionCreated);
            canvas.off("selection:cleared", handleSelectionCleared);

        }
    },[])
    const updateObjectProperty = (property,value)=>{
        console.log(property,value,"update property")
        if(!canvas || !selectedObject) return;

        selectedObject.set(property,value);
        canvas.renderAll();
    }

    // opacity
    const handleOpacityChange = (value)=>{
        // console.log(value)
        const newValue = Number(value[0]);
        setOpacity(newValue);
        updateObjectProperty('opacity',newValue/100);
    }
    // Duplicate
    const handleDuplicate = async ()=>{
        if(!canvas || !selectedObject) return;
        await cloneSelectedObject(canvas)
    }
    
    // Delete
    const handleDelete = ()=>{
        if(!canvas || !selectedObject) return;
        deleteSelectedObject(canvas);
    }
    
    // arrangement
    const handleBringToFront =  ()=>{
        if(!canvas || !selectedObject) return;
        canvas.bringObjectToFront(selectedObject);
        canvas.renderAll();
    }
    const handleSendToBack =  ()=>{
        if(!canvas || !selectedObject) return;
        canvas.sendObjectToBack(selectedObject);
        canvas.renderAll();
    }
    
    // FLip H & Flip V
    const handleFlipHorizontal = ()=>{
        if(!canvas || !selectedObject) return;
        const flipX = !selectedObject.flipX;
        updateObjectProperty('flipX',flipX)
    }
    
    const handleFlipVertical = ()=>{
        if(!canvas || !selectedObject) return;
        
        const flipY = !selectedObject.flipY;
        updateObjectProperty('flipY',flipY)
    }
    const textPropertiesChange = (e)=>{
        const value = e.target.value;
        const name = e.target.name;

        setTextProperties((prev)=>({ [name]: value, ...prev}))
    }
    return (
        <div className="fixed right-0 top-[56px] bottom-[0px] w-[280px] bg-white border-1 border-gray-200 z-10">
            <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                    <span className="font-medium">
                        Properties
                    </span>
                </div>
            </div>
            <div className="h-[calc(100%-96px)] overflow-auto p-4 space-y-6">
                <h3 className="text-sm font-medium">Size & Position</h3>
                {/* width & height */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className={"text-xs"}>Width</Label>
                        <div className="h-9 px-3 py-2 border rounded-md flex items-center">{width}</div>
                    </div> 
                     <div className="space-y-1">
                        <Label className={"text-xs"}>Height</Label>
                        <div className="h-9 px-3 py-2 border rounded-md flex items-center">{height}</div>
                    </div> 
                </div>
                {/* opacity */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label htmlFor="opacity" className={'text-xs'}>Opacity</Label>
                        <span>{opacity}%</span>
                    </div>
                    <Slider id="opacity"
                    min={0}
                    max={100}
                    step={1}
                    value={[opacity]}
                    onValueChange={(value)=> handleOpacityChange(value)}/>
                </div>
                {/* Flip H, Flip V */}
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleFlipHorizontal}
                    variant={'outline'} size="sm" className={'h-8 text-xs'}>
                        <FlipHorizontal className="h-4 w-4 mr-1"/>
                        Flip H
                    </Button>
                    <Button onClick={handleFlipVertical}
                    variant={'outline'} size="sm" className={'h-8 text-xs'}>
                        <FlipVertical className="h-4 w-4 mr-1"/>
                        Flip V
                    </Button>
                </div>
                {/* Arrangement */}
                <div className="space-y-4 pt-4  border-t">
                    <h3 className="text-sm font-medium">Layer Position</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={handleBringToFront} variant={'outline'} size="sm" className={"h-8 text-xs"}>
                            <MoveUp className="h-4 w-4 "/>
                            <span>Send to front</span>
                        </Button>
                        <Button onClick={handleSendToBack} variant={'outline'} size="sm" className={"h-8 text-xs"}>
                            <MoveDown className="h-4 w-4 "/>
                            <span>Send to back</span>
                        </Button>
                    </div>
                </div>

                {/* Duplicate & delete */}
                <div className="space-y-4 pt-4  border-t">
                    <h3 className="text-sm font-medium">Duplicate & Delete</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={handleDuplicate} variant={'default'} size="sm" className={"h-8 text-xs"}>
                            <Copy className="h-4 w-4 "/>
                            <span></span>
                        </Button>
                        <Button onClick={handleDelete} variant={'destructive'} size="sm" className={"h-8 text-xs"}>
                            <Trash className="h-4 w-4 "/>
                            <span>Delete</span>
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Properties;
