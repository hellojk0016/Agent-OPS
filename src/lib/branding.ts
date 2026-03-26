
/**
 * Global branding overrides to fix logo issues without direct DB access.
 */
export const BRANDING_OVERRIDES = {
    logos: {
        'KNIGHT WOLF': '/images/kw-logo.png',
        'COMMERCE AGENT': '/images/ca-logo.png',
        'AGENTS OPS': '/images/ops-logo.png',
        'AGENT OPS': '/images/ops-logo.png',
    },
    names: {
        'AGENTS OPS': 'AGENTS OPS',
        'AGENT OPS': 'AGENTS OPS',
        'KNIGHT WOLF': 'KNIGHTWOLF',
        'COMMERCE AGENT': 'COMMERCE AGENTS',
    }
};

export function getCompanyLogo(company: { name: string; logo: string | null } | null | undefined): string | null {
    if (!company) return null;
    
    const upperName = company.name.trim().toUpperCase();
    if (BRANDING_OVERRIDES.logos[upperName as keyof typeof BRANDING_OVERRIDES.logos]) {
        return BRANDING_OVERRIDES.logos[upperName as keyof typeof BRANDING_OVERRIDES.logos];
    }
    
    return company.logo;
}

export function getCompanyName(name: string | null | undefined): string {
    if (!name) return "AGENTS OPS";
    const upperName = name.trim().toUpperCase();
    if (BRANDING_OVERRIDES.names[upperName as keyof typeof BRANDING_OVERRIDES.names]) {
        return BRANDING_OVERRIDES.names[upperName as keyof typeof BRANDING_OVERRIDES.names];
    }
    return upperName;
}

export function isPlatformBrand(name: string | null | undefined): boolean {
    if (!name) return true;
    const normalized = getCompanyName(name).toUpperCase();
    return normalized === "AGENTS OPS";
}
