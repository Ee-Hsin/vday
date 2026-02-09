"use client"

import { Control } from "react-hook-form"
import Image, { StaticImageData } from "next/image"
import { FormControl, FormField, FormItem } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

interface CaptionFieldProps {
  name: string
  placeholder: string
  decorativeImage: StaticImageData
  imageAlt: string
  control: Control<any>
}

export function CaptionField({
  name,
  placeholder,
  decorativeImage,
  imageAlt,
  control,
}: CaptionFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="rounded-xl overflow-hidden flex flex-col h-full space-y-0">
          <div className="bg-[#edd9d9] flex justify-center items-center h-[100px] rounded-t-xl">
            <Image
              src={decorativeImage}
              alt={imageAlt}
              width={130}
              height={130}
              className="object-contain mt-4"
            />
          </div>
          <div className="bg-white p-4 border-8 border-[#fff4f4] rounded-b-xl flex-1">
            <FormControl>
              <Textarea
                placeholder={placeholder}
                {...field}
                className="bg-transparent border-none text-sm md:text-sm min-h-[4rem] max-h-[4rem] overflow-y-auto resize-none p-0"
              />
            </FormControl>
          </div>
        </FormItem>
      )}
    />
  )
}
