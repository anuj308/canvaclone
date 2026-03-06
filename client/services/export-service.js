import jsPDF from "jspdf";
import { saveAs } from "file-saver";


export function exportAsJson(canvas, fileName = "FileName"){

    if(!canvas) return false;

    try {
        const canvasData = canvas.toJSON(["id","filters"]);

        const jsonString = JSON.stringify(canvasData,null,2);

        const canvasJsonBlob = new Blob([jsonString], {type: "application/json"});

        saveAs(canvasJsonBlob, `${fileName}.json`)
        return true;
    } catch (error) {
        console.error("Failed to export JSON", error)
        return false;
    }
}

export function exportAsPng(canvas, fileName = "PNG FileName", options={}){
    if(!canvas) return false;

    try {
        const defaultOptions = {
            format: 'png',
            quality: 1,
            multiplier: 1,
            enableRetinaScaling: true,
            ...options
        }

        const dataURL = canvas.toDataURL(defaultOptions);

        saveAs(dataURL,`${fileName}.png`)
    } catch (error) {
        console.error("Failed to export PNG", error)
        return false;
    }
}

export function exportAsSvg(canvas, fileName = "SVG FileName", options={}){
    if(!canvas) return false;

    try {
        const svgData = canvas.toSVG();

        const blob = new Blob([svgData], {type: "image/svg+xml"})
        saveAs(blob, `${fileName}.svg`)

        return true;
    } catch (error) {
        console.error("Failed to export SVG", error)
        return false;
    }
}
export function exportAsPdf(canvas, fileName = "PDF Design", options={}){
    if(!canvas) return false;

    try {
        const defaultOptions = {
            format: 'a4',
            orientation: 'landscape',
            unit: 'mm',
            ...options
        }

        const pdf = new jsPDF(
            defaultOptions.orientation,
            defaultOptions.unit,
            defaultOptions.format
        )

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const scale = Math.min(pdfWidth/canvasWidth,pdfHeight/canvasHeight) * 0.9 // 90% available space

        const x = (pdfWidth - canvasWidth * scale)/2;
        const y = (pdfHeight - canvasHeight * scale)/2;

        const imgData = canvas.toDataURL('image/png',1.0);

        pdf.addImage(
            imgData,'PNG',
            x,y, canvasWidth * scale, canvasHeight * scale
        )

        pdf.save(`${fileName}.pdf`)
        return true;
    } catch (error) {
        return false;
    }
}