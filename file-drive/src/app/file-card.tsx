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

import { FileTextIcon, GanttChartIcon, ImageIcon, MoreVertical, TrashIcon } from "lucide-react"
import { ReactNode, useState } from "react"
import { api } from "../../convex/_generated/api"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

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

// TODO : SOLVED ✅ :This getUrl is expecting a diff fileID , and I'm giving it a different one , this has to be solved.
//* Solved : I used this storage method we get in the QueryCTX or MutationCTX : 
//*let fileUrlRudransh = (args.type === "image") ? await ctx.storage.getUrl(args.fileId) : null;


// function getFileUrl(fileId: Id<"_storage">): string {
//     console.log(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`);

//     return `https://acoustic-kangaroo-501.convex.cloud/api/storage/kg21jjcxm0jjm2k74nxjhe5q6n6nr56m`

// }

export const FileCard = ({ file }: FileCardProps) => {
    console.log("file in file card: ", file)

    const types = {
        'image': <ImageIcon />,
        'pdf': <FileTextIcon />,
        'csv': <GanttChartIcon />
    } as Record<Doc<"files">["type"], ReactNode>;



    return (
        <>
            <Card className="relative border-2 border-gray-300">
                <CardHeader>
                    <CardTitle className="flex gap-2"> <p>{types[file.type]}</p>{file.name}  </CardTitle>
                    <div className="absolute top-2 right-2"><FileCardActions fileId={file._id} /></div>
                </CardHeader>
                <CardContent>
                    {file.type === 'image' && (
                        <Image
                            src={file.fileUrlRudransh!}
                            // src={getFileUrl(file.fileId)}
                            alt={file.name}
                            width="200"
                            height="200"
                        />
                    )}
                </CardContent>
                <CardFooter>
                    <Button>Download</Button>
                    <Button onClick={() => window.open(file.fileUrlRudransh!)}>Open</Button>
                </CardFooter>
            </Card>        </>

    )
}