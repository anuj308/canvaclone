"use client"

import {designTypes} from "@/config"
import { saveDesign, warmUpDesignService } from "@/services/design-service";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DESIGN_DIMENSIONS = {
    document: { width: 794, height: 1123, category: "document" },
    social_media: { width: 1080, height: 1080, category: "social_media" },
    video: { width: 1920, height: 1080, category: "video" },
    podcast: { width: 3000, height: 3000, category: "podcast" },
    chart: { width: 1600, height: 900, category: "chart" },
    presentation: { width: 1920, height: 1080, category: "presentation" },
    design: { width: 1200, height: 1200, category: "design" },
    mobile_app: { width: 390, height: 844, category: "mobile_app" },
    book: { width: 1600, height: 2560, category: "book" },
    whiteboard: { width: 2000, height: 1200, category: "whiteboard" },
};

function DesignTypes(){
    const router = useRouter();
    const [creatingLabel, setCreatingLabel] = useState("");

    const handleCreateByType = async (typeLabel)=>{
        if(creatingLabel) return;

        const categoryKey = typeLabel.toLowerCase().replace(/\s+/g, "_");
        const dimensions = DESIGN_DIMENSIONS[categoryKey] || { width: 825, height: 465, category: "youtube_thumbnail" };

        try {
            setCreatingLabel(typeLabel);
            await warmUpDesignService(2);

            const initialDesignData = {
                name: `Untitled design - ${typeLabel}`,
                canvasData: null,
                width: dimensions.width,
                height: dimensions.height,
                category: dimensions.category,
            };

            const newDesign = await saveDesign(initialDesignData);
            if(newDesign?.success){
                router.push(`/editor/${newDesign?.data._id}`);
            } else {
                throw new Error("Failed to create new design");
            }
        } catch (error) {
            console.log(error);
        } finally {
            setCreatingLabel("");
        }
    };

    return (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-6 mt-12 justify-center">
            {
                designTypes.map((type,index)=>(
                    <div key={index} className={`flex flex-col items-center justify-center`}>
                        <button
                            type="button"
                            disabled={Boolean(creatingLabel)}
                            onClick={()=>handleCreateByType(type.label)}
                            className={`${type.bgColor} w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-md hover:shadow-lg transition-shadow cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
                            title={creatingLabel === type.label ? `Creating ${type.label}...` : `Create ${type.label}`}>
                            {type.icon}
                        </button>
                        <span className="text-xs text-center font-medium w-full px-1 line-clamp-2">{type.label}</span>
                    </div>
                ))
            }
        </div>
    )
}

export default DesignTypes