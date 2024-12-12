import { Video } from './VideoInference'
import { Button } from "@/components/ui/button"
import { Trash2 } from 'lucide-react'

interface VideoListProps {
  videos: Video[]
  onRemove: (id: string) => void
}

export default function VideoList({ videos, onRemove }: VideoListProps) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Selected Audio</h2>
      {videos.length === 0 ? (
        <p className="text-gray-500">No audios selected</p>
      ) : (
        <ul className="space-y-2">
          {videos.map((video) => (
            <li key={video.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <span className="truncate flex-1 mr-2">{video.name}</span>
              <Button
                onClick={() => onRemove(video.id)}
                variant="destructive"
                className='bg-red-700'
                size="icon"
              >
                <Trash2 className="h-4 w-4" color='white' />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}