'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { exportAsJson, exportAsPdf, exportAsPng, exportAsSvg } from "@/services/export-service";
import { useEditorStore } from "@/store";
import { Download, File, FileImage, FileJson, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

function ExportModal({isOpen,onClose}){
    const {canvas} = useEditorStore();

    const [selectedFormat, setSelectedFormat] = useState('png');
    const [isExporting, setIsExporting] = useState(false);

    const exportFormats = [
        {
            id: "png",
            name: "PNG Image",
            icon: FileImage,
            description: 'Best for web and social media'
        },
        {
            id: "svg",
            name: "SVG Vector",
            icon: File,
            description: 'Scalable vector format'
        },
        {
            id: "pdf",
            name: "PDF Document",
            icon: FileText,
            description: 'Best for Printing'
        },
        {
            id: "json",
            name: "JSON Template",
            icon: FileJson,
            description: 'Editable template format'
        },
    ]

    const handleExport = async ()=>{
        if(!canvas) return;
        setIsExporting(true)

        try {
            let successFlag = false;

            switch (selectedFormat){
                case 'json':
                    successFlag = exportAsJson(canvas,'JSON FileName');

                    break;
                case 'png':
                    successFlag = exportAsPng(canvas,'PNG FileName');

                    break;
                case 'svg':
                    successFlag = exportAsSvg(canvas,'SVG FileName');

                    break;
                case 'pdf':
                    successFlag = exportAsPdf(canvas,'PDF FileName');

                    break;
                default:
                    break;
            }

            if(successFlag){
                setTimeout(()=>{ 
                    onClose()
                },500)
            }
        } catch (error) {
            console.error('Export failed', error)
        } finally{
            setIsExporting(false);
        }
    }

    if(!isOpen) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={'sm:max-w-md'}>
                <DialogHeader>
                    <DialogTitle className={'text-xl'}>
                        Export Design
                    </DialogTitle>
                    <DialogDescription>
                        Select a format to download your current canvas.
                    </DialogDescription>
                </DialogHeader>
                    <div className="py-4">
                        <h3 className="text-xs font-medium mb-3">Choose Format</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {
                                exportFormats.map(exportFormat=>(
                                    <Card key={exportFormat.id}
                                    className={cn(
                                        "cursor-pointer border transition-colors hover:bg-accent hover:text-accent",
                                        selectedFormat === exportFormat.id ? 'border-primary bg-accent' : 'border-border'

                                    )}
                                    onClick={()=>setSelectedFormat(exportFormat.id)}>
                                        <CardContent className={"p-4 flex flex-col items-center text-center"}>
                                            <exportFormat.icon className={cn('h-8 w-8 mb-2', selectedFormat === exportFormat.id ? 'text-primary': 'text-muted-foreground')}/>
                                            <h4 className="font-medium text-sm">{exportFormat.name}</h4>
                                            <p className="mt-1 text-muted-foreground font-medium">{exportFormat.description}</p>
                                        </CardContent>
                                    </Card>
                                ))
                            }
                        </div>
                    </div>
                    <DialogFooter>
                            <Button onClick={handleExport} disabled={isExporting} variant="default" className="min-w-30 bg-purple-700 text-white">
                                {isExporting? (<>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                Exporting...
                                </>) : (
                                    <>
                                    <Download className="mr-2 h-4 w-4"/>
                                    Export {selectedFormat.toUpperCase()}
                                </>
                                )}
                            </Button>
                    </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ExportModal;