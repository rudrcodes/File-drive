import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, internalMutation } from "./_generated/server";
import { GenericMutationCtx } from "convex/server";

export const getUser = async (ctx: QueryCtx | MutationCtx, tokenIdentifier: string) => {

    const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", tokenIdentifier)).first()

    if (!user) throw new ConvexError("Expected user to be defined (User doesn't exist)")
    return user
}

export const createUser = internalMutation({
    args: { tokenIdentifier: v.string() },
    handler: async (ctx, args) => {
        console.log("args.tokenIdentifier from users.ts : ", args.tokenIdentifier)

        await ctx.db.insert("users", {
            tokenIdentifier: args.tokenIdentifier,
            orgIds: []
        })
    }
})


export const addOrgToUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        orgId: v.string()
    },
    handler: async (ctx, args) => {
        // first get the user info

        console.log("token from users.ts : ", args.tokenIdentifier)
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) console.log("user identity doesn't exists")
        console.log("identity.tokenIdentifier : ", identity?.tokenIdentifier)
        console.log("args.tokenIdentifier : ", args.tokenIdentifier)


        // q.eq("tokenIdentifier", args.tokenIdentifier)).first()
        const user = await getUser(ctx, args.tokenIdentifier);


        // console.log("user from users.ts : ", user)

        // await ctx.db.insert("users", {
        //     tokenIdentifier: args.tokenIdentifier as string,
        //     orgIds: [...user?.orgIds, args.orgId]
        // })

        await ctx.db.patch(user._id, {
            orgIds: [...user?.orgIds, args.orgId]
        })
    }
})


// Focus on this :   "https://verified-collie-80.clerk.accounts.dev|user_2duQGg04NzlzicfmVddRNScnk5r"




//   "https://verified-collie-80.clerk.accounts.dev|user_2duQnq6teK2N7tMjvJhrKHIiHz0"