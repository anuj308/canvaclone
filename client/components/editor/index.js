'use client'

import { useParams, useRouter } from "next/navigation";
import Canvas from "./canvas";
import Header from "./header";
import Sidebar from "./sidebar";
import { useEffect, useState } from "react";
import { useEditorStore } from "@/store";

function MainEditor(){
    const params = useParams();
    const router = useRouter();
    const designId = params?.slug;

    const [isLoading,setIsLoading] = useState(!!designId);
    const [loadAttempted,setLoadAttempted] = useState(false);
    const [error,setError] = useState(null);

    const {canvas,setDesginId,resetStore} = useEditorStore()

    useEffect(()=>{
        // reset the store and set the design id
        resetStore();
        if(designId) setDesginId(designId);

        return ()=>{
            resetStore()
        };
    },[])

    useEffect(()=>{
        setLoadAttempted(false)
        setError(null)
    },[designId])

    useEffect(()=>{
        if(isLoading && !canvas && designId){
            const timer = setTimeout(()=>{
                console.log('Canvas init timeout')
                setIsLoading(false)
            },5000)
        }
        return ()=>{
            clearTimeout(timer)
        }
    },[isLoading,canvas,designId])

    useEffect(()=>{
        if(canvas) console.log('canvas is available')
    },[canvas]) // for testing

    // load the design
    return ( 
        <div className="flex flex-col h-screen overflow-hidden">
            <Header/>
            <div className="flex flex-1 overflow-hidden">
                <Sidebar/>
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    <main className="flex-1 overflow-hidden bg-[#f0f0f0] flex items-center justify-center">
                        <Canvas/>
                    </main>
                </div>
            </div>            
        </div>
    )
}

export default MainEditor;