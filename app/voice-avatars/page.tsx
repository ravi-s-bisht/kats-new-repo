"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Play } from "lucide-react";
import { PRESET_CHARACTERS } from "@/rtvi.config";
import Link from "next/link";

const categories = ["All", "casual", "professional", "narrator"];

export default function VoiceAvatarsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredAvatars = PRESET_CHARACTERS.filter((avatar) =>
    avatar.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Voice Avatars</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative sm:w-64">
          <Input
            placeholder="Search avatars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 mr-2 hover:bg-gray-200 rounded-full h-5 w-5 p-[1px] flex justify-center items-center"
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>
        {/* <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAvatars.map((avatar) => (
          <Card key={avatar.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{avatar.name}</CardTitle>
              {/* <CardDescription>{avatar.language}</CardDescription> */}
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="mb-4">{avatar.description}</p>
              <Link href={`/voice-avatars/${avatar.id}`}>
                <Button variant="outline" className="w-full">
                  <Play className="mr-2 h-4 w-4" /> Talk
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
