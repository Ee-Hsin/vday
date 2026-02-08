"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { analytics, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ValentineProposal from "@/components/CardTemplate";
import LoadingScreen from "@/components/LoadingScreen"
import ErrorScreen from "@/components/ErrorScreen"
import { logEvent } from 'firebase/analytics';

export default function CardPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [cardData, setCardData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      try {
        const docRef = doc(db, "valentineMessages", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCardData(docSnap.data());
        } else {
          setError("Card not found!");
        }
      } catch (err) {
        setError("Error fetching card");
      } finally {
        if (analytics){
          logEvent(analytics, "custom_card_viewed", { id: id})
        }
        setLoading(false);
      }
    }

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return <ErrorScreen message={error ?? "Something went wrong"} />
  }

  if (!cardData) {
    return <ErrorScreen message={error ?? "Card not found"} />
  }

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
  );
}