// "use client"
import { ConvexError, v } from "convex/values"
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server"
import { getUser } from "./users";
import { UserIdentity } from "convex/server";
import { fileTypes } from "./schema";
import { Id } from "./_generated/dataModel";


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
        type: fileTypes,
        fileUrlRudransh: v.optional(v.union(v.string(), v.null()))
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
        // Did to get the url so that the files can be opened in the browser
        let fileUrlRudransh = await ctx.storage.getUrl(args.fileId);
        // let fileUrlRudransh = (args.type === "image") ? await ctx.storage.getUrl(args.fileId) : null;
        // let fileUrlRudransh = (args.type === "image") ? await ctx.storage.getUrl(args.fileId) : null;
        console.log("fileUrlRudransh : ", fileUrlRudransh)

        await ctx.db.insert("files", {
            orgId: args.orgId!,
            name: args.name,
            fileId: args.fileId,
            type: args.type,
            fileUrlRudransh
        })
    }
})

//To fetch all the files present in the db in that table
// Yeh rerender kr rha h jyada baar , jiski vjh se isme pass data undefined ho rha h
export const getFile = query({
    args: {
        orgId: v.string(),
        query: v.optional(v.string()),
        favorites: v.optional(v.boolean())
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

        let allfiles = await ctx.db.query("files").withIndex("by_orgId", q => {
            return q.eq('orgId', args.orgId!)
        }).collect()

        const query = args.query
        // Can't able to fetch Favorites
        console.log("GET files line 111")
        console.log("Query : ", query)
        // if (!query) return allfiles;
        if (query) {
            allfiles = allfiles.filter((file) => file.name.toLowerCase().includes(query.toLowerCase()))
        }
        console.log("GET files")

        console.log("args.favorites : ", args.favorites)
        if (args.favorites) {
            const user = await ctx.db.query("users").withIndex("by_tokenIdentifier",
                (q) => q.eq("tokenIdentifier", identity.tokenIdentifier)).first();

            console.log("user :", user)
            if (!user) return allfiles;

            const favoriteFiles = await ctx.db.query("favorites").withIndex("by_userId_orgId_fileId",
                (q) => q.eq("userId", user._id!).eq("orgId", args.orgId)).collect()

            // What is done here?
            // "some" method in JS : some() method, which checks if at least one element in an array satisfies a provided condition. It returns true if at least one element passes the test, otherwise false.

            // "filter" method in JS : .filter() method is used to create a new array with all elements that pass a certain condition. It iterates through each element in the array and invokes a callback function for each element. The callback function should return true to include the element in the new array or false to exclude it.
            allfiles = allfiles.filter((file) =>
                favoriteFiles.some((favorite) => favorite.fileId === file._id))
        }

        return allfiles
    }
})



export const deleteFile = mutation({
    args: { fileId: v.id("files") },
    handler: async (ctx, args) => {
        //check if user is logged in and has access to the org

        const access = await hasAccessToFile(ctx, args.fileId)
        if (!access) {
            throw new ConvexError("Doesn't have access to file.")
        }

        await ctx.db.delete(args.fileId)

    }
})

export const toggleFavorite = mutation({
    args: { fileId: v.id("files") },
    handler: async (ctx, args) => {
        //check if user is logged in and has access to the org
        const access = await hasAccessToFile(ctx, args.fileId)
        if (!access) {
            throw new ConvexError("Doesn't have access to file.")
        }

        //checking to see if file is alredy in the favorite table 
        const favorite = await ctx.db.query("favorites").withIndex("by_userId_orgId_fileId",
            (q) => q.eq("userId", access.user._id).eq("orgId", access.file.orgId).eq("fileId", access.file._id)
        ).first();

        if (!favorite) {
            //if there is no favorite , create one
            await ctx.db.insert("favorites", {
                fileId: access.file._id,
                userId: access.user._id,
                orgId: access.file.orgId
            })
        } else {
            //if it already exists , we will unfav it by deleting it
            await ctx.db.delete(favorite._id)
        }
    }
})


//Utility function
async function hasAccessToFile(ctx: QueryCtx | MutationCtx, fileId: Id<"files">) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        return null;
        // throw new ConvexError("You do not have access to this org")
    }

    const file = await ctx.db.get(fileId)
    if (!file) {
        return null;
        // throw new ConvexError("This file doesn't exist.")
    }

    const hasAccess = await hasAccessToOrg(ctx, identity, file.orgId)
    if (!hasAccess) {
        return null;
        // throw new ConvexError("You do not have access to delete this file.")
    }

    const user = await ctx.db.query("users").withIndex("by_tokenIdentifier",
        (q) => q.eq("tokenIdentifier", identity.tokenIdentifier)).first();

    if (!user) {
        return null;

        // throw new ConvexError("No user found")
    }

    return { user, file }

}