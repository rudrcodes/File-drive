"use client"
import { Button } from "@/components/ui/button";
import { SignInButton, SignOutButton, SignedIn, SignedOut, useOrganization, useUser } from "@clerk/nextjs";

import { UploadButton } from "./upload-button";
import { FileCard } from "./file-card";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";



export default function Home() {

  const organization = useOrganization();
  const user = useUser();
  console.log(user)
  console.log(organization?.organization?.id)

  let orgId: string | undefined = undefined;
  if (organization?.isLoaded && user?.isLoaded) {
    orgId = organization?.organization?.id! || user?.user?.id!
  }
  const files = useQuery(api.files.getFile,
    orgId ? { orgId } : "skip")

  console.log("All files : ", files)

  return (
    <main className="container mx-auto pt-12">
      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">Your Files</h1>
        <UploadButton />


      </div>
      {/* <SignedOut>
        <SignInButton><Button>Sign in</Button></SignInButton>
      </SignedOut>
      <SignedIn>
        <SignOutButton><Button>Sign out</Button></SignOutButton>
      </SignedIn> */}

      <div className="grid grid-cols-4 gap-4">
        {files?.map((file) => <FileCard key={file._id} file={file} />)}
      </div>





    </main>
  );
}
