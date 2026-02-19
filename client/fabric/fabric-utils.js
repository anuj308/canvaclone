
export const initializeFabric = async(canvasEl, containerEl)=>{
    try {
        const {Canvas,PencilBrush} = await import('fabric');

        const canvas = new Canvas(canvasEl,{
            preserveObjectStacking: true,
            isDrawingMode: false,
            renderOnAddRemove: true,
        })

        const brush = new PencilBrush(canvas);
        brush.color = "#000000";
        brush.width = 5;
        canvas.freeDrawingBrush = brush;

        return canvas;
    } catch (error) {
        console.error('Failed to load fabric',error)
    }
}
export const centerCanvas = (canvas)=>{
    if(!canvas) return;
}