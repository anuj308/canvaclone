'use client'

import { Slider } from "@/components/ui/slider";
import { useState } from "react";

function BottomBar(){
    const [scalePercent, setScalePercent] = useState(100);

    return (
        <div className="bottom-bar border-t border-gray-200 bg-white px-4">
            <div className="w-full flex items-center justify-end gap-3">
                <span className="text-xs text-gray-500">Scale</span>
                <div className="w-40">
                    <Slider
                        value={[scalePercent]}
                        min={25}
                        max={200}
                        step={5}
                        onValueChange={(values)=>setScalePercent(values[0])}
                    />
                </div>
                <button
                    type="button"
                    className="h-8 min-w-16 rounded-md border border-gray-200 bg-white px-2 text-sm font-medium text-gray-700">
                    {scalePercent}%
                </button>
            </div>
        </div>
    )
}

export default BottomBar