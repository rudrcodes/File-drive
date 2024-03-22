"use client"
import { Button } from "@/components/ui/button";
import { SignInButton, SignOutButton, SignedIn, SignedOut, useOrganization, useUser } from "@clerk/nextjs";

import { UploadButton } from "./upload-button";
import { FileCard } from "./file-card";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Image from "next/image";
import { Loader2 } from "lucide-react";



export default function Home() {

  const organization = useOrganization();
  const user = useUser();
  // console.log(user)
  // console.log(organization?.organization?.id)

  let orgId: string | undefined = undefined;
  if (organization?.isLoaded && user?.isLoaded) {
    orgId = organization?.organization?.id! || user?.user?.id!
  }
  const files = useQuery(api.files.getFile,
    orgId ? { orgId } : "skip")

  // console.log("All files : ", files)

  return (
    <main className="container mx-auto pt-12  ">
      {files === undefined && (
        <div className=" flex justify-center items-center flex-col w-full">
          <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
          <div className="text-2xl">Loading. Please wait...</div>
        </div>
      )}

      {/* <SignedOut>
        <SignInButton><Button>Sign in</Button></SignInButton>
      </SignedOut>
      <SignedIn>
        <SignOutButton><Button>Sign out</Button></SignOutButton>
      </SignedIn> */}
      {files && files.length == 0 &&
        <div className="flex flex-col gap-8 w-full  items-center mt-24">
          <Image
            src="/empty-state.svg"
            alt="Empty state"
            width="300"
            height="300"
          />
          You have no files ,upload one now 📁
          <UploadButton />
        </div>}
      {files && files?.length > 0 &&
        (<>
          <div className="flex justify-between items-center mb-8">

            <h1 className="text-4xl font-bold">Your Files</h1>
            <UploadButton />

          </div>
          <div className="grid grid-cols-3 gap-4">

            {files?.map((file) => <FileCard key={file._id} file={file} />)}

          </div>
        </>
        )

      }





    </main>
  );
}
