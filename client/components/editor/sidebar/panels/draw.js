'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { brushSizes, drawingPanelColorPresets } from "@/config";
import { toogleDrawingMode, toogleErasingMode, updateDrawingBrush } from "@/fabric/fabric-utils";
import { useEditorStore } from "@/store";
import { EraserIcon, Minus, Paintbrush, PencilIcon, Plus, Droplets, Palette } from "lucide-react";
import { useState } from "react";

function DrawPanel(){
    const {canvas} = useEditorStore();
    const [isDrawingMode,setIsDrawingMode] = useState(false);
    const [isErasing,setIsErasing] = useState(false);
    const [drawingColor,setDrawingColor] = useState('#000000');
    const [brushWidth,setBrushWidth] = useState(5);
    const [drawingOpacity,setDrawingOpacity] = useState(100);
    const [activeTab, setActiveTab] = useState('colors');

    const handleToggleDrawingMode = ()=>{
        if(!canvas) return;
        const newMode = !isDrawingMode;
        setIsDrawingMode(newMode);
        if(newMode && isErasing){
            setIsErasing(false);
        }

        toogleDrawingMode(canvas, newMode, drawingColor,brushWidth);
        if(newMode){
            updateDrawingBrush(canvas,{color: drawingColor, opacity: drawingOpacity/100});
        }
    }

    const handleDrawingColorChange = (color)=>{
        setDrawingColor(color)

        if(canvas && isDrawingMode && !isErasing){
            updateDrawingBrush(canvas,{color, opacity: drawingOpacity/100});
        }
    }

    const handleBrushWidthChange = (width)=>{
        setBrushWidth(width)
        
        if(canvas && isDrawingMode){
            updateDrawingBrush(canvas,{width: isErasing ? width*2 : width});
        }
    }

    const handleDrawingOpacityChange = (value)=>{
        const opacity = Number(value[0]);
        setDrawingOpacity(opacity);

        if(canvas && isDrawingMode){
            updateDrawingBrush(canvas,{color: drawingColor, opacity: opacity/100});
        }
    }
    
    const handleToggleErasing = ()=>{
        if(!canvas && !isDrawingMode) return;
        const newErasing = !isErasing
        setIsErasing(newErasing);

        toogleErasingMode(canvas,newErasing,drawingColor,brushWidth*2);
    }
    return (
        <div className="p-4">
            <div className="space-y-5">
                <Button
                    variant={isDrawingMode ? 'default' : 'outline'}
                    className={'w-full py-6  group transition-all'}
                    size="lg"
                    onClick={handleToggleDrawingMode}
                >
                    <PencilIcon
                        className={`mr-2 h-5 w-5 ${isDrawingMode ? 'animate-bounce' : 'hover:animate-bounce'}`}
                    />
                <span className="font-medium">
                    {isDrawingMode ? 'Exit Drawing Mode' : 'Enter Drawing Mode'}
                </span>
                </Button>
                {
                    isDrawingMode && (
                        <>
                        <Tabs defaultValue="colors"
                            className={'w-full'}
                            value={activeTab}
                            onValueChange={setActiveTab}
                            >
                            <TabsList className={'grid grid-cols-3 mb-4'}>
                                <TabsTrigger value="colors"><Palette className="mr-2 h-4 w-4"/>Colors</TabsTrigger>
                                <TabsTrigger value="brush"><Paintbrush className="mr-2 h-4 w-4"/>Brush</TabsTrigger>
                                <TabsTrigger value="tools"><EraserIcon className="mr-2 h-4 w-4"/>Tools</TabsTrigger>
                            </TabsList>
                            <TabsContent key="colors" value="colors">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <Label>Color Palette</Label>
                                            <div
                                            className="w-6 h-6 rounded-full border shadow-sm"
                                            style={{backgroundColor: drawingColor}}/>
                                        </div>
                                        <div className="grid grid-cols-5 gap-2">
                                            {
                                                drawingPanelColorPresets.map(color=>(
                                                    <div key={color}
                                                    className={`w-10 h-10 rounded-full border transition-transform hover:scale-110 ${color === drawingColor ? 'ring-1 ring-offest-2 ring-primary':''}`}
                                                    style={{backgroundColor:color}}
                                                    onClick={()=> handleDrawingColorChange(color)}
                                                    />
                                                ))
                                            }
                                        </div>
                                        <div className="flex mt-5 space-x-2">
                                            <div className="relative ">
                                                <Input 
                                                type="color"
                                                value={drawingColor}
                                                onChange={(e)=> handleDrawingColorChange(e.target.value)}
                                                className={'w-12 h-10 p-1 cursor-pointer'}
                                                disabled={isErasing}
                                                />
                                            </div>
                                            <Input 
                                            type="text"
                                            value={drawingColor}
                                            onChange={(e)=> handleDrawingColorChange(e.target.value)}
                                            className={'flex-1'}
                                            disabled={isErasing}
                                            />
                                        </div>
                                    </div>
                                    </TabsContent>
                                <TabsContent key="brush" value="brush" className={"space-y-4"}>
                                        <div className="space-y-3">
                                            <Label className={`block text-sm font-semibold`}>Brush Size</Label>
                                            <div className="flex items-center space-x-3">
                                                <Minus className="h-1 w-4 text-gray-500"/>
                                                <Slider
                                                    value={[brushWidth]}
                                                    min={1}
                                                    max={30}
                                                    step={1}
                                                    onValueChange={(value)=> handleBrushWidthChange(value[0])}
                                                    className={'flex-1'}
                                                />
                                                <Plus className="h-1 w-4 text-gray-500"/>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {
                                                    brushSizes.map(size=>(
                                                        <Button key={size.value}
                                                        variant={size.value === brushWidth ? 'default' : 'outline'}
                                                        className={'px-2 py-1 h-auto'}
                                                        onClick={()=>handleBrushWidthChange(size.value)}
                                                        >
                                                            {size.label}
                                                        </Button>
                                                    ))
                                                }
                                            </div>
                                            <div className="space-y-2 mt-4">
                                                <div className="flex justify-between items-center">
                                                    <Label className={'font-medium flex items-center'}>
                                                        <Droplets className="mr-2 h-4 w-4"/>
                                                        Opacity
                                                    </Label>
                                                    <span className="font-medium text-sm">
                                                        {drawingOpacity}%
                                                    </span>
                                                </div>
                                                <Slider
                                                    value={[drawingOpacity]}
                                                    min={1}
                                                    max={100}
                                                    step={1}
                                                    onValueChange={(value)=> handleDrawingOpacityChange(value)}
                                                    className={'w-full'}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>
                                <TabsContent key="tools" value="tools">
                                    <Button
                                        onClick={handleToggleErasing}
                                        variant={isErasing ? 'destructive' : 'outline'}
                                        className={'w-full p-6'}
                                        size="lg"
                                    >
                                        <EraserIcon className="mr-2 w-5 h-5"/>
                                        {
                                            isErasing ? "Stop Erasing" : "Eraser mode"
                                        }
                                    </Button>
                                </TabsContent>
                        </Tabs>
                        </>
                    )
                }
            </div>
        </div>
    )
}

export default DrawPanel;