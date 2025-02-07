"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MdHome } from "react-icons/md";
import { Fredoka, Poppins } from "next/font/google";
import mofuFlower from "../../assets/mofu flower final.png"
import mofuHeart from "../../assets/mofu heart final.png"
import imageCompression from "browser-image-compression";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
});

const formSchema = z
  .object({
    senderName: z.string().min(1, "Your name is required"),
    recipientName: z.string().min(1, "Valentine's name is required"),
    message: z.string().min(1, "Message is required"),
    image1: z.custom<File>().optional(),
    caption1: z.string().optional(),
    image2: z.custom<File>().optional(),
    caption2: z.string().optional(),
    selectedStamp: z.string().min(1, "Please select a stamp")
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
  });

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
  });

  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const [preview1, setPreview1] = useState<string | null>(null);
  const [preview2, setPreview2] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const stamps = [
    { id: "stamp1", src: "/path-to-stamp1.png", alt: "Cats with cake" },
    { id: "stamp2", src: "/path-to-stamp2.png", alt: "Two cats with heart" },
    { id: "stamp3", src: "/path-to-stamp3.png", alt: "Penguin cats" },
  ];

  const router = useRouter();

  async function uploadImage(file: File | undefined, path: string) {
    if (!file) return null;
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    console.log(values);
    try {
      const docRef = await addDoc(collection(db, "valentineMessages"), {
        senderName: values.senderName,
        recipientName: values.recipientName,
        message: values.message,
        caption1: values.caption1 || null,
        caption2: values.caption2 || null,
        selectedStamp: values.selectedStamp,
        timestamp: new Date(),
      });

      let image1URL = null
      let image2URL = null

      const compressionOptions = {
        maxSizeMB: 0.5, // Target max size
        maxWidthOrHeight: 800, // Max width/height
        useWebWorker: true, // Improve performance
      };

      if (values.image1 && values.caption1) {
        const compressedImage = await imageCompression(values.image1, compressionOptions)

        image1URL = await uploadImage(
          compressedImage,
          `valentines/${docRef.id}/image1-${Date.now()}`
        );
      }

      if (values.image2 && values.caption2) {
        const compressedImage = await imageCompression(values.image2, compressionOptions)

        image2URL = await uploadImage(
          compressedImage,
          `valentines/${docRef.id}/image2-${Date.now()}`
        );
      }

      await updateDoc(docRef, {
        image1URL,
        image2URL,
      });

      form.reset();
      setPreview1(null);
      setPreview2(null);

      router.push(`/success?id=${docRef.id}`);
    } catch (error) {
      console.error("Error saving message:", error);
      alert("Error saving message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-[#ffeded] ${poppins.className}`}
    >
      <Link
        href="/"
        className="absolute top-5 left-5 z-20 text-[#d98f8f] hover:text-[#b35151] transition-colors"
      >
        <MdHome className="w-[4vh] h-[4vh] md:w-[40px] md:h-[40px]" />
      </Link>
      <div className="container mx-auto px-4 max-w-7xl pt-20 md:pt-0">
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
                  <h3 className={`text-white text-xl ${fredoka.className}`}>
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
                                  setSelectedStamp(stamp.id);
                                  form.setValue("selectedStamp", stamp.id);
                                }}
                                className={`
                                  w-24 h-24 rounded-lg p-1 transition-all
                                  ${
                                    selectedStamp === stamp.id
                                      ? "bg-white ring-2 ring-[#b35151]"
                                      : "bg-[#F8E3E3] hover:bg-white"
                                  }
                                `}
                              >
                                <img
                                  src={stamp.src}
                                  alt={stamp.alt}
                                  className="w-full h-full object-contain"
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
                      <FormItem className="bg-[#D9D9D9] rounded-lg p-4">
                        <FormControl>
                          <div className="text-center">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                onChange(file);
                                setPreview1(
                                  file ? URL.createObjectURL(file) : null
                                );
                              }}
                              className="hidden"
                              id="image1"
                            />
                            <label
                              htmlFor="image1"
                              className="cursor-pointer block w-full h-full"
                            >
                              {preview1 ? (
                                <img
                                  src={preview1}
                                  alt="Preview 1"
                                  className="w-full h-40 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-40 text-gray-500">
                                  Upload Photo 1
                                </div>
                              )}
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="caption1"
                    render={({ field }) => (
                      <FormItem className="rounded-xl overflow-hidden flex flex-col space-y-0">
                        <div className="bg-[#edd9d9] flex justify-center items-center h-[120px] rounded-t-xl">
                          <Image
                            src={mofuFlower}
                            alt="Mofu Flower"
                            width={130}
                            height={130}
                            className="object-contain mt-4"
                          />
                        </div>
                        <div className="bg-white p-4 border-8 border-[#fff4f4] rounded-b-xl">
                          <FormControl>
                            <Input
                              placeholder="Photo 1 Caption"
                              {...field}
                              className="bg-transparent border-none"
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="mt-2"/>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="caption2"
                    render={({ field }) => (
                      <FormItem className="rounded-xl overflow-hidden flex flex-col space-y-0">
                        <div className="bg-[#edd9d9] flex justify-center items-center h-[120px] rounded-t-xl">
                          <Image
                            src={mofuHeart}
                            alt="Mofu Heart"
                            width={100}
                            height={100}
                            className="object-contain scale-x-[-1] mt-5"
                          />
                        </div>
                        <div className="bg-white p-4 border-8 border-[#fff4f4] rounded-b-xl">
                          <FormControl>
                            <Input
                              placeholder="Photo 2 Caption"
                              {...field}
                              className="bg-transparent border-none"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image2"
                    render={({ field: { onChange, ...field } }) => (
                      <FormItem className="bg-[#D9D9D9] rounded-lg p-4">
                        <FormControl>
                          <div className="text-center">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                onChange(file);
                                setPreview2(
                                  file ? URL.createObjectURL(file) : null
                                );
                              }}
                              className="hidden"
                              id="image2"
                            />
                            <label
                              htmlFor="image2"
                              className="cursor-pointer block w-full h-full"
                            >
                              {preview2 ? (
                                <img
                                  src={preview2}
                                  alt="Preview 2"
                                  className="w-full h-40 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-40 text-gray-500">
                                  Upload Photo 2
                                </div>
                              )}
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
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
  );
}