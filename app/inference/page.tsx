import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, Mic } from 'lucide-react'

const inferenceModels = [
  {
    id: 'depression-video',
    title: 'Depression v Non-Depression',
    description: 'Analyze video input to detect signs of depression',
    type: 'video',
    icon: Video,
    url: "depression"
  },
  {
    id: 'parkinsons-voice',
    title: "Parkinson's v Non-Parkinson's",
    description: "Analyze voice input to detect signs of Parkinson's disease",
    type: 'voice',
    icon: Mic,
    url: "parkinsons"
  },
]

export default function InferenceModelsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Inference Models</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        {inferenceModels.map((model) => (
          <Card key={model.id}>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                {<model.icon className="mr-2 h-6 w-6" />}
                {model.title}
              </CardTitle>
              <CardDescription className='text-md'>{model.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/inference/${model.url}`}>
                <Button className="w-full">
                  Start Inference
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}