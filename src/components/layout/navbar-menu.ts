export type NavMenuItem = {
  href: string;
  label: string;
  requiresAuth: boolean;
};

export const NAV_MENU_ITEMS: NavMenuItem[] = [
  { href: "/sets", label: "Sets", requiresAuth: false },
  { href: "/collection", label: "Collection", requiresAuth: true },
  { href: "/wishlist", label: "Wishlist", requiresAuth: true },
  { href: "/recommendations", label: "Recommendations", requiresAuth: true },
];

export function visibleNavItems(isSignedIn: boolean): NavMenuItem[] {
  return NAV_MENU_ITEMS.filter((item) => !item.requiresAuth || isSignedIn);
}
