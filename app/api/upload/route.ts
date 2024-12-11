import { NextResponse } from 'next/server'
import { BlobServiceClient } from '@azure/storage-blob'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING!)
    const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME!)

    const blobName = `${Date.now()}-${file.name}`
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    await blockBlobClient.upload(buffer, buffer.length)

    const url = blockBlobClient.url

    return NextResponse.json({ success: true, url })
  } catch (error) {
    console.error('Error uploading to Azure:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}