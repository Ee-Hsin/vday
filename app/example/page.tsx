"use client"

import ValentineProposal from "@/components/ValentineProposalTemplate";

export default function Example() {
  return (
    <ValentineProposal
      imgUrl="/happy-couple.jpg"
      imgCaption="Our first picture together"
      imgUrl2="/first-date.jpg"
      imgCaption2="Our first date"
      valentineName="Jane Doe"
      message="I'll see you at 7:30 then, I've already made reservations it's gonna be great!"
    />
  );
}