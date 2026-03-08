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
                // Firebase OTP path (used for PIN reset verification only)
                firebaseToken: { label: "Firebase Token", type: "text" },
                phone: { label: "Phone", type: "text" },
                // Phone + PIN login
                pin: { label: "PIN", type: "password" },
                // Legacy email/password (admin fallback)
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {

                // ── Path 1: Phone + PIN Login ─────────────────────────────────
                if (credentials?.phone && credentials?.pin && !credentials?.firebaseToken) {
                    const raw = credentials.phone.replace(/\D/g, "");
                    const formattedPhone = raw.startsWith("91") && raw.length === 12
                        ? `+${raw}`
                        : `+91${raw.slice(-10)}`;

                    const user = await prisma.user.findFirst({
                        where: { phone: formattedPhone },
                        include: {
                            companyMembership: { include: { company: true } },
                        },
                    });

                    if (!user) {
                        console.error(`Phone not found: ${formattedPhone}`);
                        return null;
                    }

                    if (!user.pin) {
                        // No PIN set — deny access
                        console.error(`No PIN set for user: ${user.id}`);
                        return null;
                    }

                    const pinValid = await bcrypt.compare(credentials.pin, user.pin);
                    if (!pinValid) {
                        console.error("Invalid PIN for user:", user.id);
                        return null;
                    }

                    const memberships = user.companyMembership.map((m: any) => ({
                        companyId: m.company.id,
                        companyName: m.company.name,
                        companyTheme: m.company.themeColor || "#000000",
                        companyLogo: m.company.logo,
                    }));

                    // Admin gets access to all companies
                    const allCompanyMemberships = memberships.length > 0
                        ? memberships
                        : (await prisma.company.findMany()).map((c: any) => ({
                            companyId: c.id,
                            companyName: c.name,
                            companyTheme: c.themeColor || "#000000",
                            companyLogo: c.logo,
                        }));

                    const activeCompanyId = allCompanyMemberships.length > 0
                        ? allCompanyMemberships[0].companyId
                        : "";

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        pinResetRequired: user.pinResetRequired,
                        memberships: allCompanyMemberships,
                        activeCompanyId,
                    } as any;
                }

                // ── Path 2: Firebase Token (OTP PIN Reset Verification) ───────
                if (credentials?.firebaseToken && credentials?.phone) {
                    console.log("Firebase OTP verification path — phone:", credentials.phone);
                    try {
                        const adminAuth = await getAdminAuth();
                        const decodedValue = await adminAuth.verifyIdToken(credentials.firebaseToken);
                        console.log("Firebase token verified! uid:", decodedValue.uid);

                        const raw = credentials.phone.replace(/\D/g, "");
                        const formattedPhone = raw.startsWith("91") && raw.length === 12
                            ? `+${raw}`
                            : `+91${raw.slice(-10)}`;

                        const user = await prisma.user.findFirst({
                            where: { phone: formattedPhone },
                            include: {
                                companyMembership: { include: { company: true } },
                            },
                        });

                        if (!user) {
                            console.error(`User NOT FOUND for phone: ${formattedPhone}`);
                            return null;
                        }

                        const memberships = user.companyMembership.map((m: any) => ({
                            companyId: m.company.id,
                            companyName: m.company.name,
                            companyTheme: m.company.themeColor || "#000000",
                            companyLogo: m.company.logo,
                        }));

                        const allCompanyMemberships = memberships.length > 0
                            ? memberships
                            : (await prisma.company.findMany()).map((c: any) => ({
                                companyId: c.id,
                                companyName: c.name,
                                companyTheme: c.themeColor || "#000000",
                                companyLogo: c.logo,
                            }));

                        const activeCompanyId = allCompanyMemberships.length > 0
                            ? allCompanyMemberships[0].companyId
                            : "";

                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                            pinResetRequired: user.pinResetRequired,
                            memberships: allCompanyMemberships,
                            activeCompanyId,
                        } as any;
                    } catch (err) {
                        console.error("Firebase token verification failed:", err);
                        return null;
                    }
                }

                // ── Path 3: Legacy Email / Password (Admin fallback) ──────────
                if (credentials?.email && credentials?.password) {
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
                        pinResetRequired: false,
                        memberships,
                        activeCompanyId,
                    } as any;
                }

                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }: { token: any; user: any; trigger?: any; session?: any }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.memberships = user.memberships;
                token.activeCompanyId = user.activeCompanyId;
                token.pinResetRequired = user.pinResetRequired;
            }
            if (trigger === "update") {
                if (session?.activeCompanyId) token.activeCompanyId = session.activeCompanyId;
                if (session?.pinResetRequired !== undefined) token.pinResetRequired = session.pinResetRequired;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.id as string,
                    role: token.role as string,
                    memberships: token.memberships,
                    activeCompanyId: token.activeCompanyId,
                    pinResetRequired: token.pinResetRequired,
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
