// app/card/[id]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { analytics, db } from '@/lib/firebase'; // Your Firebase initialization
import { doc, getDoc } from 'firebase/firestore'; // Import getFirestore
import ValentineProposal from "@/components/CardTemplate";
import LoadingScreen from "@/components/LoadingScreen"
import ErrorScreen from "@/components/ErrorScreen"
import { logEvent } from 'firebase/analytics';

export default function CardPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id; // Ensure id is a string
  const [cardData, setCardData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true); // Set loading to true before fetching

      try {
        const docRef = doc(db, "valentineMessages", id); // Reference to the document
        const docSnap = await getDoc(docRef); // Fetch the document

        if (docSnap.exists()) {
          setCardData(docSnap.data()); // Set the card data
        } else {
          setError("Card not found!"); // Set an error message if not found
        }
      } catch (err) {
        setError("Error fetching card"); // Set error message
      } finally {
        if (analytics){
          logEvent(analytics, "custom_card_viewed", { id: id})
        }
        setLoading(false); // Set loading to false after fetch attempt
      }
    }

    if (id) { // Only fetch if id exists (prevents error on initial render)
      fetchData();
    }
  }, [id]); // Re-run effect if 'id' changes

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return <ErrorScreen message={error} />
  }

  if (!cardData) { // Data could be null if there was an issue or the doc doesn't exist
    return <ErrorScreen message={error} />
  }

  // Now you have the card data, display it!
  return (
    <ValentineProposal
      imgUrl={cardData.image1URL || "/fallback-image.jpg"}
      imgCaption={cardData.caption1 || ""}
      imgUrl2={cardData.image2URL || "/fallback-image.jpg"}
      imgCaption2={cardData.caption2 || ""}
      valentineName={cardData.recipientName}
      senderName={cardData.senderName}
      message={cardData.message}
      selectedStamp={cardData.selectedStamp || ""}
    />
    // <div>
    //   <h1>Your Valentine Card</h1>
    //   <p>Sender: {cardData.senderName}</p>
    //   <p>Recipient: {cardData.recipientName}</p>
    //   <p>Message: {cardData.message}</p>
    //   {/* ... other card details ... */}
    //   {cardData.image1URL && <img src={cardData.image1URL} alt="Image 1" />}
    //   {cardData.image2URL && <img src={cardData.image2URL} alt="Image 2" />}
    // </div>
  );
}