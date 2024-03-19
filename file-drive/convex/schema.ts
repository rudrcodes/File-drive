import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    files: defineTable({
        name: v.string(),
        orgId: v.string()
    }).index("by_orgId", ["orgId"]),

    users: defineTable({
        tokenIdentifier: v.string(),
        orgIds: v.array(v.string())
    }).index("by_tokenIdentifier", ["tokenIdentifier"])
});

/*
{
  tokenIdentifier: 'https://verified-collie-80.clerk.accounts.dev|user_2ds5yRujXkloSKH5syhbClQfKUB',
  issuer: 'https://verified-collie-80.clerk.accounts.dev',
  subject: 'user_2ds5yRujXkloSKH5syhbClQfKUB',
  name: 'Rudransh Aggarwal',
  givenName: 'Rudransh',
  familyName: 'Aggarwal',
  pictureUrl: 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yZHM1eVhVdE1XSDV2NTFZVjZaYnd6d0pOWngifQ',
  email: 'aggarwalrudransh@gmail.com',
  emailVerified: true,
  phoneNumberVerified: false,
  updatedAt: '2024-03-18T17:49:59+00:00'
}

*/