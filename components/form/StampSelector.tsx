"use client"

import { Control } from "react-hook-form"
import Image, { StaticImageData } from "next/image"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import stampFrame from "@/assets/square stamp frame.png"

interface StampOption {
  id: string
  src: StaticImageData
  alt: string
}

interface StampSelectorProps {
  selectedStamp: string | null
  onStampSelect: (stampId: string) => void
  control: Control<any>
  stamps: StampOption[]
}

export function StampSelector({
  selectedStamp,
  onStampSelect,
  control,
  stamps,
}: StampSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className={`text-white text-xl font-semibold font-fredoka`}>
        Select Stamp
      </h3>
      <FormField
        control={control}
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
                      onStampSelect(stamp.id)
                      field.onChange(stamp.id)
                    }}
                    className={`
                      w-24 h-24 rounded-lg p-1 transition-all relative
                      ${
                        selectedStamp === stamp.id
                          ? "bg-white"
                          : "bg-[#F8E3E3] hover:drop-shadow-lg"
                      }
                    `}
                  >
                    <Image
                      src={stampFrame}
                      alt="Stamp Frame"
                      className={`
                          w-full h-full object-contain absolute top-0 left-0 scale-110
                          ${
                            selectedStamp === stamp.id
                              ? "brightness-[90%] saturate-[60%] contrast-[120%] invert-[15%] hue-rotate-[50deg]"
                              : ""
                          }
                        `}
                    />

                    <Image
                      src={stamp.src}
                      alt={stamp.alt}
                      className="w-full h-full object-contain relative z-10"
                    />
                  </button>
                ))}
              </div>
            </FormControl>
            <FormMessage className="text-center" />
          </FormItem>
        )}
      />
    </div>
  )
}
