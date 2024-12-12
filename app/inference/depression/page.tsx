import VideoInference from "@/components/inference/Depression/VideoInference";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function InferencePage() {
  return (
    <div className="container mx-auto pb-10">
      <div className="flex flex-row justify-start h-30 w-full py-3">
        <div className="flex justify-center items-center">
          <ChevronLeft size={20} />
          <Link href="/inference" className="z-50">
            <Button variant="link" className="hover:underline z-50 pl-0">
              Back
            </Button>
          </Link>
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-7 mt-16 text-center">
        Depressed vs Non-depressed Mood
      </h1>
      <VideoInference />
    </div>
  );
}
