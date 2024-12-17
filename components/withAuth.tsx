"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/contexts/UserContext";

export function withAuth(
  WrappedComponent: React.ComponentType,
  allowedRoles: ("user" | "admin")[]
) {
  return function AuthenticatedComponent(props: any) {
    const router = useRouter();
    const { setUser, setRole } = useUser();
    const [loading, setLoading] = useState(true);

    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return false;
      }

      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          const { role, user, token } = await res.json();

          setUser(user);
          setRole(role);
          localStorage.setItem("token", token);
          localStorage.setItem("role", role);
          localStorage.setItem("user", JSON.stringify(user));
          return true;
        }
      } catch (error) {
        console.error("Error verifying token:", error);
      }

      return false;
    };

    useEffect(() => {
      const checkAuthentication = async () => {
        const isVerified = await verifyToken();

        if (!isVerified) {
          console.log("User is not verified");
          localStorage.clear();
          router.push("/login");
          return;
        }

        // Use stored role for navigation decisions
        const storedRole = localStorage.getItem("role");
        if (!allowedRoles.includes(storedRole as "user" | "admin")) {
          if (storedRole === "user") {
            router.push("/avatars");
          } else if (storedRole === "admin") {
            router.push("/admin/dashboard");
          } else {
            console.log("Invalid role:", storedRole);
            router.push("/login");
          }
          return;
        }

        setLoading(false);
      };

      checkAuthentication();
    }, [router]);

    if (loading) {
      return <div className="mt-16">Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };
}
