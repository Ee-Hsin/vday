"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react"; // Import Suspense

function SuccessPage() {
  return (
    <div>
      <h1>Success!</h1>
      <Suspense fallback={<p>Loading...</p>}> {/* Wrap with Suspense */}
        <SearchParamsContent />
      </Suspense>
    </div>
  );
}

function SearchParamsContent() { // Separate component for using useSearchParams
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <>
      {id && (
        <Link href={`/card/${id}`} prefetch>
          {id}
        </Link>
      )}
        {!id && (<p>No id provided</p>)}
    </>
  );
}

export default SuccessPage;