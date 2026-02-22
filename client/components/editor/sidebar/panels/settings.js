'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { centerCanvas } from "@/fabric/fabric-utils";
import { useEditorStore } from "@/store";
import { Check, Palette } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const colorPresets = [
    '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8',
    '#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#000000',
    '#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e',
    '#e11d48', '#be123c', '#9f1239', '#881337', '#fef2f2', '#fee2e2',
    '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c',
    '#7f1d1d', '#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c',
    '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12', '#fffbeb',
    '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706',
    '#b45309', '#92400e', '#78350f', '#fefce8', '#fef9c3', '#fef08a',
    '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207', '#854d0e',
    '#713f12', '#f7fee7', '#ecfccb', '#d9f99d', '#bef264', '#a3e635',
    '#84cc16', '#65a30d', '#4d7c0f', '#3f6212', '#365314', '#f0fdf4',
    '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a',
    '#15803d', '#166534', '#14532d', '#ecfeff', '#cffafe', '#a5f3fc',
    '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75',
    '#164e63', '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa',
    '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#eef2ff',
    '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5',
    '#4338ca', '#3730a3', '#312e81', '#faf5ff', '#f3e8ff', '#e9d5ff',
    '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8',
    '#581c87', '#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6',
    '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843'
];

function SettingsPanel(){
    const [backgroundColor,setBackgroundColor] = useState('#ffffff')
    const {canvas} = useEditorStore()
    const handleColorChange = (event)=>{
        setBackgroundColor(event.target.value)
    }

    const handleColorPresetApply = (getCurrentColor)=> {
        setBackgroundColor(getCurrentColor)
    }

    const handleApplyChanges = ()=>{
        if(!canvas) return
        canvas.set('backgroundColor', backgroundColor);
        canvas.renderAll();

        centerCanvas(canvas);
    }
    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center space-x-2 mb-4">
                <Palette className="w-5 h-5 text-purple-600"/>
                <h3 className="text-lg font-semiBold">Choose Background Color</h3>
            </div>
            <div className="space-y-2">
                <div className="grid grid-cols-6 gap-2 mb-3">
                    {
                        colorPresets.map(color=> 
                            (<TooltipProvider key={color}>
                                <Tooltip>
                                    <TooltipTrigger asChild="true">
                                        <button className={`w-8 h-8 rounded-md border transition-transform hover:scale-110 ${color === backgroundColor ? 'ring-2 ring-offest-2 ring-primary': ''}`} style={{backgroundColor: color}}
                                        onClick={()=> handleColorPresetApply(color)}>
                                            {
                                                color === backgroundColor && (
                                                    <Check className="w-4 h-4 text-white mx-auto drop-shadow-md"/>
                                                )
                                            }
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{color}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>)
                        )
                    }
                </div>
                <div className="flex mt-3 space-x-2">
                    <div className="relative">
                        <Input 
                        type="color" 
                        value={backgroundColor} 
                        onChange={handleColorChange}
                        className={'w-12 h-10 p-1 cursor-pointer'}/>
                        <Input 
                            type={"text"}
                            value={backgroundColor}
                            onChange={handleColorChange}
                            className='flex-1'
                            placeholder="#FFFFFF"
                        />
                    </div>
                </div>
                <Separator className="my-4"/>
                <Button className='w-full' onClick={handleApplyChanges}> 
                    Apply Changes
                </Button>
            </div>
        </div>
    )
}

export default SettingsPanel;