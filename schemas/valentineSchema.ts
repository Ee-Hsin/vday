import * as z from "zod"

export const valentineFormSchema = z
  .object({
    senderName: z.string().min(1, "Your name is required"),
    recipientName: z.string().min(1, "Valentine's name is required"),
    proposalMessage: z.string().min(1, "Proposal message is required"),
    successImage: z.custom<File>().optional(),
    message: z.string().min(1, "Message is required"),
    image1: z.custom<File>().optional(),
    caption1: z.string().optional(),
    image2: z.custom<File>().optional(),
    caption2: z.string().optional(),
    selectedStamp: z.string().min(1, "Please select a stamp"),
    selectedTheme: z.string().min(1, "Please select a theme"),
  })
  .refine(
    (data) => (data.image1 ? (data.caption1 ?? "").trim().length > 0 : true),
    {
      message: "You forgot to write a caption for your first image!",
      path: ["caption1"],
    },
  )
  .refine((data) => (data.caption1 ? !!data.image1 : true), {
    message: "You forgot to add a photo for your first caption!",
    path: ["caption1"],
  })
  .refine(
    (data) => (data.image2 ? (data.caption2 ?? "").trim().length > 0 : true),
    {
      message: "You forgot to write a caption for your second image!",
      path: ["caption2"],
    },
  )
  .refine((data) => (data.caption2 ? !!data.image2 : true), {
    message: "You forgot to add a photo for your second caption!",
    path: ["caption2"],
  })

export type ValentineFormValues = z.infer<typeof valentineFormSchema>
