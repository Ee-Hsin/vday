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
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { db, storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { collection, addDoc } from "firebase/firestore"

const formSchema = z.object({
  senderName: z.string().min(1, "Your name is required"),
  recipientName: z.string().min(1, "Valentine's name is required"),
  message: z.string().min(1, "Message is required"),
  image1: z.custom<File>().optional(),
  caption1: z.string().optional(),
  image2: z.custom<File>().optional(),
  caption2: z.string().optional(),
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

  async function uploadImage(file: File | undefined, path: string) {
    if (!file) return null;
    const storageRef = ref(storage, `valentines/${path}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    
    console.log(values)
    try {
      // Upload images if present
      // const image1URL = await uploadImage(values.image1, `image1-${Date.now()}`);
      // const image2URL = await uploadImage(values.image2, `image2-${Date.now()}`);

      // Store data in Firestore
      await addDoc(collection(db, "valentineMessages"), {
        senderName: values.senderName,
        recipientName: values.recipientName,
        message: values.message,
        // image1URL,
        caption1: values.caption1,
        // image2URL,
        caption2: values.caption2,
        timestamp: new Date(),
      });

      alert("Message saved successfully!");
      form.reset();
      setPreview1(null);
      setPreview2(null);
    } catch (error) {
      console.error("Error saving message:", error);
      alert("Error saving message. Please try again.");
    } finally {
      setLoading(false);
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
                <FormLabel>Upload Image 1 (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      onChange(file);
                      setPreview1(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                </FormControl>
                {preview1 && (
                  <img src={preview1} alt="Preview 1" className="mt-2 w-40 h-40 object-cover rounded-lg" />
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
                <FormLabel>Caption for Image 1 (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter caption for Image 1" {...field} />
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
                <FormLabel>Upload Image 2 (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      onChange(file);
                      setPreview2(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                </FormControl>
                {preview2 && (
                  <img src={preview2} alt="Preview 2" className="mt-2 w-40 h-40 object-cover rounded-lg" />
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
                <FormLabel>Caption for Image 2 (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter caption for Image 2" {...field} />
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
