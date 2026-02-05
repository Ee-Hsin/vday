"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { db, storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { collection, addDoc, updateDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MdHome } from "react-icons/md"
import { Fredoka, Poppins } from "next/font/google"
import mofuFlower from "../../assets/mofu flower crop.png"
import mofuHeart from "../../assets/mofu heart crop.png"
import imageCompression from "browser-image-compression"
import stamp1 from "../../assets/stamp 1.png"
import stamp2 from "../../assets/stamp 2.png"
import stamp3 from "../../assets/stamp 3.png"
import stampFrame from "../../assets/square stamp frame.png"
import placeholder from "../../assets/placeholder2.jpg"
import ClickHeartEffect from "@/components/ClickHeartEffect"
import HeartBackground from "@/components/HeartBackground"
import heic2any from "heic2any"
import { logEvent } from "firebase/analytics"
import { analytics } from "@/lib/firebase"

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
})

const formSchema = z
  .object({
    senderName: z.string().min(1, "Your name is required"),
    recipientName: z.string().min(1, "Valentine's name is required"),
    message: z.string().min(1, "Message is required"),
    image1: z.custom<File>().optional(),
    caption1: z.string().optional(),
    image2: z.custom<File>().optional(),
    caption2: z.string().optional(),
    selectedStamp: z.string().min(1, "Please select a stamp"),
  })
  .refine(
    (data) => (data.image1 ? (data.caption1 ?? "").trim().length > 0 : true),
    {
      message: "You forgot to write a caption for your first image!",
      path: ["caption1"],
    },
  )
  .refine((data) => (data.caption1 ? !!data.image1 : true), {
    message:
      "You wrote a caption for your first image but forgot to upload the image!",
    path: ["image1"],
  })
  .refine(
    (data) => (data.image2 ? (data.caption2 ?? "").trim().length > 0 : true),
    {
      message: "You forgot to write a caption for your second image!",
      path: ["caption2"],
    },
  )
  .refine((data) => (data.caption2 ? !!data.image2 : true), {
    message:
      "You wrote a caption for your second image but forgot to upload the image!",
    path: ["image2"],
  })

