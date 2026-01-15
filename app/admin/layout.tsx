"use client";
import { Ubuntu } from "next/font/google";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserRole } from "../api/utils/auth";
import styles from "./admin.module.css";

const ubuntu = Ubuntu({ weight: ["400", "700"], subsets: ["latin"] });

type AuthData = {
  role?: string;
  methods?: string[];
  additionalScopes?: string[];
};

type NavItem = {
  href: string;
  label: string;
  requiredScope?: string;
  requiredRole?: string[];
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin/payments",
    label: "New Payment",
    requiredScope: "payment_dashboard",
  },
  {
    href: "/admin/manage-account-holders",
    label: "Account Holders",
    requiredScope: "manage_account_holders",
  },
  {
    href: "/admin",
    label: "Dashboard",
    requiredScope: "ticket_dashboard",
  },
  {
    href: "/admin/pay-history",
    label: "Payment Logs",
    requiredScope: "payment_logs",
  },
  {
    href: "/admin/manage-marketing-members",
    label: "Marketing Members",
    requiredScope: "marketing_dashboard",
  },
  {
    href: "/admin/speaker-tickets",
    label: "Invitations",
    requiredScope: "invitations",
  },
];

function canAccessNavItem(auth: AuthData, item: NavItem): boolean {
  if (!auth.role) return false;

  // Admin can access everything
  if (auth.role === UserRole.ADMIN) return true;

  // Check required role
  if (item.requiredRole) {
    return item.requiredRole.includes(auth.role);
  }

  // Check required scope
  if (item.requiredScope) {
    const hasScope = auth.additionalScopes?.includes(item.requiredScope);

    // Some roles have implicit access to certain scopes
    const implicitAccess: Partial<Record<UserRole, string[]>> = {
      [UserRole.PAYMENT_HANDLER]: ["payment_dashboard"],
      [UserRole.SCHOOL_OFFICE]: ["payment_dashboard", "query_tickets"],
      [UserRole.MARKETING_HEAD]: ["marketing_dashboard"],
    };

    const implicit = implicitAccess[auth.role as UserRole] ?? [];
    return hasScope || implicit.includes(item.requiredScope);
  }

  return false;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/auth")
      .then((res) => {
        if (res.status === 401) {
          setAuth(null);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setAuth(data);
        else setAuth(null);
      })
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/auth", { method: "DELETE" });
      if (!response.ok) {
        console.error("Failed to log out. Status:", response.status);
        return;
      }
      setAuth(null);
      router.push("/admin/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const visibleItems = auth
    ? NAV_ITEMS.filter((item) => canAccessNavItem(auth, item))
    : [];

  const isLoginPage = pathname === "/admin/login";

  return (
    <div className={styles.adminContainer}>
      {!isLoginPage && (
        <nav className={styles.nav}>
          <div className={styles.navBrand}>
            <span className={styles.brandIcon}>⚙</span>
            <span className={styles.brandText}>Admin</span>
          </div>

          <div className={styles.navLinks}>
            {!loading &&
              auth?.role &&
              visibleItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${
                    pathname === item.href ? styles.navLinkActive : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
          </div>

          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      )}

      <div style={ubuntu.style}>{children}</div>
    </div>
  );
}
