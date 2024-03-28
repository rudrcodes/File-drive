import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, internalMutation } from "./_generated/server";
import { GenericMutationCtx } from "convex/server";
import { roles } from "./schema";

export const getUser = async (ctx: QueryCtx | MutationCtx, tokenIdentifier: string) => {

    const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", tokenIdentifier)).first()

    if (!user) throw new ConvexError("Expected user to be defined (User doesn't exist)")
    return user
}

export const createUser = internalMutation({
    args: { tokenIdentifier: v.string() },
    handler: async (ctx, args) => {
        // console.log("args.tokenIdentifier from users.ts : ", args.tokenIdentifier)

        await ctx.db.insert("users", {
            tokenIdentifier: args.tokenIdentifier,
            orgIds: [],
        })
    }
})


export const addOrgToUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        orgId: v.string(),
        role: roles
    },
    handler: async (ctx, args) => {
        // first get the user info

        // console.log("token from users.ts : ", args.tokenIdentifier)
        // console.log("identity.tokenIdentifier : ", identity?.tokenIdentifier)
        // console.log("args.tokenIdentifier : ", args.tokenIdentifier)


        // q.eq("tokenIdentifier", args.tokenIdentifier)).first()
        const user = await getUser(ctx, args.tokenIdentifier);


        // console.log("user from users.ts : ", user)

        // await ctx.db.insert("users", {
        //     tokenIdentifier: args.tokenIdentifier as string,
        //     orgIds: [...user?.orgIds, args.orgId]
        // })

        await ctx.db.patch(user._id, {
            orgIds: [...user?.orgIds, { orgId: args.orgId, role: args.role }]
        })
    }
})

export const updateRoleInOrgForUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        orgId: v.string(),
        role: roles
    },
    handler: async (ctx, args) => {
        console.log("Updated called");
        const user = await getUser(ctx, args.tokenIdentifier);

        const org = user.orgIds.find((org) => org.orgId === args.orgId)
        if (!org) {
            throw new ConvexError("Expected on org for user but not found")
        }

        org.role = args.role

        await ctx.db.patch(user._id, {
            orgIds: user?.orgIds
        })
    }
})
