"use client";
import { useEffect } from "react";

export default function Logout() {
  useEffect(() => {
    localStorage.removeItem("admin-token");
    localStorage.removeItem("marketing-token");
    localStorage.removeItem("school-token");
    window.location.href = "/admin/login";
  });

  return <></>;
}
