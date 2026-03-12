"use client"

import { getUserDesigns } from "@/services/design-service"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import DesignPreview from "./design-preview";
import { useSession } from "next-auth/react";

function RecentDesigns(){
    const [userDesigns,setUserDesigns] = useState([]);
    const [isLoading,setIsLoading] = useState(true);
    const [isWakingBackend,setIsWakingBackend] = useState(false);
    const [errorMessage,setErrorMessage] = useState("");
    const { status } = useSession();
    const router = useRouter()

    async function fetchUserDesigns(){
        try {
            setIsLoading(true);
            setErrorMessage("");
            setIsWakingBackend(true);

            const result = await getUserDesigns();
            if(result?.success) setUserDesigns(result?.data || []);
        } catch (error) {
            setErrorMessage("Backend service is waking up. Please wait a moment and try again.");
        } finally {
            setIsWakingBackend(false);
            setIsLoading(false);
        }
    }

    useEffect(()=>{
        if(status !== 'authenticated') return;
        fetchUserDesigns()
    },[status])

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Recent Designs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5  md:gap-4">
                {
                    isLoading && (
                        <div className="col-span-full space-y-1">
                            <p className="text-sm font-semibold text-gray-700">
                                {isWakingBackend ? 'Fetching your designs...' : 'Loading your designs...'}
                            </p>
                            {isWakingBackend && (
                                <p className="text-xs text-gray-500">Our servers are starting up after a period of inactivity. This can take a moment — your designs will load automatically.</p>
                            )}
                        </div>
                    )
                }
                {
                    errorMessage && !isLoading && (
                        <div className="col-span-full">
                            <p className="text-sm text-amber-700 mb-2">{errorMessage}</p>
                            <button onClick={fetchUserDesigns} className="text-sm text-purple-700 font-semibold">
                                Retry
                            </button>
                        </div>
                    )
                }
                {
                    !isLoading && !errorMessage && !userDesigns.length && <h1>No Design Found!</h1>
                }
                {
                    !isLoading && !errorMessage && userDesigns.map(designs=>(
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