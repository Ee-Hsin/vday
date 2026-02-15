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
import ClickHeartEffect from "@/components/ClickHeartEffect"
import HeartBackground from "@/components/HeartBackground"
import { logEvent } from "firebase/analytics"
import { analytics } from "@/lib/firebase"
import { valentineFormSchema } from "@/schemas/valentineSchema"
import { compressAndUploadImages } from "@/lib/uploadUtils"
import { stamps, themes } from "@/lib/constants"
import ExampleModal from "@/components/ExampleModal"
import { ValentineProposalProps } from "@/lib/types"
import { TextInputSection } from "@/components/form/TextInputSection"
import { StampSelector } from "@/components/form/StampSelector"
import HomeButton from "@/components/HomeButton"
import { UnifiedImageField } from "@/components/form/unifiedImageField"
import { YesImageField } from "../../components/form/yesImageField"

export default function ValentineForm() {
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)

  const [imagePreview1, setImagePreview1] = useState<string | null>(null)
  const [imagePreview2, setImagePreview2] = useState<string | null>(null)
  const [yesImagePreview, setYesImagePreview] = useState<string | null>(null)

  const previewsRef = useRef({ imagePreview1, imagePreview2, yesImagePreview })

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
      proposalMessage: "Will you be my valentine?",
      selectedStamp: "",
      selectedTheme: "",
      caption1: "",
      caption2: "",
      message: "",
    },
  })

  useEffect(() => {
    previewsRef.current = { imagePreview1, imagePreview2, yesImagePreview }
  }, [imagePreview1, imagePreview2, yesImagePreview])

  // ensure cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewsRef.current.imagePreview1) {
        URL.revokeObjectURL(previewsRef.current.imagePreview1)
      }
      if (previewsRef.current.imagePreview2) {
        URL.revokeObjectURL(previewsRef.current.imagePreview2)
      }
      if (previewsRef.current.yesImagePreview) {
        URL.revokeObjectURL(previewsRef.current.yesImagePreview)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handlePreview() {
    const isValid = await form.trigger()
    if (!isValid) {
      if (analytics) {
        logEvent(analytics, "preview_clicked", { button_name: "preview" })
      }

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

    let imgUrl1 = imagePreview1
    let imgUrl2 = imagePreview2
    if (!imgUrl1 && values.image1) {
      imgUrl1 = URL.createObjectURL(values.image1)
      setImagePreview1(imgUrl1)
    }
    if (!imgUrl2 && values.image2) {
      imgUrl2 = URL.createObjectURL(values.image2)
      setImagePreview2(imgUrl2)
    }

    setPreviewData({
      imgUrl: imgUrl1 || "",
      imgCaption: values.caption1 || "",
      imgUrl2: imgUrl2 || "",
      imgCaption2: values.caption2 || "",
      valentineName: values.recipientName || "",
      senderName: values.senderName || "",
      message: values.message || "",
      proposalMessage: values.proposalMessage || "",
      selectedStamp: values.selectedStamp || "stamp1",
      selectedTheme: values.selectedTheme || "pinkTheme",
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

      const [image1URL, image2URL, successImageURL] =
        await compressAndUploadImages(
          [values.image1, values.image2, values.successImage],
          "valentines",
          values.senderName,
          compressionOptions,
        )

      const docRef = await addDoc(collection(db, "valentineMessages"), {
        senderName: values.senderName,
        recipientName: values.recipientName,
        proposalMessage: values.proposalMessage,
        successImageURL: successImageURL,
        message: values.message,
        caption1: values.caption1 || null,
        caption2: values.caption2 || null,
        selectedStamp: values.selectedStamp,
        selectedTheme: values.selectedTheme,
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
      setImagePreview1(null)
      setImagePreview2(null)
      setYesImagePreview(null)

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
      className={`min-h-svh flex items-center justify-center bg-[#ffeded] font-poppins`}
    >
      <HeartBackground />
      <ClickHeartEffect />
      <HomeButton />
      <div className="container mx-auto px-4 max-w-4xl pt-20 md:pt-0 z-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-[#E5A4A4] rounded-xl p-6 space-y-4">
                <TextInputSection control={form.control} />
                <StampSelector
                  formFieldName="selectedTheme"
                  selectedStamp={selectedTheme}
                  onStampSelect={(themeId) => {
                    setSelectedTheme(themeId)
                    form.setValue("selectedTheme", themeId)
                  }}
                  control={form.control}
                  stamps={themes}
                />
                <StampSelector
                  formFieldName="selectedStamp"
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
                  <div className="flex flex-row gap-4">
                    <UnifiedImageField
                      form={form}
                      imageName="image1"
                      captionName="caption1"
                      captionPlaceholder="1st Caption"
                      preview={imagePreview1}
                      onPreviewChange={setImagePreview1}
                    />
                    <UnifiedImageField
                      form={form}
                      imageName="image2"
                      captionName="caption2"
                      captionPlaceholder="2nd Caption"
                      preview={imagePreview2}
                      onPreviewChange={setImagePreview2}
                    />
                  </div>
                  <h3
                    className={`text-white text-xl font-semibold font-fredoka`}
                  >
                    After they click Yes...
                  </h3>
                  <YesImageField
                    form={form}
                    imageName="successImage"
                    captionName="message"
                    captionPlaceholder="Message for after they say yes!"
                    preview={yesImagePreview}
                    onPreviewChange={setYesImagePreview}
                  />
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
