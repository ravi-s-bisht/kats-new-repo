'use client'

import { useState } from 'react'
import VideoUpload from './VideoUpload'
import SampleVideoModal from './SampleVideoModal'
import VideoList from './VideoList'
import InferenceProcess from './InferenceProcess'
import { Button } from "@/components/ui/button"
import { FileAudio, FileVideo, Play } from 'lucide-react'

const MAX_VIDEOS = 1 // Maximum number of videos that can be selected

export default function VideoInference() {
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isPredicting, setIsPredicting] = useState(false)

  const addVideo = (video: Video) => {
    if (selectedVideos.length < MAX_VIDEOS) {
      setSelectedVideos((prev) => [...prev, video])
    } else {
      alert(`You can only select up to ${MAX_VIDEOS} audios.`)
    }
  }

  const removeVideo = (id: string) => {
    setSelectedVideos((prev) => prev.filter((v) => v.id !== id))
    // Reset analysis state when a video is removed
    setIsAnalyzing(false)
    setIsPredicting(false)
  }

  const handleSampleVideoSelect = (video: Video) => {
    addVideo(video)
  }

  const startAnalysis = () => {
    if (selectedVideos.length > 0) {
      setIsAnalyzing(true)
      setIsPredicting(true)
    } else {
      alert("Please select a video before starting the analysis.")
    }
  }

  const resetAll = () => {
    setSelectedVideos([])
    setIsAnalyzing(false)
    setIsPredicting(false)
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      {/* <VideoUpload onUpload={addVideo} /> */}
      <Button
        onClick={() => setIsModalOpen(true)}
        className="mt-4 w-full"
        variant="outline"
        disabled={selectedVideos.length >= MAX_VIDEOS}
      >
        <FileAudio className="mr-2 h-4 w-4" />
        Select Sample Audio
      </Button>
      <SampleVideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSampleVideoSelect}
      />
      <VideoList videos={selectedVideos} onRemove={removeVideo} />
      {selectedVideos.length > 0 && !isAnalyzing && (
        <Button
          onClick={startAnalysis}
          className="mt-4 w-full"
          variant="default"
        >
          <Play className="mr-2 h-4 w-4" />
          Analyse
        </Button>
      )}
      {isAnalyzing && selectedVideos.length > 0 && (
        <InferenceProcess video={selectedVideos[0]} setIsPredicting={setIsPredicting} />
      )}
      {selectedVideos.length > 0 && (
        <Button
          onClick={resetAll}
          className="mt-4 w-full bg-red-600 text-white"
          variant="destructive"
          disabled={isPredicting}
        >
          Reset All
        </Button>
      )}
    </div>
  )
}

export interface Video {
  id: string
  name: string
  size?: number
  type?: string
  url: string
}