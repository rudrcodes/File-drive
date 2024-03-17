"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SignInButton, SignOutButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const createFile = useMutation(api.files.createFile)
  const files = useQuery(api.files.getFile)
  console.log("All files : ", files)
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <SignedIn>
        <div>You are signed in</div>
        <SignOutButton >
          <Button>Sign out</Button>
        </SignOutButton>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal" >
          <Button>Sign in</Button>
        </SignInButton>
      </SignedOut>

      <Button onClick={() => {
        createFile({ name: "Rudransh-File" })
      }}>Click me</Button>

      {/* <Button onClick={() => {
        getFiles()
      }}>Get all</Button> */}




    </main>
  );
}
