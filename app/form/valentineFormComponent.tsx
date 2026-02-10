"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormField } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import mofuFlower from "../../assets/mofu flower crop.png"
import mofuHeart from "../../assets/mofu heart crop.png"
import ClickHeartEffect from "@/components/ClickHeartEffect"
import HeartBackground from "@/components/HeartBackground"
import { logEvent } from "firebase/analytics"
import { analytics } from "@/lib/firebase"
import { valentineFormSchema } from "@/schemas/valentineSchema"
import { compressAndUploadImages } from "@/lib/uploadUtils"
import { stamps } from "@/lib/constants"
import ExampleModal from "@/components/ExampleModal"
import { ValentineProposalProps } from "@/lib/types"
import { TextInputSection } from "@/components/form/TextInputSection"
import { StampSelector } from "@/components/form/StampSelector"
import { ImageUploadField } from "@/components/form/ImageUploadField"
import { CaptionField } from "@/components/form/CaptionField"
import HomeButton from "@/components/HomeButton"

export default function ValentineForm() {
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null)

  const [preview1, setPreview1] = useState<string | null>(null)
  const [preview2, setPreview2] = useState<string | null>(null)

  const previewsRef = useRef({ preview1, preview2 })

  const [loading, setLoading] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<
    Partial<Omit<ValentineProposalProps, "showClickHeartEffect">> | undefined
  >(undefined)

  const router = useRouter()

  const form = useForm<z.infer<typeof valentineFormSchema>>({
    resolver: zodResolver(valentineFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      senderName: "",
      recipientName: "",
      message: "",
      caption1: "",
      caption2: "",
      selectedStamp: "",
    },
  })

  useEffect(() => {
    previewsRef.current = { preview1, preview2 }
  }, [preview1, preview2])

  // ensure cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewsRef.current.preview1) {
        URL.revokeObjectURL(previewsRef.current.preview1)
      }
      if (previewsRef.current.preview2) {
        URL.revokeObjectURL(previewsRef.current.preview2)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handlePreview() {
    const isValid = await form.trigger()
    if (!isValid) {
      // Scroll to first error field, similar to form.handleSubmit behavior
      const firstErrorField = Object.keys(form.formState.errors)[0]
      if (firstErrorField) {
        // Try multiple selectors to find the error field
        const selectors = [
          `[name="${firstErrorField}"]`,
          `[id="${firstErrorField}"]`,
          `input[name="${firstErrorField}"]`,
          `textarea[name="${firstErrorField}"]`,
        ]

        let errorElement: Element | null = null
        for (const selector of selectors) {
          errorElement = document.querySelector(selector)
          if (errorElement) break
        }

        // If we found an element, scroll to it
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" })
          // Focus the input if it's focusable
          if (errorElement instanceof HTMLElement && "focus" in errorElement) {
            setTimeout(() => {
              ;(errorElement as HTMLElement).focus()
            }, 100)
          }
        }
      }
      return
    }

    const values = form.getValues()

    let imgUrl1 = preview1
    let imgUrl2 = preview2
    if (!imgUrl1 && values.image1) {
      imgUrl1 = URL.createObjectURL(values.image1)
      setPreview1(imgUrl1)
    }
    if (!imgUrl2 && values.image2) {
      imgUrl2 = URL.createObjectURL(values.image2)
      setPreview2(imgUrl2)
    }

    setPreviewData({
      imgUrl: imgUrl1 || "",
      imgCaption: values.caption1 || "",
      imgUrl2: imgUrl2 || "",
      imgCaption2: values.caption2 || "",
      valentineName: values.recipientName || "",
      senderName: values.senderName || "",
      message: values.message || "",
      selectedStamp: values.selectedStamp || "stamp1",
    })

    setIsPreviewOpen(true)
  }

  async function onSubmit(values: z.infer<typeof valentineFormSchema>) {
    setLoading(true)

    if (analytics) {
      logEvent(analytics, "form_submitted_start", { button_name: "submit" })
    }

    try {
      const compressionOptions = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      }

      const [image1URL, image2URL] = await compressAndUploadImages(
        [values.image1, values.image2],
        "valentines",
        values.senderName,
        compressionOptions,
      )

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

  const FormContent = (
    <div className="container mx-auto px-4 max-w-4xl pt-20 md:pt-0 z-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-[#E5A4A4] rounded-xl p-6 space-y-4">
              <TextInputSection control={form.control} />
              <StampSelector
                selectedStamp={selectedStamp}
                onStampSelect={(stampId) => {
                  setSelectedStamp(stampId)
                  form.setValue("selectedStamp", stampId)
                }}
                control={form.control}
                stamps={stamps}
              />
            </div>

            <div className="flex-1 bg-[#E5A4A4] rounded-xl p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="image1"
                    render={({ field: { onChange, ...field } }) => (
                      <ImageUploadField
                        name="image1"
                        label={
                          <>
                            Photo 1 <br className="md:hidden" /> Upload
                          </>
                        }
                        preview={preview1}
                        onPreviewChange={setPreview1}
                        form={form}
                        onChange={onChange}
                      />
                    )}
                  />

                  <CaptionField
                    name="caption1"
                    placeholder="Photo 1 Caption"
                    decorativeImage={mofuFlower}
                    imageAlt="Mofu Flower"
                    control={form.control}
                  />
                </div>
                {form.formState.errors.caption1 && (
                  <p className="text-sm font-medium text-destructive mt-1">
                    {form.formState.errors.caption1.message}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <CaptionField
                    name="caption2"
                    placeholder="Photo 2 Caption"
                    decorativeImage={mofuHeart}
                    imageAlt="Mofu Heart"
                    control={form.control}
                  />

                  <FormField
                    control={form.control}
                    name="image2"
                    render={({ field: { onChange, ...field } }) => (
                      <ImageUploadField
                        name="image2"
                        label={
                          <>
                            Photo 2 <br className="md:hidden" /> Upload
                          </>
                        }
                        preview={preview2}
                        onPreviewChange={setPreview2}
                        form={form}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>
                {form.formState.errors.caption2 && (
                  <p className="text-sm font-medium text-destructive mt-1">
                    {form.formState.errors.caption2.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-6 pb-6 md:pb-0">
            <Button
              type="button"
              onClick={handlePreview}
              className={`bg-[#E5A4A4] hover:bg-[#d98f8f] text-white text-xl py-2 rounded-3xl h-[60px] font-fredoka w-[150px]`}
              disabled={loading}
            >
              Preview
            </Button>
            <Button
              type="submit"
              className={`bg-[#E5A4A4] hover:bg-[#d98f8f] text-white text-xl px-8 py-2 rounded-3xl h-[60px] font-fredoka w-[150px]`}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Generate"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )

  return (
    <div
      className={`min-h-svh flex items-center justify-center bg-[#ffeded] font-poppins`}
    >
      <HeartBackground />
      <ClickHeartEffect />
      <HomeButton />
      {FormContent}
      <ExampleModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false)
          setPreviewData(undefined)
        }}
        url="https://www.valentineproposal.com/preview"
        isClickable={false}
        isPreviewMode={true}
        valentineData={previewData}
      />
    </div>
  )
}
