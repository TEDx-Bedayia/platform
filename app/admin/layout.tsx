"use client";
import { Ubuntu } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./admin.module.css";

const ubuntu = Ubuntu({ weight: ["400", "700"], subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [mode, setMode] = useState<"other" | "admin">("other");
  useEffect(() => {
    fetch("/api/admin/auth")
      .then((res) => res.json())
      .then((data) => {
        console.log(data.role);
        if (data.role == "admin") setMode("admin");
      });
  }, []);
  return (
    <div className={styles.adminContainer}>
      {pathname != "/admin/login" && mode == "admin" && (
        <nav className={styles.nav}>
          <Link href={"/admin/payments"}>New Payment</Link>
          <Link href={"/admin"}>Dashboard</Link>
          <Link href={"/admin/pay-history"}>Payment Logs</Link>
          <Link href={"/admin/manage-marketing-members"}>
            Marketing Members
          </Link>
        </nav>
      )}

      <div style={ubuntu.style}>{children}</div>
    </div>
  );
}
