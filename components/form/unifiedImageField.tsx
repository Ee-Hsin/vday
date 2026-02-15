"use client"

import { useRef } from "react"
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
import placeholder from "@/assets/placeholder2.jpg"
import { cn } from "@/lib/utils"

interface UnifiedImageFieldProps {
  imageName: string
  captionName: string
  captionPlaceholder?: string
  preview: string | null
  onPreviewChange: (url: string | null) => void
  form: UseFormReturn<any>
}

export function UnifiedImageField({
  imageName,
  captionName,
  captionPlaceholder = "Write a caption...",
  preview,
  onPreviewChange,
  form,
}: UnifiedImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const { handleImageChange } = useImageFileHandler({
    form,
    fieldName: imageName,
    onPreviewChange,
    currentPreview: preview,
  })

  return (
    <div className="bg-white p-3 rounded-lg shadow-md w-full h-full flex flex-col gap-2">
      <FormField
        control={form.control}
        name={imageName}
        render={({ field: { onChange, value, ...field } }) => (
          <FormItem className="bg-[#D9D9D9] w-full aspect-square rounded-md relative overflow-hidden group">
            <div className="w-full h-full aspect-square relative">
              <Image
                src={placeholder}
                alt="Upload Background"
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
                    className="cursor-pointer w-full h-full flex items-center justify-center hover:bg-black/5 transition-colors"
                  >
                    {preview ? (
                      <div className="relative w-full h-full">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            if (preview) URL.revokeObjectURL(preview)
                            if (inputRef.current) inputRef.current.value = ""
                            onPreviewChange(null)
                            onChange(null)
                          }}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground w-6 h-6 rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors z-30 shadow-sm"
                        >
                          ×
                        </button>
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full w-full text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-white/80 px-2 py-1 rounded text-xs font-semibold">
                          Click to Upload
                        </span>
                      </div>
                    )}
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
          <FormItem className="flex-1 min-h-[1.5rem]">
            <FormControl>
              <Textarea
                {...field}
                placeholder={captionPlaceholder}
                className={cn(
                  "w-full h-full min-h-[1.5rem] max-h-[2.5rem]  resize-none border-0 focus-visible:ring-0 p-2 text-sm text-center bg-transparent placeholder:text-muted-foreground/50",
                  "hover:bg-gray-50 focus:bg-gray-50 rounded-md transition-colors",
                )}
              />
            </FormControl>
            <FormMessage className="text-xs text-center" />
          </FormItem>
        )}
      />
    </div>
  )
}