export default function ValentineForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      senderName: "",
      recipientName: "",
      message: "",
      caption1: "",
      caption2: "",
      selectedStamp: "",
    },
  })

  const [selectedStamp, setSelectedStamp] = useState<string | null>(null)
  const [preview1, setPreview1] = useState<string | null>(null)
  const [preview2, setPreview2] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const stamps = [
    { id: "stamp1", src: stamp1, alt: "Cats with cake" },
    { id: "stamp2", src: stamp2, alt: "Two cats with heart" },
    { id: "stamp3", src: stamp3, alt: "Penguin cats" },
  ]

  const router = useRouter()

  async function uploadImage(file: File | undefined, path: string) {
    if (!file) return null
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    return await getDownloadURL(snapshot.ref)
  }

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
      let fileToCompress: File = imageFile

      // Compress the image
      const compressedImage = await imageCompression(
        fileToCompress,
        compressionOptions,
      )
      return compressedImage
    } catch (error) {
      console.error("Image processing failed:", error)
      return null
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)

    if (analytics) {
      logEvent(analytics, "form_submitted_start", { button_name: "submit" })
    }

    console.log(values)
    try {
      let image1URL = null
      let image2URL = null

      const compressionOptions = {
        maxSizeMB: 0.5, // Target max size
        maxWidthOrHeight: 800, // Max width/height
        useWebWorker: true, // Improve performance
      }

      if (values.image1 && values.caption1) {
        const compressedImage = await handleImageCompression(
          values.image1,
          compressionOptions,
        )

        if (compressedImage) {
          image1URL = await uploadImage(
            compressedImage,
            `valentines/${values.senderName + Date.now()}/image1-${Date.now()}`,
          )
        }
      }

      if (values.image2 && values.caption2) {
        const compressedImage = await handleImageCompression(
          values.image2,
          compressionOptions,
        )

        if (compressedImage) {
          image2URL = await uploadImage(
            compressedImage,
            `valentines/${values.senderName + Date.now()}/image2-${Date.now()}`,
          )
        }
      }

      const docRef = await addDoc(collection(db, "valentineMessages"), {
        senderName: values.senderName,
        recipientName: values.recipientName,
        message: values.message,
        caption1: values.caption1 || null,
        caption2: values.caption2 || null,
        selectedStamp: values.selectedStamp,
        image1URL,
        image2URL,
        timestamp: new Date(),
      })

      if (analytics) {
        console.log("form_submitted_successful", { button_name: "submit" })
        logEvent(analytics, "form_submitted_successful", {
          button_name: "submit",
        })
      }

      form.reset()
      setPreview1(null)
      setPreview2(null)

      router.push(`/success?id=${docRef.id}`)
    } catch (error) {
      console.error("Error saving message:", error)
      alert("Error saving message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`min-h-svh flex items-center justify-center bg-[#ffeded] ${poppins.className}`}
    >
      <HeartBackground />
      <ClickHeartEffect />
      <Link
        href="/"
        className="absolute top-5 left-5 z-20 text-[#d98f8f] hover:text-[#b35151] transition-colors"
      >
        <MdHome className="w-[4svh] h-[4svh] md:w-[40px] md:h-[40px]" />
      </Link>
      <div className="container mx-auto px-4 max-w-4xl pt-20 md:pt-0 z-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* First Container - Names and Message */}
              <div className="flex-1 bg-[#E5A4A4] rounded-xl p-6 space-y-4">
                <FormField
                  control={form.control}
                  name="senderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Your Name"
                          {...field}
                          className="bg-white rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recipientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Valentine's Name"
                          {...field}
                          className="bg-white rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Message"
                          className="min-h-[200px] bg-white rounded-xl resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Stamp Selection */}
                <div className="space-y-2">
                  <h3
                    className={`text-white text-xl font-semibold ${fredoka.className}`}
                  >
                    Select Stamp
                  </h3>
                  <FormField
                    control={form.control}
                    name="selectedStamp"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex gap-4 justify-center">
                            {stamps.map((stamp) => (
                              <button
                                key={stamp.id}
                                type="button"
                                onClick={() => {
                                  setSelectedStamp(stamp.id)
                                  form.setValue("selectedStamp", stamp.id)
                                }}
                                // We'll need to add the selectedStamp photo and switch to that instead
                                className={`
                                  w-24 h-24 rounded-lg p-1 transition-all relative
                                  ${
                                    selectedStamp === stamp.id
                                      ? "bg-white"
                                      : "bg-[#F8E3E3] hover:drop-shadow-lg"
                                  }
                                `}
                              >
                                <Image
                                  src={stampFrame}
                                  alt="Stamp Frame"
                                  className={`
                                      w-full h-full object-contain absolute top-0 left-0 scale-110
                                      ${
                                        selectedStamp === stamp.id
                                          ? "brightness-[90%] saturate-[60%] contrast-[120%] invert-[15%] hue-rotate-[50deg]"
                                          : ""
                                      }
                                    `}
                                />

                                <Image
                                  src={stamp.src}
                                  alt={stamp.alt}
                                  className="w-full h-full object-contain relative z-10"
                                />
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage className="text-center text-[#ff0000]" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Second Container - Photos and Captions */}
              <div className="flex-1 bg-[#E5A4A4] rounded-xl p-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="image1"
                    render={({ field: { onChange, ...field } }) => (
                      <div className="bg-white p-3 pb-0 rounded-lg shadow-md w-full h-full grid grid-rows-[auto_1fr_auto] gap-2">
                        {" "}
                        {/* Polaroid frame */}
                        <FormItem className="bg-[#D9D9D9] w-full aspect-square rounded-md relative overflow-hidden">
                          <div className="w-full h-full aspect-square">
                            <Image
                              src={placeholder}
                              alt="Upload Background"
                              fill
                              className="object-cover"
                            />
                            <FormControl>
                              <div className="text-center w-full h-full relative z-10">
                                <Input
                                  type="file"
                                  accept="image/jpeg,image/png,image/jpg"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0] || null
                                    if (!file) return

                                    let previewUrl = null

                                    // Check file type
                                    const validTypes = [
                                      "image/jpeg",
                                      "image/png",
                                      "image/jpg",
                                    ]
                                    if (!validTypes.includes(file.type)) {
                                      form.setError("image1", {
                                        type: "manual",
                                        message:
                                          "File type not supported. Please upload PNG or JPG only.",
                                      })
                                      e.target.value = "" // Reset input
                                      return
                                    }

                                    // Clear error if file type is valid
                                    form.clearErrors("image1")

                                    if (
                                      file.type === "image/heic" ||
                                      file.name
                                        .toLowerCase()
                                        .endsWith(".heic") ||
                                      file.type === "image/heif" ||
                                      file.name.toLowerCase().endsWith(".heif")
                                    ) {
                                      try {
                                        // Convert HEIC to JPEG
                                        const blob = await heic2any({
                                          blob: file,
                                          toType: "image/jpeg",
                                        })
                                        const convertedFile = new File(
                                          [blob as Blob],
                                          file.name.replace(
                                            /\.(heic|HEIC|heif|HEIF)$/,
                                            ".jpg",
                                          ),
                                          {
                                            type: "image/jpeg",
                                          },
                                        )

                                        previewUrl =
                                          URL.createObjectURL(convertedFile)
                                        // onChange(file) // Pass the converted file instead of original
                                        // setPreview1(previewUrl) // or setPreview2 for second image
                                      } catch (error) {
                                        console.error(
                                          "HEIC conversion failed:",
                                          error,
                                        )
                                      }
                                    } else {
                                      previewUrl = URL.createObjectURL(file)
                                    }

                                    onChange(file)
                                    setPreview1(previewUrl)
                                  }}
                                  className="hidden"
                                  id="image1"
                                />
                                <label
                                  htmlFor="image1"
                                  className="cursor-pointer w-full h-full flex items-center justify-center"
                                >
                                  {preview1 ? (
                                    <div className="relative w-full h-full">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          setPreview1(null)
                                          onChange(null)
                                        }}
                                        className="absolute top-0 right-1 bg-[#c7564a] text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#cc0000] transition-colors z-20"
                                      >
                                        ×
                                      </button>
                                      <img
                                        src={preview1}
                                        alt="Preview 1"
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center h-40 text-gray-500">
                                      {/* Photo 1 <br/> Upload */}
                                    </div>
                                  )}
                                </label>
                              </div>
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                        <div className="flex items-center justify-center">
                          <span className="text-gray-400 text-sm text-center">
                            Photo 1 <br className="md:hidden" /> Upload
                          </span>
                        </div>
                      </div>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="caption1"
                    render={({ field }) => (
                      <FormItem className="rounded-xl overflow-hidden flex flex-col h-full space-y-0">
                        <div className="bg-[#edd9d9] flex justify-center items-center h-[100px] rounded-t-xl">
                          <Image
                            src={mofuFlower}
                            alt="Mofu Flower"
                            width={130}
                            height={130}
                            className="object-contain mt-4"
                          />
                        </div>
                        <div className="bg-white p-4 border-8 border-[#fff4f4] rounded-b-xl flex-1">
                          <FormControl>
                            <Textarea
                              placeholder="Photo 1 Caption"
                              {...field}
                              className="bg-transparent border-none text-sm md:text-sm min-h-[4rem] max-h-[4rem] overflow-y-auto resize-none p-0"
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="mt-2" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="caption2"
                    render={({ field }) => (
                      <FormItem className="rounded-xl overflow-hidden flex flex-col space-y-0">
                        <div className="bg-[#edd9d9] flex justify-center items-center h-[100px] rounded-t-xl">
                          <Image
                            src={mofuHeart}
                            alt="Mofu Heart"
                            width={130}
                            height={130}
                            className="object-cover mt-4"
                          />
                        </div>
                        <div className="bg-white p-4 border-8 border-[#fff4f4] rounded-b-xl flex-1">
                          <FormControl>
                            <Textarea
                              placeholder="Photo 2 Caption"
                              {...field}
                              className="bg-transparent border-none text-sm min-h-[4rem] max-h-[4rem] overflow-y-auto resize-none p-0"
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="mt-2" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image2"
                    render={({ field: { onChange, ...field } }) => (
                      <div className="bg-white p-3 pb-0 rounded-lg shadow-md w-full h-full grid grid-rows-[auto_1fr_auto] gap-2">
                        <FormItem className="bg-[#D9D9D9] w-full aspect-square rounded-md relative overflow-hidden">
                          <div className="w-full h-full aspect-square">
                            <Image
                              src={placeholder}
                              alt="Upload Background"
                              fill
                              className="object-cover"
                            />
                            <FormControl>
                              <div className="text-center w-full h-full relative z-10">
                                <Input
                                  type="file"
                                  accept="image/jpeg,image/png,image/jpg"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0] || null
                                    if (!file) return

                                    let previewUrl = null

                                    // Check file type
                                    const validTypes = [
                                      "image/jpeg",
                                      "image/png",
                                      "image/jpg",
                                    ]
                                    if (!validTypes.includes(file.type)) {
                                      form.setError("image2", {
                                        type: "manual",
                                        message:
                                          "File type not supported. Please upload PNG or JPG only.",
                                      })
                                      e.target.value = "" // Reset input
                                      return
                                    }

                                    // Clear error if file type is valid
                                    form.clearErrors("image2")

                                    if (
                                      file.type === "image/heic" ||
                                      file.name
                                        .toLowerCase()
                                        .endsWith(".heic") ||
                                      file.type === "image/heif" ||
                                      file.name.toLowerCase().endsWith(".heif")
                                    ) {
                                      try {
                                        // Convert HEIC to JPEG
                                        const blob = await heic2any({
                                          blob: file,
                                          toType: "image/jpeg",
                                        })
                                        const convertedFile = new File(
                                          [blob as Blob],
                                          file.name.replace(
                                            /\.(heic|HEIC|heif|HEIF)$/,
                                            ".jpg",
                                          ),
                                          {
                                            type: "image/jpeg",
                                          },
                                        )

                                        previewUrl =
                                          URL.createObjectURL(convertedFile)
                                        // onChange(convertedFile);
                                        // setPreview2(previewUrl);
                                      } catch (error) {
                                        console.error(
                                          "HEIC conversion failed:",
                                          error,
                                        )
                                      }
                                    } else {
                                      previewUrl = URL.createObjectURL(file)
                                    }

                                    onChange(file)
                                    setPreview2(previewUrl)
                                  }}
                                  className="hidden"
                                  id="image2"
                                />
                                <label
                                  htmlFor="image2"
                                  className="cursor-pointer w-full h-full flex items-center justify-center"
                                >
                                  {preview2 ? (
                                    <div className="relative w-full h-full aspect-square">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          setPreview2(null)
                                          onChange(null)
                                        }}
                                        className="absolute top-1 right-1 bg-[#c7564a] text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#cc0000] transition-colors z-20"
                                      >
                                        ×
                                      </button>
                                      <img
                                        src={preview2}
                                        alt="Preview 2"
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center h-40 text-gray-500">
                                      {/* Photo 2 <br/> Upload */}
                                    </div>
                                  )}
                                </label>
                              </div>
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                        <div className="flex items-center justify-center">
                          <span className="text-gray-400 text-sm text-center">
                            Photo 2 <br className="md:hidden" /> Upload
                          </span>
                        </div>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center pb-6 md:pb-0">
              <Button
                type="submit"
                className={`bg-[#E5A4A4] hover:bg-[#d98f8f] text-white text-xl px-8 py-2 rounded-3xl h-[60px]  ${fredoka.className}`}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Generate Website"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
