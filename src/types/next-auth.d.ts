
import NextAuth, { DefaultSession } from "next-auth"
import { UserRole, SubscriptionTier } from "@prisma/client"

/**
 * 🛠️ NextAuth 타입 확장 (Type Augmentation)
 * 
 * 기본 Session과 User 타입에는 role과 tier 정보가 없습니다.
 * TypeScript가 이를 인식할 수 있도록 모듈을 확장합니다.
 */
declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: UserRole
            tier: SubscriptionTier
        } & DefaultSession["user"]
    }

    interface User {
        role: UserRole
        tier: SubscriptionTier
    }
}

declare module "next-auth/adapters" {
    interface AdapterUser {
        role: UserRole
        tier: SubscriptionTier
    }
}
