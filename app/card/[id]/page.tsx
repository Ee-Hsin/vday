import { adminDb } from "@/lib/firebase-admin"
import ValentineProposal from "@/components/CardTemplate"
import ErrorScreen from "@/components/ErrorScreen"
import AnalyticsTracker from "@/components/AnalyticsTracker"
import { ValentineProposalProps } from "@/lib/types"

interface PageProps {
  params: { id: string }
}

export default async function CardPage({ params }: PageProps) {
  const { id } = params

  let cardData: ValentineProposalProps | null = null
  let error: string | null = null

  try {
    const docSnap = await adminDb.collection("valentineMessages").doc(id).get()

    if (docSnap.exists) {
      const data = docSnap.data()

      if (data) {
        cardData = {
          valentineName: data.recipientName || "",
          senderName: data.senderName || "",
          proposalMessage: data.proposalMessage || "",
          successImageURL: data.successImageURL || null,
          message: data.message || "",
          imgUrl: data.image1URL || null,
          imgCaption: data.caption1 || "",
          imgUrl2: data.image2URL || null,
          imgCaption2: data.caption2 || "",
          selectedStamp: data.selectedStamp || "stamp1",
          selectedTheme: data.selectedTheme || "pinkTheme",
        }
      }
    } else {
      error = "Card not found!"
    }
  } catch (err) {
    console.error("Admin SDK Error:", err)
    error = "Error fetching card"
  }

  if (error || !cardData) {
    return <ErrorScreen message={error || "Unknown Error"} />
  }

  return (
    <>
      <AnalyticsTracker
        eventName="custom_card_viewed"
        eventParams={{ id: id }}
      />
      <ValentineProposal
        imgUrl={cardData.imgUrl || "/fallback-image.jpg"}
        imgCaption={cardData.imgCaption || ""}
        imgUrl2={cardData.imgUrl2 || "/fallback-image.jpg"}
        imgCaption2={cardData.imgCaption2 || ""}
        valentineName={cardData.valentineName}
        senderName={cardData.senderName}
        message={cardData.message}
        proposalMessage={cardData.proposalMessage}
        selectedStamp={cardData.selectedStamp || "stamp1"}
        selectedTheme={cardData.selectedTheme || "pinkTheme"}
      />
    </>
  )
}
