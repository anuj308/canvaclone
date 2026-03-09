"use client"

import { getUserDesigns } from "@/services/design-service"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import DesignPreview from "./design-preview";

function RecentDesigns(){
    const [userDesigns,setUserDesigns] = useState([]);
    const router = useRouter()
    async function fetchUserDesigns(){
        const result = await getUserDesigns();
        if(result?.success) setUserDesigns(result?.data)
    }

    useEffect(()=>{
        fetchUserDesigns()
    },[])

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Recent Designs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5  md:gap-4">
                {
                    !userDesigns.length && <h1>No Design Found!</h1>
                }
                {
                    userDesigns.map(designs=>(
                        <div onClick={()=> router.push(`/editor/${designs?._id}`)} key={designs._id} className="group cursor-pointer min-w-0">
                            <div className="w-full max-w-75 aspect-3/2 rounded-lg mb-2 overflow-hidden transition-shadow group-hover:shadow-md bg-white">
                                {
                                    designs?.canvasData && <DesignPreview key={designs._id} design={designs}/>
                                }
                            </div>
                            <p className="font-bold text-sm truncate">{designs.name}</p>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default RecentDesigns