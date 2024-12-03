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
import { Phone, Play, Video } from "lucide-react";
import Link from "next/link";
import { HUME_PRESET_CHARACTERS } from "@/components/hume/hume-configs";
import Image from "next/image";

const categories = ["All", "Voice", "Video"];

export default function VoiceAvatarsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredAvatars = HUME_PRESET_CHARACTERS.filter((avatar) =>
    avatar.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Avatars Demo</h1>
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
          <SelectContent className="bg-white">
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
              <div className="flex items-center justify-center">
                <CardTitle>{avatar.name}</CardTitle>
              </div>
              {/* <CardDescription>{avatar.language}</CardDescription> */}
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex justify-center items-center">
                <Image
                  src={avatar.imageUrl}
                  alt={avatar.name}
                  className="rounded-full mb-5"
                  width={150}
                  height={150}
                  priority
                />
              </div>
              <p className="mb-4">{avatar.description}</p>
              <Link href={`/demos/${avatar.type}/${avatar.id}`}>
                <Button className="w-full">
                  {avatar.type == "voice" ? (
                    <Phone className="mr-2 h-4 w-4" />
                  ) : (
                    <Video className="mr-2 h-4 w-4" color="white" />
                  )}{" "}
                  {avatar.type == "voice" ? "Voice" : "Video"} Call
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
