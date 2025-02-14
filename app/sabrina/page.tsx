"use client"

import ValentineProposal from "@/components/CardTemplate"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Crossword from '@guardian/react-crossword'
import { crosswordData } from './crosswordData'
import { Fredoka } from "next/font/google" // Add this import


const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export default function Example() {
  const [showCrossword, setShowCrossword] = useState(false)

  return (
    <>
      <ValentineProposal
        imgUrl="/ago candid.jpg"
        imgCaption="ago sneaky candid"
        imgUrl2="/bday candid.jpg"
        imgCaption2="bday sneaky candid"
        valentineName="Sabrina"
        senderName="Brian"
        message="No take backs! Fine print: Sabrina Wang does not get any gifts for free. A crossword puzzle stands in the way."
      />

      <Button 
        onClick={() => setShowCrossword(true)}
        className={`
          fixed bottom-4 right-4 z-[999] 
          bg-[#d98f8f] hover:bg-[#a55c5c] text-white 
          font-medium rounded-xl text-lg shadow-md
          transition-shadow duration-200 ease-in-out 
          hover:shadow-[0_0_20px_rgba(217,143,143,0.8)]
          ${fredoka.className}
        `}
      >
        Mysterious Button
      </Button>

      <Dialog open={showCrossword} onOpenChange={setShowCrossword}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Memories with Sabrina</h2>
            <Crossword data={crosswordData} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}