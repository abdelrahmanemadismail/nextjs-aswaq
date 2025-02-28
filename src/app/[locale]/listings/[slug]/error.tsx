// app/listings/[slug]/error.tsx
"use client"

export default function ListingError({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-2">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <button
        onClick={() => reset()}
        className="rounded bg-blue-500 px-4 py-2 text-white"
      >
        Try again
      </button>
    </div>
  )
}