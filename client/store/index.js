'use client'

export const useEditorStore = create((set,get)=>({
    canvas : null,
    setCanvas : (canvas)=>{
        set({canvas})
        if(canvas){
            centerCanvas
        }
    },
    designId : null,
    setDesignId : (id)=> set({designId: id}),
    resetStore : ()=>{
        set({
            canvas: null,
            designId: null
        })
    }
}))