import VideoInference from '@/components/inference/VideoInference'

export default function InferencePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-7 mt-16 text-center">Depressed vs Non-depressed Mood</h1>
      <VideoInference />
    </div>
  )
}