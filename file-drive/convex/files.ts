// "use client"
import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"

// To add files in the db
export const createFile = mutation({
    args: {
        name: v.string(),
        orgId: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        console.log("identity from files.ts : ", identity)
        if (!identity) {
            throw new ConvexError("Not authorised");
        }
        await ctx.db.insert("files", {
            orgId: args.orgId!, name: args.name
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
        return await ctx.db.query("files").withIndex("by_orgId", q => {
            return q.eq('orgId', args.orgId!)
        }).collect()
    }
}) 