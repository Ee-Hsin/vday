import imageCompression from "browser-image-compression"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"

interface CompressionOptions {
  maxSizeMB: number
  maxWidthOrHeight: number
  useWebWorker: boolean
}

async function handleImageCompression(
  imageFile: File,
  compressionOptions: CompressionOptions,
): Promise<File | null> {
  try {
    const compressedImage = await imageCompression(
      imageFile,
      compressionOptions,
    )
    return compressedImage
  } catch (error) {
    console.error("Image processing failed:", error)
    return null
  }
}

async function uploadImage(file: File | undefined, path: string) {
  if (!file) return null
  const storageRef = ref(storage, path)
  const snapshot = await uploadBytes(storageRef, file)
  return await getDownloadURL(snapshot.ref)
}

export async function compressAndUploadImages(
  images: Array<File | undefined>,
  basePath: string,
  identifier: string,
  compressionOptions: CompressionOptions,
): Promise<(string | null)[]> {
  const timestamp = Date.now()

  const uploadPromises = images.map(async (img, index) => {
    if (!img) return null

    const compressedImage = await handleImageCompression(
      img,
      compressionOptions,
    )

    if (!compressedImage) return null

    return await uploadImage(
      compressedImage,
      `${basePath}/${identifier + timestamp}/image${index + 1}-${timestamp}`,
    )
  })

  return await Promise.all(uploadPromises)
}
