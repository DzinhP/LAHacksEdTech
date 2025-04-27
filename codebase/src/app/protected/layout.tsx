"use client";

import type { MenuItem } from "@/components/protected/Sidebar";
import Sidebar from "@/components/protected/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // Updated menu items to reflect the teacher dashboard app pages
  const protectedMenuItems: MenuItem[] = [
    { label: "Dashboard", href: "/protected/", section: "Main" },
    { label: "Courses", href: "/protected/courses", section: "Main" },
    { label: "Announcements", href: "/protected/announcements", section: "Main" },
    { label: "Home Page", href: "/", section: "Navigation" },
    { label: "Learn More", href: "https://vly.ai", section: "Lift Ed" },
  ];

  const { isLoading, isAuthenticated, user } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/auth?redirect=${encodeURIComponent(pathname)}`);
    }
  });

  // DO NOT TOUCH THIS SECTION. IT IS THE AUTHENTICATION LAYOUT.
  return (
    <>
      <Unauthenticated>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin " />
        </div>
      </Unauthenticated>
      <AuthLoading>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin " />
        </div>
      </AuthLoading>
      <Authenticated>
        <Sidebar menuItems={protectedMenuItems} userEmail={user?.email} userName={user?.name}>
          {children}
        </Sidebar>
      </Authenticated>
    </>
  );
}