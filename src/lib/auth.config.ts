import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

async function getAdminAuth() {
    const { adminAuth } = await import("./firebase-admin");
    return adminAuth;
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                // Firebase OTP path
                firebaseToken: { label: "Firebase Token", type: "text" },
                phone: { label: "Phone", type: "text" },
                // Legacy email/password path (kept for admin fallback)
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // ── Path 1: Firebase Phone OTP ──────────────────────────────
                if (credentials?.firebaseToken && credentials?.phone) {
                    console.log("NextAuth credentials received! Phone:", credentials.phone);
                    try {
                        const adminAuth = await getAdminAuth();
                        // Verify the Firebase ID token server-side
                        const decodedValue = await adminAuth.verifyIdToken(credentials.firebaseToken);
                        console.log("Firebase token verified successfully! uid:", decodedValue.uid);

                        // Find the user in our DB by phone number
                        const user = await prisma.user.findFirst({
                            where: { phone: credentials.phone },
                            include: {
                                companyMembership: { include: { company: true } },
                            },
                        });

                        if (!user) {
                            console.error(`User NOT FOUND in database for phone: ${credentials.phone}`);
                            return null;
                        }
                        console.log("User matched in DB:", user.name, user.role);

                        const memberships = user.companyMembership.map((m: any) => ({
                            companyId: m.company.id,
                            companyName: m.company.name,
                            companyTheme: m.company.themeColor || "#000000",
                            companyLogo: m.company.logo,
                        }));

                        // Fall back to all companies if no direct memberships (ADMIN)
                        const allCompanyMemberships = memberships.length > 0
                            ? memberships
                            : (await prisma.company.findMany()).map((c: any) => ({
                                companyId: c.id,
                                companyName: c.name,
                                companyTheme: c.themeColor || "#000000",
                                companyLogo: c.logo,
                            }));

                        const activeCompanyId =
                            allCompanyMemberships.length > 0
                                ? allCompanyMemberships[0].companyId
                                : "";

                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                            memberships: allCompanyMemberships,
                            activeCompanyId,
                        } as any;
                    } catch (err) {
                        console.error("Firebase token verification failed:", err);
                        return null;
                    }
                }

                // ── Path 2: Legacy Email / Password ─────────────────────────
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email.toLowerCase();
                const user = await prisma.user.findUnique({
                    where: { email },
                    include: {
                        companyMembership: { include: { company: true } },
                    },
                });

                if (!user) return null;

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) return null;

                const memberships = (await prisma.company.findMany()).map((c: any) => ({
                    companyId: c.id,
                    companyName: c.name,
                    companyTheme: c.themeColor || "#000000",
                    companyLogo: c.logo,
                }));

                const activeCompanyId = memberships.length > 0 ? memberships[0].companyId : "";

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    memberships,
                    activeCompanyId,
                } as any;
            },
        }),
    ],
    callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async jwt({ token, user, trigger, session }: { token: any; user: any; trigger?: any; session?: any }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.memberships = user.memberships;
                token.activeCompanyId = user.activeCompanyId;
            }
            if (trigger === "update" && session?.activeCompanyId) {
                token.activeCompanyId = session.activeCompanyId;
            }
            return token;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async session({ session, token }: { session: any; token: any }) {
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.id as string,
                    role: token.role as string,
                    memberships: token.memberships,
                    activeCompanyId: token.activeCompanyId,
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
