import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            memberships: {
                companyId: string;
                companyName: string;
                companyTheme: string;
                companyLogo?: string | null;
            }[];
            activeCompanyId: string;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        role: string;
        memberships: {
            companyId: string;
            companyName: string;
            companyTheme: string;
            companyLogo?: string | null;
        }[];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        memberships: {
            companyId: string;
            companyName: string;
            companyTheme: string;
            companyLogo?: string | null;
        }[];
        activeCompanyId: string;
    }
}
