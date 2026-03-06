'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { fontFamilies } from "@/config";
import { cloneSelectedObject, deleteSelectedObject } from "@/fabric/fabric-utils";
import { useEditorStore } from "@/store";
import { Bold, Copy, FlipHorizontal, FlipVertical, Italic, MoveDown, MoveUp, Trash, Underline } from "lucide-react";
import { useEffect, useState } from "react";

function Properties(){
    const {canvas} = useEditorStore();

    // active object
    const [selectedObject, setSelectedObject] = useState(null);
    const [objectType,setObjectType] = useState("");
    // common

    const [opacity,setOpacity] = useState(10);
    const [width,setWidth] = useState(0);
    const [height,setHeight] = useState(0);
    
    // text
    const [textProperties,setTextProperties] = useState({
        text: "",
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fontStyle: 'normal',
        backgroundColor: '#ffffff',
        underline: false,
        textColor: "#000000",
        textBackgroundColor: "",
        letterSpacing: 0,
    })

    // shapes
    // fillColor,borderColor, borderWidth, borderStyle
    const [shapeProperties,setShapeProperties] = useState({
        borderColor:"#000000",
        backgroundColor:"#000000",
        borderStyle:"solid",
        borderWidth: 0,
        filter:"none",
        blur:0,
    })

    const loadBorderProperties = (activeObject)=>{
        let borderStyle = "solid";
        if(Array.isArray(activeObject?.strokeDashArray) && activeObject.strokeDashArray.length){
            borderStyle = activeObject.strokeDashArray[0] <= 3 ? "dotted" : "dashed";
        }

        setShapeProperties((prev)=>({
            ...prev,
            backgroundColor: activeObject?.fill ?? "#000000",
            borderColor: activeObject?.stroke ?? "#000000",
            borderWidth: Number(activeObject?.strokeWidth ?? 0),
            borderStyle,
        }))
    }
    // filter, blur
    // images

    // addtional

    useEffect(()=>{
        if(!canvas) return;
        const handleSelectionCreated = ()=>{
            const activeObject = canvas.getActiveObject();

            if(activeObject){
                console.log(activeObject.type,"active object")
                setSelectedObject(activeObject);
                // update commom properties when loaded
                setOpacity(Math.round(activeObject.opacity*100 || 100));
                setWidth(Math.round(activeObject.width* activeObject.scaleX));
                setHeight(Math.round(activeObject.height* activeObject.scaleY));

                // check based on type
                if(["i-text", "textbox", "text"].includes(activeObject.type)){
                    setObjectType("text")
                    setTextProperties((prev)=>({
                        ...prev,
                        text: activeObject.text ?? "",
                        fontSize: activeObject.fontSize ?? 24,
                        fontFamily: activeObject.fontFamily ?? "Arial",
                        fontWeight: activeObject.fontWeight ?? "normal",
                        fontStyle: activeObject.fontStyle ?? "normal",
                        underline: Boolean(activeObject.underline),
                        textColor: activeObject.fill ?? "#000000",
                        backgroundColor: activeObject.textBackgroundColor ?? "",
                        letterSpacing: activeObject.charSpacing ?? activeObject.letterSpacing ?? 0,
                    }))
                }else if(activeObject.type === "image"){
                    setObjectType("image")
                    const imageFilters = activeObject?.filters || [];
                    const blurFilter = imageFilters.find((item) => item?.type === "Blur");
                    const has = (name) => imageFilters.some((item) => item?.type === name);

                    let selectedFilter = "none";
                    if (has("Grayscale")) selectedFilter = "grayscale";
                    else if (has("Sepia")) selectedFilter = "sepia";
                    else if (has("Invert")) selectedFilter = "invert";
                    else if (has("Blur")) selectedFilter = "blur";

                    setShapeProperties((prev) => ({
                        ...prev,
                        filter: selectedFilter,
                        blur: blurFilter ? Math.round((blurFilter.blur || 0) * 100) : 0,
                    }));
                    loadBorderProperties(activeObject)
                }else if(activeObject.type === "path"){
                    setObjectType("path")
                    loadBorderProperties(activeObject)
                }else {
                    setObjectType('shape')
                    loadBorderProperties(activeObject)
                }
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
        // console.log(property,value,"update property")
        if(!canvas || !selectedObject) return;

        selectedObject.set(property,value);
        canvas.renderAll();
    }

    // opacity
    const handleOpacityChange = (value)=>{
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

    const handleTextPropertiesChange = (e,name)=>{
        const rawValue = Array.isArray(e)
            ? e[0]
            : typeof e === "string"
                ? e
                : e?.target?.value;
        const value = name === "fontSize" || name === "letterSpacing"  ? Number(rawValue) : rawValue;

        const objectPropertyMap = {
            textColor: "fill",
            letterSpacing: "charSpacing",
        };
        const objectProperty = objectPropertyMap[name] || name;

        setTextProperties((prev)=>({...prev, [name]: value}))

        updateObjectProperty(objectProperty,value)
    }

    const getStrokeDashArray = (style)=>{
        if(style === "dashed") return [5, 5];
        if(style === "dotted") return [2, 2];
        return null;
    }

    const handleShapePropertiesChange = (e,name)=>{
        const rawValue = Array.isArray(e)
            ? e[0]
            : typeof e === "string"
                ? e
                : e?.target?.value;

        if(!canvas || !selectedObject) return;

        const objectPropertyMap = {
            backgroundColor: "fill",
            borderColor: "stroke",
            borderWidth: "strokeWidth",
            borderStyle: "strokeDashArray",
        };

        const valueTransformMap = {
            borderWidth: (value)=> Number(value),
            borderStyle: (value)=> getStrokeDashArray(value),
        };

        const value = valueTransformMap[name]
            ? valueTransformMap[name](rawValue)
            : rawValue;

        const objectProperty = objectPropertyMap[name] || name;

        setShapeProperties((prev)=>({...prev, [name]: rawValue}))
        updateObjectProperty(objectProperty, value)
    }

    const handleTextPropertiesToggle = (name)=>{
        let nextValue;
        setTextProperties((prev)=> {

            if (name === "fontWeight") {
            nextValue = prev.fontWeight === "bold" ? "normal" : "bold";
            } else if (name === "fontStyle") {
            nextValue = prev.fontStyle === "italic" ? "normal" : "italic";
            } else if (name === "underline") {
            nextValue = !prev.underline;
            } else {
            return prev;
            }
            
            return {
                ...prev,
                [name]: nextValue
            }
        })
        updateObjectProperty(name,nextValue);
    }

    const handleImageFilterChange = async (value)=>{
        setShapeProperties((prev)=>({...prev, filter: value}))

        if(!canvas || !selectedObject || selectedObject.type !== 'image') return

        try {
            canvas.discardActiveObject();

            const {filters} = await import("fabric");

            selectedObject.filters = [];

            switch (value){
                case 'grayscale':
                    selectedObject.filters.push(new filters.Grayscale());

                    break;
                case 'sepia':
                    selectedObject.filters.push(new filters.Sepia());

                    break;
                case 'invert':
                    selectedObject.filters.push(new filters.Invert());

                    break;
                case 'blur':
                    selectedObject.filters.push(new filters.Blur({blur : shapeProperties.blur/100}));

                    break;
                case 'none':
                default:
                    break;
            }

            selectedObject.applyFilters();

            canvas.setActiveObject(selectedObject);
            canvas.requestRenderAll();
        } catch (error) {
            console.error("Falied to change image filter")
        }
    }

    const handleBlurChange = async (value)=>{
        const newBlurValue = value[0]
        setShapeProperties((prev)=>({...prev, blur: newBlurValue}))
        if(!canvas || !selectedObject || selectedObject.type !== 'image' || shapeProperties.filter !== "blur") return

        try {
            const {filters} = await import('fabric');
            
            selectedObject.filters = [new filters.Blur({blur: newBlurValue/100})]

            selectedObject.applyFilters();
            canvas.requestRenderAll();
        } catch (error) {
            console.error("Error while applying blur")
        }
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

                {/* text related properties */}
                {
                    objectType === "text" && (
                        <div className="space-y-4 border-t">
                            <h3 className="text-sm font-medium">Text Properties</h3>
                            <div className="space-y-2">
                                <Label className={"text-xs"} htmlFor="text-content">
                                    Text Content
                                </Label>
                                <Textarea
                                id="text-content"
                                value={textProperties.text}
                                onChange={(e)=> handleTextPropertiesChange(e,"text")}
                                className={"h-20 resize-none"}/>
                            </div>
                            <div className="space-y-2">
                                <Label className={"text-xs"} htmlFor="font-size">
                                   Font Size
                                </Label>
                                <Input
                                id="font-size"
                                type={"Number"}
                                value={textProperties.fontSize}
                                onChange={(e)=> handleTextPropertiesChange(e,"fontSize")}
                                className={"w-16 h-7 text-xs"}/>
                            </div>
                            <div className="space-y-2">
                                <Label className={"text-sm"} htmlFor="font-family">
                                   Font Family
                                </Label>
                                <Select value={textProperties.fontFamily} onValueChange={(e)=> handleTextPropertiesChange(e,"fontFamily")}>
                                    <SelectTrigger id="font-family" className={"h-10"}>
                                        <SelectValue placeholder="Select Font"></SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            fontFamilies.map((fontItem)=> (
                                                <SelectItem key={fontItem} value={fontItem} style={{fontFamily : fontItem}}>
                                                    {fontItem}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className={"text-sm"}>
                                    Style
                                </Label>
                                <div className="flex gap-2">
                                    <Button
                                        variant={textProperties.fontWeight === "bold" ? "default" : "outline"}
                                        size="icon"
                                        onClick={()=> handleTextPropertiesToggle("fontWeight")}
                                        className={"w-8 h-8"}
                                    >
                                        <Bold className="w-4 h-4"/>
                                    </Button>
                                    <Button
                                        variant={textProperties.fontStyle === "italic" ? "default" : "outline"}
                                        size="icon"
                                        onClick={()=> handleTextPropertiesToggle("fontStyle")}
                                        className={"w-8 h-8"}
                                    >
                                        <Italic className="w-4 h-4"/>
                                    </Button>
                                    <Button
                                        variant={textProperties.underline ? "default" : "outline"}
                                        size="icon"
                                        onClick={()=> handleTextPropertiesToggle("underline")}
                                        className={"w-8 h-8"}
                                    >
                                        <Underline className="w-4 h-4"/>
                                    </Button>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                 <div className="space-y-2">
                                <Label htmlFor="text-color" className={"text-sm"}>
                                    Text Color
                                </Label>
                                <div className="relative w-8 h-8 overflow-hidden rounded-md border">
                                    <div className="absolute inset-0"
                                    style={{backgroundColor: textProperties.textColor}}/>
                                        <Input
                                            id="text-color"
                                            type="color"
                                            value={textProperties.textColor}
                                            onChange={(e)=> handleTextPropertiesChange(e,"textColor")}
                                            className={"absolute inset-0 opacity-0 cursor-point"}
                                        />
                                </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="text-bg-color" className={"text-sm"}>
                                        Text BG Color
                                    </Label>
                                    <div className="relative w-8 h-8 overflow-hidden rounded-md border">
                                        <div className="absolute inset-0"
                                        style={{backgroundColor: textProperties.backgroundColor}}/>
                                            <Input
                                                id="text-bg-color"
                                                type="color"
                                                value={textProperties.backgroundColor}
                                                onChange={(e)=> handleTextPropertiesChange(e,"backgroundColor")}
                                                className={"absolute inset-0 opacity-0 cursor-point"}
                                            />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label className={"text-xs"} htmlFor="letter-spacing">
                                    Letter Spacing
                                    </Label>
                                    <span>{textProperties.letterSpacing}</span>
                                </div>
                                <Slider
                                id="letter-spacing"
                                min={-200}
                                max={800}
                                step={10}
                                value={[textProperties.letterSpacing]}
                                onValueChange={(e)=> handleTextPropertiesChange(e,"letterSpacing")}
                                />
                            </div>

                        </div>
                    )
                }

                {/* shape */}
                {
                    objectType === "shape" && (
                        <div className="space-y-4 p-4 border-t">
                            <h3 className="text-sm font-medium">Shape Properties</h3>
                            <div className="flex justify-between">
                                 <div className="space-y-2">
                                    <Label htmlFor="fill-color" className={'text-xs'}>Fill Color</Label>
                                    <div className="relative w-8 h-8 overflow-hidden rounded-md border">
                                        <div className="absolute inset-0"
                                        style={{backgroundColor: shapeProperties.backgroundColor}}/>
                                            <Input
                                                id="fill-color"
                                                type="color"
                                                value={shapeProperties.backgroundColor}
                                                onChange={(e)=> handleShapePropertiesChange(e,"backgroundColor")} 
                                                className={"absolute inset-0 opacity-0 cursor-point"}
                                            />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="border-color" className={'text-xs'}>Border Color</Label>
                                    <div className="relative w-8 h-8 overflow-hidden rounded-md border">
                                        <div className="absolute inset-0"
                                        style={{borderColor: shapeProperties.borderColor}}/>
                                            <Input
                                                id="border-color"
                                                type="color"
                                                value={shapeProperties.borderColor}
                                                onChange={(e)=> handleShapePropertiesChange(e,"borderColor")}
                                                className={"absolute inset-0 opacity-0 cursor-point"}
                                            />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="border-width" className={'text-xs mb-2'}>Border Width</Label>
                                <span className="text-xs">{shapeProperties.borderWidth}%</span>
                                <Slider
                                id="border-width"
                                min={0}
                                max={20}
                                step={1}
                                value={[shapeProperties.borderWidth]}
                                onValueChange={(val)=> handleShapePropertiesChange(val,"borderWidth")} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="border-style" className={'text-xs'}>Border Style</Label>
                                <Select value={shapeProperties.borderStyle} onValueChange={(e)=> handleShapePropertiesChange(e,"borderStyle")}>
                                    <SelectTrigger id="border-style" className={"h-10"}>
                                        <SelectValue placeholder="Select Border Style"></SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="solid">Solid</SelectItem>
                                        <SelectItem value="dashed">Dashed</SelectItem>
                                        <SelectItem value="dotted">Dotted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                        </div>
                    )
                }
                {/* image */}
                {
                    objectType === "image" && (
                         <div className="space-y-4 p-4 border-t">
                            <h3 className="text-sm font-medium">Shape Properties</h3>
                            <div className="space-y-2">
                                <Label htmlFor="border-color" className={'text-xs'}>Border Color</Label>
                                <div className="relative w-8 h-8 overflow-hidden rounded-md border">
                                    <div className="absolute inset-0"
                                    style={{borderColor: shapeProperties.borderColor}}/>
                                        <Input
                                            id="border-color"
                                            type="color"
                                            value={shapeProperties.borderColor}
                                            onChange={(e)=> handleShapePropertiesChange(e,"borderColor")}
                                            className={"absolute inset-0 opacity-0 cursor-point"}
                                        />
                                </div>
                            </div>
                                
                             <div className="space-y-2">
                                <Label htmlFor="border-width" className={'text-xs mb-2'}>Border Width</Label>
                                <span className="text-xs">{shapeProperties.borderWidth}%</span>
                                <Slider
                                id="border-width"
                                min={0}
                                max={20}
                                step={1}
                                value={[shapeProperties.borderWidth]}
                                onValueChange={(val)=> handleShapePropertiesChange(val,"borderWidth")} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="border-style" className={'text-xs'}>Border Style</Label>
                                <Select value={shapeProperties.borderStyle} onValueChange={(e)=> handleShapePropertiesChange(e,"borderStyle")}>
                                    <SelectTrigger id="border-style" className={"h-10"}>
                                        <SelectValue placeholder="Select Border Style"></SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="solid">Solid</SelectItem>
                                        <SelectItem value="dashed">Dashed</SelectItem>
                                        <SelectItem value="dotted">Dotted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="filter" className={'text-xs'}>Filter</Label>
                                <Select value={shapeProperties.filter} onValueChange={(value)=> handleImageFilterChange(value)}>
                                    <SelectTrigger id="filter" className={"h-10"}>
                                        <SelectValue placeholder="Select Image Filter"></SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="grayscale">Grayscale</SelectItem>
                                        <SelectItem value="sepia">Sepia</SelectItem>
                                        <SelectItem value="invert">Invert</SelectItem>
                                        <SelectItem value="blur">Blur</SelectItem>
                                    </SelectContent>
                                </Select>
                                {
                                    shapeProperties.filter === 'blur' && (
                                        <div className="space-y-2">
                                            {/* <div className="flex justify-between mb-4"> */}
                                                <Label htmlFor="blur" className={'text-xs'}>Blur Amount</Label>
                                                <span className="font-medium text-xs">{shapeProperties.blur}%</span>
                                                <Slider
                                                id="blur"
                                                min={0}
                                                max={20}
                                                step={1}
                                                value={[shapeProperties.blur]}
                                                onValueChange={(val)=> handleBlurChange(val)} 
                                                />
                                            {/* </div> */}
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    )
                }
                {/* path */}
                {
                    objectType === "path" && (
                         <div className="space-y-4 p-4 border-t">
                            <h3 className="text-sm font-medium">Path Properties</h3>
                            <div className="space-y-2">
                                <Label htmlFor="border-color" className={'text-xs'}>Border Color</Label>
                                <div className="relative w-8 h-8 overflow-hidden rounded-md border">
                                    <div className="absolute inset-0"
                                    style={{borderColor: shapeProperties.borderColor}}/>
                                        <Input
                                            id="border-color"
                                            type="color"
                                            value={shapeProperties.borderColor}
                                            onChange={(e)=> handleShapePropertiesChange(e,"borderColor")}
                                            className={"absolute inset-0 opacity-0 cursor-point"}
                                        />
                                </div>
                            </div>
                                
                             <div className="space-y-2">
                                <Label htmlFor="border-width" className={'text-xs mb-2'}>Border Width</Label>
                                <span className="text-xs">{shapeProperties.borderWidth}%</span>
                                <Slider
                                id="border-width"
                                min={0}
                                max={20}
                                step={1}
                                value={[shapeProperties.borderWidth]}
                                onValueChange={(val)=> handleShapePropertiesChange(val,"borderWidth")} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="border-style" className={'text-xs'}>Border Style</Label>
                                <Select value={shapeProperties.borderStyle} onValueChange={(e)=> handleShapePropertiesChange(e,"borderStyle")}>
                                    <SelectTrigger id="border-style" className={"h-10"}>
                                        <SelectValue placeholder="Select Border Style"></SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="solid">Solid</SelectItem>
                                        <SelectItem value="dashed">Dashed</SelectItem>
                                        <SelectItem value="dotted">Dotted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default Properties;
