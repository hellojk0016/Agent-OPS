/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                phone: { label: "Phone", type: "text" },
                pin: { label: "PIN", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.pin) return null;

                const raw = String(credentials.phone).replace(/\D/g, "");
                const formattedPhone =
                    raw.length === 12 && raw.startsWith("91")
                        ? `+${raw}`
                        : `+91${raw.slice(-10)}`;

                const user = await prisma.user.findFirst({
                    where: { phone: formattedPhone },
                    include: {
                        companyMembership: { include: { company: true } },
                    },
                });

                if (!user) {
                    console.error(`[AUTH_ERROR] Phone not registered: ${formattedPhone}`);
                    return null;
                }

                if (!user.pin) {
                    console.error(`[AUTH_ERROR] No PIN set for user: ${user.id} (${user.name})`);
                    return null;
                }

                const pinValid = await bcrypt.compare(
                    String(credentials.pin),
                    user.pin
                );
                if (!pinValid) {
                    console.error(`[AUTH_ERROR] Wrong PIN attempt for user: ${user.id} (${user.name})`);
                    return null;
                }

                // Build company memberships
                const memberships = user.companyMembership.map((m: any) => ({
                    companyId: m.company.id,
                    companyName: m.company.name,
                    companyTheme: m.company.themeColor ?? "#000000",
                    companyLogo: m.company.logo,
                }));

                // Admin falls back to all companies
                const allMemberships =
                    memberships.length > 0
                        ? memberships
                        : (await prisma.company.findMany()).map((c: any) => ({
                            companyId: c.id,
                            companyName: c.name,
                            companyTheme: c.themeColor ?? "#000000",
                            companyLogo: c.logo,
                        }));

                const activeCompanyId =
                    allMemberships.length > 0 ? allMemberships[0].companyId : "";

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    memberships: allMemberships,
                    activeCompanyId,
                    pinResetRequired: user.pinResetRequired,
                } as any;
            },
        }),
    ],

    callbacks: {
        async jwt({
            token,
            user,
            trigger,
            session,
        }: {
            token: any;
            user: any;
            trigger?: any;
            session?: any;
        }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.memberships = user.memberships;
                token.activeCompanyId = user.activeCompanyId;
                token.pinResetRequired = user.pinResetRequired;
            }
            if (trigger === "update" && session?.activeCompanyId) {
                token.activeCompanyId = session.activeCompanyId;
            }
            return token;
        },

        async session({
            session,
            token,
        }: {
            session: any;
            token: any;
        }) {
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.id as string,
                    role: token.role as string,
                    memberships: token.memberships,
                    activeCompanyId: token.activeCompanyId,
                    pinResetRequired: token.pinResetRequired as boolean,
                };
            }
            return session;
        },
    },

    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
