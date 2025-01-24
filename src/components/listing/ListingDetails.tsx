interface ListingDetailsProps {
  details: Record<string, string | number>
}

export function ListingDetails({ details }: ListingDetailsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Details</h2>
      <div className="grid grid-cols-2">
        {Object.entries(details).map(([key, value]) => (
          <div key={key} className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">{key}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
} 