"use client"
import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"

// To add files in the db
export const createFile = mutation({
    args: {
        name: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new ConvexError("Not authorised");
        }
        await ctx.db.insert("files", { name: args.name })
    }
})

//To fetch all the files present in the db in that table
export const getFile = query({
    args: {},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return []
        }
        return await ctx.db.query("files").collect()
    }
}) 