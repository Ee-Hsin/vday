"use client"

import ValentineProposal from "@/components/CardTemplate";

export default function Example() {
  return (
    <ValentineProposal
      imgUrl="/chaewon_first_date.jpeg"
      imgCaption="Our first date"
      imgUrl2="/meal.jpg"
      imgCaption2="Your favorite meal"
      valentineName="Chaewon"
      senderName="Jordan"
      message="I've made reservations at Nobu, I'll see you at 7:30 then, it's gonna be great!"
    />
  );
}