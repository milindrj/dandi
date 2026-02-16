const BASE_NAV_ITEMS = [
  { label: "Overview", icon: "home" as const },
  { label: "Research Assistant", icon: "sparkle" as const },
  { label: "Research Reports", icon: "folder" as const },
  { label: "API Playground", icon: "code" as const },
  { label: "Invoices", icon: "receipt" as const },
  { label: "Documentation", icon: "doc" as const, external: true },
] as const;

const DEFAULT_HREF = "#";

export const PENDING_API_KEY_STORAGE = "dandi-pending-api-key";

const CUSTOM_HREFS: Partial<Record<(typeof BASE_NAV_ITEMS)[number]["label"], string>> = {
  "API Playground": "/playground",
};

export function getNavItems(overviewHref: string, activeHref: string) {
  return BASE_NAV_ITEMS.map((item, i) => {
    const href = CUSTOM_HREFS[item.label] ?? (i === 0 ? overviewHref : DEFAULT_HREF);
    return {
      ...item,
      href,
      active: href === activeHref,
    };
  });
}
