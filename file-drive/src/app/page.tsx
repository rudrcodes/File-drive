"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {  SignInButton, SignOutButton, SignedIn, SignedOut, useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
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
  // const orgId = organization?.id! ?? user?.user?.id!


  const createFile = useMutation(api.files.createFile)
  const files = useQuery(api.files.getFile,
    orgId ? { orgId } : "skip")

  console.log("All files : ", files)
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <SignedOut>
        <SignInButton><Button>Sign in</Button></SignInButton>
      </SignedOut>
      <SignedIn>
        <SignOutButton><Button>Sign out</Button></SignOutButton>
      </SignedIn>
      <h1>All files </h1>
      {files?.map((file) => {
        return <div key={file._id}>{file.name}</div>
      })}
      <Button onClick={() => {
        if (!orgId) return
        createFile({
          name: "Rudransh-File",
          orgId
        })
      }}>Click me</Button>

      {/* <Button onClick={() => {
        getFiles()
      }}>Get all</Button> */}




    </main>
  );
}
