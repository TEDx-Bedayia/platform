"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Logout() {
  const router = useRouter();
  useEffect(() => {
    fetch("/api/admin/auth/logout", { method: "POST" })
      .then(() => {
        router.push("/admin/login");
      })
      .catch((error) => {
        console.error("Error during logout:", error);
        router.push("/admin/login");
      });
  }, [router]);

  return <></>;
}
