
/**
 * Global branding overrides to fix logo issues without direct DB access.
 */
export const BRANDING_OVERRIDES = {
    logos: {
        'KNIGHT WOLF': '/kw-logo.png',
    }
};

export function getCompanyLogo(company: { name: string; logo: string | null } | null | undefined): string | null {
    if (!company) return null;
    
    // Check for hardcoded overrides first
    const upperName = company.name.trim().toUpperCase();
    if (BRANDING_OVERRIDES.logos[upperName as keyof typeof BRANDING_OVERRIDES.logos]) {
        return BRANDING_OVERRIDES.logos[upperName as keyof typeof BRANDING_OVERRIDES.logos];
    }
    
    return company.logo;
}
