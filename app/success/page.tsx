"use client"

import { useSearchParams } from "next/navigation"

function SuccessPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id") // Get the 'id' query parameter (always a string)

  return (
    <div>
      <h1>Success!</h1>
      <p>{id}</p>
    </div>
  )
}

export default SuccessPage
