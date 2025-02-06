"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"

function SuccessPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id") // Get the 'id' query parameter (always a string)

  return (
    <div>
      <h1>Success!</h1>
      <Link href={`/card/${id}`}>{id}</Link>
    </div>
  )
}

export default SuccessPage
