import { useMutation, useQuery } from "convex/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, formatDistance, formatRelative, subDays } from 'date-fns'

import { Doc, Id } from "../../../../convex/_generated/dataModel"

import { Download, ExternalLink, FileTextIcon, GanttChartIcon, ImageIcon, MoreVertical, StarHalf, StarIcon, TrashIcon, UndoIcon } from "lucide-react"
import { ReactNode, useState } from "react"
import { api } from "../../../../convex/_generated/api"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Protect } from "@clerk/nextjs"

interface FileCardProps {
    file: Doc<"files">,
    favorites: Doc<"favorites">[]
}

function FileCardActions({ file, isFavorited }: { file: Doc<"files">, isFavorited: boolean }) {
    const { toast } = useToast();
    // Mutations :
    const deleteFile = useMutation(api.files.deleteFile)
    const restoreFile = useMutation(api.files.restoreFile)

    const toggleFavorite = useMutation(api.files.toggleFavorite)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)




    return (
        <>
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will mark the file for our deletion process.Files are deleted periodically.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={async () => {
                            //TODO : Actually delete file from the convex server
                            try {

                                await deleteFile({

                                    fileId: file._id
                                })
                                toast({
                                    variant: "default",
                                    title: "File marked for deletion",
                                    description: "The file will be deleted soon."
                                })
                            } catch (error) {
                                toast({
                                    variant: "destructive",
                                    title: "Error in deleting file ",
                                    description: "The file can't be deleted, either you don't have admin access or there is some backend problem going on."
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


                    <DropdownMenuItem className="cursor-pointer gap-1 flex" onClick={() => {
                        window.open(file.fileUrlRudransh!),
                            "_blank"
                    }}>
                        <Download className="w-4 h-4" />Download

                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        toggleFavorite({
                            fileId: file._id
                        })
                    }}
                        className="flex gap-1 text-blue-600 items-center cursor-pointer">
                        {!isFavorited ?
                            <div className="flex justify-center items-center gap-1">
                                <StarHalf className="w-4 h-4" /> Favorite it
                            </div> :
                            <div className="flex justify-center items-center gap-1">
                                <StarIcon className="w-4 h-4" /> Unfavorite it
                            </div>
                        }

                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <Protect
                        role="org:admin"
                        fallback={<></>}
                    >
                        <DropdownMenuItem >

                            {file.shouldDelete ?
                                <div className="flex gap-1 text-green-600 items-center cursor-pointer"
                                    onClick={() => {
                                        restoreFile({
                                            fileId: file._id
                                        })
                                    }} >
                                    <UndoIcon className="w-4 h-4" />
                                    Restore file
                                </div>
                                :
                                <div className="flex gap-1 text-red-600 items-center cursor-pointer" onClick={() => {
                                    setIsConfirmOpen(true)
                                }} >
                                    <TrashIcon className="w-4 h-4" />
                                    Delete file
                                </div>
                            }

                        </DropdownMenuItem>
                    </Protect>
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

export const FileCard = ({ file, favorites }: FileCardProps) => {
    // console.log("file in file card: ", file)
    const userProfile = useQuery(api.users.getUserProfile, {
        userId: file.userId
    })

    const types = {
        'image': <ImageIcon />,
        'pdf': <FileTextIcon />,
        'csv': <GanttChartIcon />
    } as Record<Doc<"files">["type"], ReactNode>;


    const isFavorited = favorites.some(favorite => favorite.fileId === file._id)


    return (
        <>
            <Card className="relative border-2 border-gray-300">
                <CardHeader>
                    <CardTitle className="flex gap-2 text-base font-bold ">
                        <div className="flex justify-center">{types[file.type]}</div>
                        {file.name}
                    </CardTitle>

                    <div className="absolute top-2 right-2"><FileCardActions isFavorited={isFavorited} file={file} /></div>
                </CardHeader>

                <CardContent className="h-[150px] flex justify-center items-center">
                    {file.type === 'image' && (
                        <Image
                            src={file.fileUrlRudransh!}
                            // src={getFileUrl(file.fileId)}
                            alt={file.name}
                            width="200"
                            height="200"
                        />
                    )}
                    {file.type === "csv" && <GanttChartIcon className="h-20 w-20" />}
                    {file.type === "pdf" && <FileTextIcon className="h-20 w-20" />}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="flex gap-2 text-xs text-gray-700 items-center w-[40%] " >

                        <Avatar className="w-8 h-8">
                            <AvatarImage src={userProfile?.image} />
                            <AvatarFallback>...</AvatarFallback>
                        </Avatar>
                        {userProfile?.name}
                    </div>

                    <div className=" text-xs text-end">
                        Uploaded: {formatRelative(new Date(file._creationTime), new Date())}

                    </div>



                    {/* 
                    <Button onClick={() => window.open(file.fileUrlRudransh!)} variant="link" className="flex gap-2 justify-center items-center">
                        Open <ExternalLink className="w-4 h-4 hover:scale-110" />
                    </Button> */}
                </CardFooter>
            </Card>        </>

    )
}