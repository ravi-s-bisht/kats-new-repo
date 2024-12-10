"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon, Users, Bell, LogOut, Home, User } from "lucide-react";
import { useUser } from "@/src/contexts/UserContext";

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/admin/dashboard", adminOnly: true },
  {
    icon: Users,
    label: "Users",
    href: "/admin/dashboard/users",
    adminOnly: true,
  },
  {
    icon: Bell,
    label: "Reminders",
    href: "/admin/dashboard/reminders",
    adminOnly: true,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, role } = useUser();

  useEffect(() => {
    const storedRole = role;

    if (!storedRole) {
      router.push("/login");
    }

    // Redirect non-admin users
    if (storedRole !== "admin") {
      router.push("/avatars");
    }
  }, [router]);

  const handleLogout = () => {
    logout();
  };

  if (role !== "admin") {
    return null; // or a loading spinner
  }

  return (
    <div className="flex h-full overflow-hidden w-full fixed pt-[70px]">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r transition-all overflow-hidden duration-300 h-[calc(100vh-70px)]",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex flex-col">
          <div className="flex h-14 items-center justify-between px-4 py-3 border-b">
            {!isCollapsed && <span className="font-bold">Admin Dashboard</span>}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <MenuIcon className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex flex-col gap-2 p-2 flex-grow">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-accent",
                  pathname === item.href ? "bg-gray-100" : "",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <item.icon className="h-4 w-4" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-2 mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start bg-red-600 py-4 text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" color="white" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <MenuIcon className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="flex h-14 items-center px-4 border-b">
              <span className="font-bold">Admin Dashboard</span>
            </div>
            <nav className="flex flex-col gap-2 p-2 flex-grow">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                    pathname === item.href ? "bg-accent" : ""
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-2 mt-auto">
              <Button
                variant="ghost"
                className="w-full justify-start bg-red-600 text-white"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" color="white" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 border-b flex items-center px-4">
          <Button variant="ghost" size="icon" className="md:hidden mr-2">
            <MenuIcon className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

