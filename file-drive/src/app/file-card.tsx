import { useMutation, useQuery } from "convex/react"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Doc, Id } from "../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"


import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { MoreVertical, TrashIcon } from "lucide-react"
import { useState } from "react"
import { api } from "../../convex/_generated/api"
import { useToast } from "@/components/ui/use-toast"

interface FileCardProps {
    file: Doc<"files">
}

function FileCardActions({ fileId }: { fileId: Id<"files"> }) {
    const { toast } = useToast();
    const deleteFile = useMutation(api.files.deleteFile)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    return (
        <>
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={async () => {
                            //TODO : Actually delete file from the convex server
                            try {

                                await deleteFile({
                                    fileId
                                })
                                toast({
                                    variant: "default",
                                    title: "File deleted",
                                    description: "The file has been deleted from our server"
                                })
                            } catch (error) {
                                toast({
                                    variant: "destructive",
                                    title: "Error in deleting file ",
                                    description: "The file has been deleted from our server"
                                })

                            }
                        }}>

                            Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
                <DropdownMenuTrigger><MoreVertical /></DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => {
                        setIsConfirmOpen(true)
                    }} className="flex gap-1 text-red-600 items-center cursor-pointer"><TrashIcon className="w-4 h-4" /> Delete file</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>

    )
}

export const FileCard = ({ file }: FileCardProps) => {

    return (
        <>
            <Card className="relative border-2 border-gray-300">
                <CardHeader>
                    <CardTitle>{file.name}  </CardTitle>
                    <div className="absolute top-2 right-2"><FileCardActions fileId={file._id} /></div>
                </CardHeader>
                <CardContent>
                    <p>Card Content</p>
                </CardContent>
                <CardFooter>
                    <Button>Download</Button>
                </CardFooter>
            </Card>        </>

    )
}