import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Video } from './VideoInference'
import { AudioLines, FileVideo, Film, VideoIcon } from 'lucide-react'

interface SampleVideoModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (video: Video) => void
}

const sampleVideos: (Video)[] = [
  { id: '1', name: 'Healthy 1', url: 'https://storage.googleapis.com/playground-sample-files/media/Parkinsons/381_healthy.wav' },
  { id: '2', name: 'Healthy 2', url: 'https://storage.googleapis.com/playground-sample-files/media/Parkinsons/384_healthy.wav' },
  { id: '3', name: 'Parkinsons 1', url: 'https://storage.googleapis.com/playground-sample-files/media/Parkinsons/427_parkinsons.wav' },
  { id: '4', name: 'Parkinsons 2', url: 'https://storage.googleapis.com/playground-sample-files/media/Parkinsons/436_parkinsons.wav' },
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
          <DialogTitle>Select a Sample Audio</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {sampleVideos.map((video) => (
            <Button
              key={video.id}
              variant="outline"
              className="h-auto p-4 py-7 flex flex-col items-center justify-center"
              onClick={() => handleSelect(video)}
            >
              <AudioLines className="w-20 h-20" />
              <span className="text-sm">{video.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

