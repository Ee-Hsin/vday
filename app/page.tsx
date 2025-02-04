"use client"

import Link from "next/link";

export default function Page() {
  return (
    <>
      <h1>
        Landing page here
      </h1 >
      <Link href="example" className="text-blue-600">
        Example
      </Link>
    </>
  );
}