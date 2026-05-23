"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <AppSidebar />
      <main className="ml-20 min-h-screen p-8">{children}</main>
    </div>
  );
}
