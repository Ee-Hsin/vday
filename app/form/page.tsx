"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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

const formSchema = z
  .object({
    senderName: z.string().min(1, "Your name is required"),
    recipientName: z.string().min(1, "Valentine's name is required"),
    message: z.string().min(1, "Message is required"),
    image1: z.custom<File>().optional(),
    caption1: z.string().optional(),
    image2: z.custom<File>().optional(),
    caption2: z.string().optional(),
  })
  .refine(
    (data) => (data.image1 ? (data.caption1 ?? "").trim().length > 0 : true),
    {
      message: "You forgot to write a caption for your first image!",
      path: ["caption1"],
    }
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
    }
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
    },
  })

  const [preview1, setPreview1] = useState<string | null>(null)
  const [preview2, setPreview2] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  async function uploadImage(file: File | undefined, path: string) {
    if (!file) return null
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    return await getDownloadURL(snapshot.ref)
  }

  // after submitting, I need to go to a success page with the link to the generated website
  // i will need to pass the docId to the success page as the generated will be /[docId]
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)

    console.log(values)
    try {
      const docRef = await addDoc(collection(db, "valentineMessages"), {
        senderName: values.senderName,
        recipientName: values.recipientName,
        message: values.message,
        caption1: values.caption1 || null,
        caption2: values.caption2 || null,
        timestamp: new Date(),
      })

      let image1URL = null
      let image2URL = null

      if (values.image1 && values.caption1) {
        image1URL = await uploadImage(
          values.image1,
          `valentines/${docRef.id}/image1-${Date.now()}`
        )
      }

      if (values.image2 && values.caption2) {
        image2URL = await uploadImage(
          values.image2,
          `valentines/${docRef.id}/image2-${Date.now()}`
        )
      }

      await updateDoc(docRef, {
        image1URL,
        image2URL,
      })

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
    <div className="container max-w-2xl mx-auto p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="senderName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
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
                <FormLabel>Valentine's Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your valentine's name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image 1 Upload */}
          <FormField
            control={form.control}
            name="image1"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Upload Your First Image! (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      onChange(file)
                      setPreview1(file ? URL.createObjectURL(file) : null)
                    }}
                  />
                </FormControl>
                {preview1 && (
                  <img
                    src={preview1}
                    alt="Preview 1"
                    className="mt-2 w-40 h-40 object-cover rounded-lg"
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="caption1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caption your First image! (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter a sweet caption!" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image 2 Upload */}
          <FormField
            control={form.control}
            name="image2"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Upload Your Second Image! (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      onChange(file)
                      setPreview2(file ? URL.createObjectURL(file) : null)
                    }}
                  />
                </FormControl>
                {preview2 && (
                  <img
                    src={preview2}
                    alt="Preview 2"
                    className="mt-2 w-40 h-40 object-cover rounded-lg"
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="caption2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caption your First image! (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Drop a cute caption!" {...field} />
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
                <FormLabel>Your Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your valentine message here..."
                    className="min-h-[120px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-[#d98f8f] hover:bg-[#c47f7f]"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Generate Website"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
