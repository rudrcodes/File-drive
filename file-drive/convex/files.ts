// "use client"
import { ConvexError, v } from "convex/values"
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server"
import { getUser } from "./users";
import { UserIdentity } from "convex/server";
import { fileTypes } from "./schema";


export const hasAccessToOrg = async (
    ctx: QueryCtx | MutationCtx,
    identity: UserIdentity,
    orgId?: string) => {
    const user = await getUser(ctx, identity.tokenIdentifier);
    // This hasAccess var shows if the user has the right to create a file in that org
    const hasAccess = user.orgIds.includes(orgId!) || user.tokenIdentifier.includes(orgId!);

    // console.log(identity.tokenIdentifier)
    // console.log(user.tokenIdentifier)
    // console.log(user.orgIds)
    // console.log(orgId)

    // console.log(hasAccess)
    // if (!hasAccess) {
    //     throw new ConvexError("You do not have access to this org")
    // }

    return hasAccess

}


export const generateUploadUrl = mutation(async (ctx) => {

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new ConvexError("Not authorised");
    }
    return await ctx.storage.generateUploadUrl();
});

// To add files in the db
export const createFile = mutation({
    args: {
        name: v.string(),
        orgId: v.string(),
        fileId: v.id("_storage"),
        type:fileTypes
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        // console.log("identity from files.ts : ", identity)
        if (!identity) {
            throw new ConvexError("Not authorised");
        }

        // const user = await getUser(ctx, identity.tokenIdentifier);
        // // This hasAccess var shows if the user has the right to create a file in that org
        // const hasAccess = user.orgIds.includes(args.orgId!) || user.tokenIdentifier.includes(args.orgId!);

        // console.log(identity.tokenIdentifier)
        // console.log(user.tokenIdentifier)
        // console.log(user.orgIds)
        // console.log(args.orgId)

        const hasAccess = await hasAccessToOrg(ctx, identity, args.orgId)
        if (!hasAccess) {
            throw new ConvexError("You do not have access to this org")
        }

        await ctx.db.insert("files", {
            orgId: args.orgId!, name: args.name, fileId: args.fileId,type:args.type
        })
    }
})

//To fetch all the files present in the db in that table
export const getFile = query({
    args: {
        orgId: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return []
        }

        const hasAccess = await hasAccessToOrg(ctx, identity, args.orgId)
        if (!hasAccess) {
            return []
        }

        return await ctx.db.query("files").withIndex("by_orgId", q => {
            return q.eq('orgId', args.orgId!)
        }).collect()
    }
})



export const deleteFile = mutation({
    args: { fileId: v.id("files") },
    handler: async (ctx, args) => {
        //check if user is logged in and has access to the org
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("You do not have access to this org")
        }

        const file = await ctx.db.get(args.fileId)
        if (!file) {
            throw new ConvexError("This file doesn't exist.")

        }

        const hasAccess = await hasAccessToOrg(ctx, identity, file.orgId)
        if (!hasAccess) {
            throw new ConvexError("You do not have access to delete this file.")
        }

        await ctx.db.delete(args.fileId)

    }
})