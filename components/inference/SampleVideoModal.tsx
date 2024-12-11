import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Video } from './VideoInference'
import { FileVideo, Film, VideoIcon } from 'lucide-react'

interface SampleVideoModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (video: Video) => void
}

const sampleVideos: (Video)[] = [
  { id: '1', name: 'Depressed 1', url: 'https://storage.googleapis.com/playground-sample-files/media/Mood/mood_depressed_002.mp4' },
  { id: '2', name: 'Non-Depressed 1', url: 'https://storage.googleapis.com/playground-sample-files/media/Mood/mood_nondepressed_001.mp4' },
]

export default function SampleVideoModal({ isOpen, onClose, onSelect }: SampleVideoModalProps) {
  const handleSelect = (video: Video) => {
    onSelect(video)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Select a Sample Video</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {sampleVideos.map((video) => (
            <Button
              key={video.id}
              variant="outline"
              className="h-auto p-4 py-7 flex flex-col items-center justify-center"
              onClick={() => handleSelect(video)}
            >
              <VideoIcon className="w-20 h-20" />
              <span className="text-sm">{video.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

