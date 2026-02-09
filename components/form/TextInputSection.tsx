"use client"

import { Control } from "react-hook-form"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface TextInputSectionProps {
  control: Control<any>
}

export function TextInputSection({ control }: TextInputSectionProps) {
  return (
    <>
      <FormField
        control={control}
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
        control={control}
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
        control={control}
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
    </>
  )
}
