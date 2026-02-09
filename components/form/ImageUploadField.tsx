"use client"

import { UseFormReturn } from "react-hook-form"
import Image from "next/image"
import { FormControl, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useImageFileHandler } from "@/hooks/useImageFileHandler"
import placeholder from "@/assets/placeholder2.jpg"

interface ImageUploadFieldProps {
  name: string
  label: string | React.ReactNode
  preview: string | null
  onPreviewChange: (url: string | null) => void
  form: UseFormReturn<any>
  onChange: (file: File | null) => void
}

export function ImageUploadField({
  name,
  label,
  preview,
  onPreviewChange,
  form,
  onChange,
}: ImageUploadFieldProps) {
  const { handleImageChange } = useImageFileHandler({
    form,
    fieldName: name,
    onPreviewChange,
    currentPreview: preview,
  })

  return (
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
                  await handleImageChange(file, onChange, e.target)
                }}
                className="hidden"
                id={name}
              />
              <label
                htmlFor={name}
                className="cursor-pointer w-full h-full flex items-center justify-center"
              >
                {preview ? (
                  <div className="relative w-full h-full">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        if (preview) {
                          URL.revokeObjectURL(preview)
                        }
                        onPreviewChange(null)
                        onChange(null)
                      }}
                      className="absolute top-1 right-1 bg-[#c7564a] text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#cc0000] transition-colors z-20"
                    >
                      ×
                    </button>
                    <img
                      src={preview}
                      alt={`Preview ${name}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-500"></div>
                )}
              </label>
            </div>
          </FormControl>
        </div>
        <FormMessage />
      </FormItem>
      <div className="flex items-center justify-center">
        <span className="text-gray-400 text-sm text-center">
          {label}
        </span>
      </div>
    </div>
  )
}
