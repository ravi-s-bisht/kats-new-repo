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
    <div className="container mx-auto py-8 pt-[110px]">
      <section className="grid md:grid-cols-2 gap-6 md:gap-12 w-full max-w-screen-xl mx-auto mb-12">
        <Image src="/medical-checkin-ai.webp" alt="Medical Checkin" width={640} height={960} className="w-full h-auto aspect-square lg:aspect-[3/2] my-auto object-cover rounded-3xl" />
        <div className="flex flex-col gap-6 md:gap-8  md:items-start md:text-left justify-center">
          <h1 className="text-3xl md:text-4xl font-bold">Health Check-in</h1>
          <p>Explore our cutting-edge Health Check-in demo and see how effortless real-time health tracking can be. Using advanced technology, our system analyzes key metrics like heart rate and stress levels—right from your device. Experience the future of wellness today!</p>
          <Link href="/demos/medical-checkin">
            <Button className="h-12 !text-lg !w-full max-w-[500px]" size="lg">
              <Video className="mr-2 !h-5 !w-5" />
              Try the Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* <h2 className="text-2xl md:text-3xl font-bold">Avatars Demo</h2> */}
      
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* <div className="relative sm:w-64">
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
        </div> */}
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
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAvatars.map((avatar) => (
          <Card key={avatar.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-center">
                <CardTitle>{avatar.name}</CardTitle>
              </div>
              <CardDescription>{avatar.language}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-full justify-between items-center">
              <div className="flex flex-col">
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
              </div>
              <div className="flex w-full">
                <Link
                  href={`demos/${avatar.type}/${avatar.id}`}
                  className="w-full"
                >
                  <Button className="w-full">
                    {avatar.type == "voice" ? (
                      <Phone className="mr-2 h-4 w-4" />
                    ) : (
                      <Video className="mr-2 h-4 w-4" color="white" />
                    )}{" "}
                    {avatar.type == "voice" ? "Voice" : "Video"} Call
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div> */}
    </div>
  );
}
