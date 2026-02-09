import { UseFormReturn } from "react-hook-form"
import heic2any from "heic2any"

interface UseImageFileHandlerOptions {
  form: UseFormReturn<any>
  fieldName: string
  onPreviewChange: (url: string | null) => void
  currentPreview: string | null
}

export function useImageFileHandler({
  form,
  fieldName,
  onPreviewChange,
  currentPreview,
}: UseImageFileHandlerOptions) {
  const handleImageChange = async (
    file: File | null,
    onChange: (file: File | null) => void,
    inputElement?: HTMLInputElement,
  ) => {
    if (!file) return

    let previewUrl: string | null = null

    const validTypes = ["image/jpeg", "image/png", "image/jpg"]
    if (!validTypes.includes(file.type)) {
      form.setError(fieldName, {
        type: "manual",
        message: "File type not supported. Please upload PNG or JPG only.",
      })
      if (inputElement) {
        inputElement.value = ""
      }
      return
    }

    form.clearErrors(fieldName)

    if (
      file.type === "image/heic" ||
      file.name.toLowerCase().endsWith(".heic") ||
      file.type === "image/heif" ||
      file.name.toLowerCase().endsWith(".heif")
    ) {
      try {
        const blob = await heic2any({
          blob: file,
          toType: "image/jpeg",
        })
        const convertedFile = new File(
          [blob as Blob],
          file.name.replace(/\.(heic|HEIC|heif|HEIF)$/, ".jpg"),
          {
            type: "image/jpeg",
          },
        )

        previewUrl = URL.createObjectURL(convertedFile)
      } catch (error) {
        console.error("HEIC conversion failed:", error)
      }
    } else {
      previewUrl = URL.createObjectURL(file)
    }

    // Revoke old URL if it exists
    if (currentPreview) {
      URL.revokeObjectURL(currentPreview)
    }

    onChange(file)
    onPreviewChange(previewUrl)
  }

  return { handleImageChange }
}
