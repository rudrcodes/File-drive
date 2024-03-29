"use client"
import { useOrganization, useUser } from "@clerk/nextjs";

import { useQuery } from "convex/react";
import Image from "next/image";
import { GridIcon, Loader2, RowsIcon, TableIcon } from "lucide-react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { UploadButton } from "@/app/dashboard/_components/upload-button";
import SearchBar from "@/app/dashboard/_components/SearchBar";
import { FileCard } from "./file-card";
import { DataTable } from "./file-table";
import { columns } from "./columns";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


const PlaceHolder = () => {
  return (
    < div className="flex flex-col gap-8 w-full  items-center mt-24" >
      <Image
        src="/empty-state.svg"
        alt="Empty state"
        width="300"
        height="300"
      />
      You have no files, upload one now 📁
      <UploadButton />
    </div >
  )
}
export default function FileBrowser({ title, favoritesOnly, deletedOnly }: { title: string, favoritesOnly?: boolean, deletedOnly?: boolean }) {
  console.log("fav : ", favoritesOnly);

  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("")
  // console.log(user)
  // console.log(organization?.organization?.id)

  let orgId: string | undefined = undefined;
  if (organization?.isLoaded && user?.isLoaded) {
    orgId = organization?.organization?.id! || user?.user?.id!
  }
  const files = useQuery(api.files.getFile,
    orgId ? { orgId, query, favorites: favoritesOnly, deletedOnly } : "skip")

  const favorites = useQuery(api.files.getAllFavorites,
    orgId ? { orgId } : "skip")

  const modifiedFiles = files?.map((file) => (
    {
      ...file,
      isFavorited: (favorites ?? []).some(
        (favorite) => favorite.fileId === file._id
      )
    }
  )) ?? []

  return (
    <div>
      <div className="w-full">

        <div className="flex justify-between items-center mb-8">

          <h1 className="text-4xl font-bold">{title}</h1>
          <SearchBar query={query} setQuery={setQuery} />

          <UploadButton />
        </div>
        <Tabs defaultValue="grid" >
          <TabsList className="mb-6">
            <TabsTrigger value="grid" className="flex gap-1 justify-center items-center"><GridIcon className="w-5 h-5" /> Grid</TabsTrigger>
            <TabsTrigger className="flex gap-1 justify-center items-center" value="table"><RowsIcon className="w-5 h-5" /> Table</TabsTrigger>
          </TabsList>
          {files === undefined && (
            <div className=" flex justify-center items-center flex-col w-full">
              <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
              <div className="text-2xl">Loading. Please wait...</div>
            </div>
          )}
          <TabsContent value="grid">
            <div className="grid grid-cols-3 gap-4">
              {modifiedFiles?.map((file) => <FileCard key={file._id} file={file} />)}

            </div>
          </TabsContent>
          <TabsContent value="table">
            <DataTable columns={columns} data={modifiedFiles} />
          </TabsContent>
        </Tabs>


        {files?.length == 0 && (<PlaceHolder />)}




      </div>
    </div>
  );
}
