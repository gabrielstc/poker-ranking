import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            clubId: string | null
            clubName: string | null
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        email: string
        name?: string
        role: string
        clubId: string | null
        clubName: string | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
        clubId: string | null
        clubName: string | null
    }
}
