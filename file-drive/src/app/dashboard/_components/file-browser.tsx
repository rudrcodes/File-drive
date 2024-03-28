"use client"
import { useOrganization, useUser } from "@clerk/nextjs";

import { useQuery } from "convex/react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { UploadButton } from "@/app/dashboard/_components/upload-button";
import SearchBar from "@/app/dashboard/_components/SearchBar";
import { FileCard } from "./file-card";



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

  return (
    <div>
      <div className="w-full">
        {files === undefined && (
          <div className=" flex justify-center items-center flex-col w-full">
            <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
            <div className="text-2xl">Loading. Please wait...</div>
          </div>
        )}

        {files &&
          (<>
            <div className="flex justify-between items-center mb-8">

              <h1 className="text-4xl font-bold">{title}</h1>
              <SearchBar query={query} setQuery={setQuery} />

              <UploadButton />
            </div>

            {files?.length == 0 && (<PlaceHolder />)}
            <div className="grid grid-cols-3 gap-4">

              {files?.map((file) => <FileCard favorites={favorites ?? []} key={file._id} file={file} />)}

            </div>
          </>
          )

        }
      </div>
    </div>
  );
}
