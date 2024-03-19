// "use client"
import { ConvexError, v } from "convex/values"
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server"
import { getUser } from "./users";
import { UserIdentity } from "convex/server";


export const hasAccessToOrg = async (
    ctx: QueryCtx | MutationCtx,
    identity: UserIdentity,
    orgId?: string) => {
    const user = await getUser(ctx, identity.tokenIdentifier);
    // This hasAccess var shows if the user has the right to create a file in that org
    const hasAccess = user.orgIds.includes(orgId!) || user.tokenIdentifier.includes(orgId!);

    console.log(identity.tokenIdentifier)
    console.log(user.tokenIdentifier)
    console.log(user.orgIds)
    console.log(orgId)

    console.log(hasAccess)
    // if (!hasAccess) {
    //     throw new ConvexError("You do not have access to this org")
    // }

    return hasAccess

}

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

        const hasAccess = await hasAccessToOrg(ctx, identity, args.orgId)
        if (!hasAccess) {
            return []
        }

        return await ctx.db.query("files").withIndex("by_orgId", q => {
            return q.eq('orgId', args.orgId!)
        }).collect()
    }
})



