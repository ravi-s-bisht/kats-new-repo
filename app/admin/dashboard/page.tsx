"use client";

import { Button } from "@/components/ui/button";
import { withAuth } from "@/components/withAuth";
import { useToast } from "@/hooks/use-toast";
import React from "react";

function Dashboard() {
  const { toast } = useToast();

  return (
    <div className="overflow-hidden">
      {/* <Button
        onClick={() => {
          toast({
            title: "Hello",
            description: "This is a toast",
          })
        }}
      >
        Click me
      </Button> */}
    </div>
  );
}

export default withAuth(Dashboard, ['admin']);