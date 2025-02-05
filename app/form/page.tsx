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

const formSchema = z.object({
  senderName: z.string().min(1, "Your name is required"),
  recipientName: z.string().min(1, "Valentine's name is required"),
  message: z.string().min(1, "Message is required"),
  image1: z.custom<File>().optional(),
  caption1: z.string().optional(),
  image2: z.custom<File>().optional(),
  caption2: z.string().optional(),
}).refine((data) => data.image1 || data.image2, {
  message: "At least one image is required",
  path: ["image1"],
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    // Handle form submission
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
                      const file = e.target.files?.[0] || null
                      onChange(file)
                      setPreview1(file ? URL.createObjectURL(file) : null)
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
                      const file = e.target.files?.[0] || null
                      onChange(file)
                      setPreview2(file ? URL.createObjectURL(file) : null)
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
          >
            Generate Website
          </Button>
        </form>
      </Form>
    </div>
  )
}
