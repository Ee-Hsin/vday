import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
}

export default function SuccessModal({ isOpen, onClose, message }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-pink-100 border-2 border-pink-500">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-pink-600"> Yay!!!</DialogTitle>
        </DialogHeader>
        <div className="text-pink-800">
          <p>{message}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

