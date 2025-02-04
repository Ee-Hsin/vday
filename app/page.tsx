"use client"

import ValentineProposal from "@/components/ValentineProposalTemplate";

export default function Page() {
  return (
    <ValentineProposal
      imgUrl="/jeff_and_jim.svg?height=150&width=150"
      imgCaption="Jeff and Jim"
      imgUrl2="/flowers_color.svg?height=150&width=150"
      imgCaption2="Our first date"
      valentineName="Jane Doe"
      message="I'll see you at 7:30 then, I've already made reservations it's gonna be great!"
    />
  );
}