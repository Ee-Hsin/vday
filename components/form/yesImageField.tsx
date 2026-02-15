"use client"

import { useEffect, useRef } from "react"
import { UseFormReturn } from "react-hook-form"
import Image from "next/image"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useImageFileHandler } from "@/hooks/useImageFileHandler"
import { cn } from "@/lib/utils"

import defaultImage from "@/assets/mofu yes.png"

interface YesImageFieldProps {
  imageName: string
  captionName: string
  captionPlaceholder?: string
  preview: string | null
  onPreviewChange: (url: string | null) => void
  form: UseFormReturn<any>
}

export function YesImageField({
  imageName,
  captionName,
  captionPlaceholder = "Write a caption...",
  preview,
  onPreviewChange,
  form,
}: YesImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const { handleImageChange } = useImageFileHandler({
    form,
    fieldName: imageName,
    onPreviewChange,
    currentPreview: preview,
  })

  const displayImage = preview || defaultImage
  const hasCustomImage = !!preview

  return (
    <>
      <div className="bg-white p-3 pt-0 rounded-lg shadow-md w-full relative">
        <FormField
          control={form.control}
          name={imageName}
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem className="bg-[#f0f0f0] w-full aspect-[2/1] rounded-md relative overflow-hidden group">
              <div className="w-full h-full relative">
                <Image
                  src={displayImage}
                  alt="Yes Image"
                  fill
                  className="object-cover"
                />

                <FormControl>
                  <div className="text-center w-full h-full relative z-10">
                    <Input
                      {...field}
                      ref={inputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={async (e) => {
                        const file = e.target.files?.[0] || null
                        await handleImageChange(file, onChange, e.target)
                      }}
                      className="hidden"
                      id={imageName}
                    />

                    <label
                      htmlFor={imageName}
                      className="cursor-pointer w-full h-full flex items-center justify-center hover:bg-black/10 transition-colors"
                    >
                      {hasCustomImage && (
                        <div className="absolute top-2 right-2 z-30">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()

                              if (preview) URL.revokeObjectURL(preview)
                              if (inputRef.current) inputRef.current.value = ""

                              onPreviewChange(null)
                              onChange(null)
                            }}
                            className="bg-destructive text-destructive-foreground w-8 h-8 rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-sm"
                          >
                            ×
                          </button>
                        </div>
                      )}

                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!hasCustomImage && (
                          <span className="bg-white/90 p-2 rounded-full shadow-sm text-xs font-semibold flex items-center gap-1 cursor-pointer">
                            Edit
                          </span>
                        )}
                      </div>
                    </label>
                  </div>
                </FormControl>
              </div>
              <FormMessage className="absolute bottom-2 left-2 right-2 z-20 bg-white/90 p-1 rounded text-xs text-center shadow-sm" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={captionName}
          render={({ field }) => (
            <FormItem className="absolute bottom-3 left-3 right-3 z-20 space-y-0">
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={captionPlaceholder}
                  className={cn(
                    "w-full min-h-[1rem] h-[2rem] resize-none border-0 focus-visible:ring-0 px-4 text-sm text-center bg-gray-50 shadow-sm",
                    "rounded-sm",
                    "hover:bg-gray-100 focus:bg-gray-100 transition-colors placeholder:text-muted-foreground/50",
                  )}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name={captionName}
        render={() => (
          <FormItem className="w-full">
            <FormMessage className="text-center text-xs font-medium text-destructive" />
          </FormItem>
        )}
      />
    </>
  )
}
