"use client"

import { deleteDesign, getUserDesigns } from "@/services/design-service"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import DesignPreview from "./design-preview";
import { useSession } from "next-auth/react";
import { MoreVertical, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function RecentDesigns(){
    const [userDesigns,setUserDesigns] = useState([]);
    const [isLoading,setIsLoading] = useState(true);
    const [isWakingBackend,setIsWakingBackend] = useState(false);
    const [errorMessage,setErrorMessage] = useState("");
    const [designToDelete,setDesignToDelete] = useState(null);
    const [isDeleting,setIsDeleting] = useState(false);
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

    async function handleDeleteDesign(){
        if(!designToDelete?._id || isDeleting) return;

        try {
            setIsDeleting(true);
            const deletingId = designToDelete._id;
            const result = await deleteDesign(deletingId);

            if(result?.success === false){
                throw new Error(result?.message || "Unable to delete design.");
            }

            setUserDesigns((prev)=>prev.filter((design)=>design._id !== deletingId));
            setDesignToDelete(null);
        } catch (error) {
            setErrorMessage("Unable to delete this design right now. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    }

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
                            <div className="relative w-full max-w-75 aspect-3/2 rounded-lg mb-2 overflow-hidden transition-shadow group-hover:shadow-md bg-white">
                                <div
                                    className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
                                    onClick={(event)=>event.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                type="button"
                                                size="icon-xs"
                                                variant="secondary"
                                                className="bg-white/90 hover:bg-white"
                                                onClick={(event)=>event.stopPropagation()}>
                                                <MoreVertical />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                variant="destructive"
                                                onSelect={(event)=>{
                                                    event.preventDefault();
                                                    setDesignToDelete(designs);
                                                }}>
                                                <Trash2 />
                                                Delete Design
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                {
                                    designs?.canvasData && <DesignPreview key={designs._id} design={designs}/>
                                }
                            </div>
                            <p className="font-bold text-sm truncate">{designs.name}</p>
                        </div>
                    ))
                }
            </div>

            <Dialog
                open={Boolean(designToDelete)}
                onOpenChange={(open)=>{
                    if(!open && !isDeleting){
                        setDesignToDelete(null);
                    }
                }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Design?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. &quot;{designToDelete?.name || "Untitled Design"}&quot; will be permanently deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isDeleting}
                            onClick={()=>setDesignToDelete(null)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={handleDeleteDesign}>
                            {isDeleting ? "Deleting..." : "Delete Design"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default RecentDesigns