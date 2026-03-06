'use client'
import { create } from 'zustand'
import { centerCanvas } from "@/fabric/fabric-utils"
import { debounce } from 'lodash'
import { saveCanvasState } from '@/services/design-service';

export const useEditorStore = create((set,get)=>({
    canvas : null,
    setCanvas : (canvas)=>{
        set({canvas})
        if(canvas){
            centerCanvas(canvas)
        }
    },
    designId : null,
    setDesignId : (id)=> set({designId: id}),

    isEditing : true,
    setIsEditing: (flag)=> set({isEditing: flag}),
    
    name : 'Untitled Design',
    setName: (value)=> set({name: value}),

    showProperties: false,
    setShowProperties: (flag) => set({showProperties: flag}),

    saveStatus: 'saved',
    setSaveStatus: (status)=> set({saveStatus: status}),
    lastModified: Date.now(),

    markAsModified: ()=>{
        const designId = get().designId

        if(designId){
            set({
                lastModified: Date.now(),
                saveStatus: 'Saving...',
                isModified: true
            })

            get().debouncedSaveToServer();

        }else{
            console.error("No design ID Available");
        }
    },
    
    saveToServer: async()=>{
        const designId = get().designId;
        const canvas = get().canvas;
        
        if(!canvas || !designId){
            console.error("No design ID Available or canvas instance");
            return null;
        }

        try {
            const savedDesign = await saveCanvasState(canvas,designId, get().name);

            set({
                saveStatus: 'Saved',
                isModified: false,
            })

            return savedDesign;
        } catch (error) {
            console.error('Failed to save design:', error);
            set({saveStatus: 'Error'})
            return null;
        }
    },

    debouncedSaveToServer: debounce(()=>{
        get().saveToServer();
    },500),

    resetStore : ()=>{
        set({
            canvas: null,
            designId: null,
            isEditing: true,
            name: 'Untitled Design',
            saveStatus: 'saved',
            isModified: false,
            lastModified: Date.now()
        })
    }
}))