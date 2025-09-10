"use client";
import { useEffect } from "react";

export default function MarketingLogout() {
  useEffect(() => {
    localStorage.removeItem("marketing-name");
    localStorage.removeItem("marketing-username");
    localStorage.removeItem("marketing-password");
    window.location.href = "/marketing/login";
  }, []);

  return null;
}
