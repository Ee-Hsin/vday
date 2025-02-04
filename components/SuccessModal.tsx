import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-pink-100 border-2 border-pink-500">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-pink-600">Yayy! 🎉❤️</DialogTitle>
        </DialogHeader>
        <div className="text-pink-800">
          <p>I'm glad you said yes, although if you tried to click no, you'd realize it wasn't really a choice! 😁</p>
          <p>I've made reservations at Hapa Izakaya at 7:30pm!</p>
          <p>Meet me at mine at 6:30!</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

