// components/listing/PropertyDetails.tsx
interface PropertyDetailsProps {
    details: {
      property_type: 'apartment' | 'villa' | 'commercial';
      bedrooms?: number;
      bathrooms?: number;
      square_footage?: number;
      community: string;
      furnished: boolean;
      payment_terms: 'rent' | 'sale';
    }
  }
  
  export function PropertyDetails({ details }: PropertyDetailsProps) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Property Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm text-muted-foreground">Property Type</h3>
            <p className="font-medium capitalize">{details.property_type}</p>
          </div>
          {details.bedrooms && (
            <div>
              <h3 className="text-sm text-muted-foreground">Bedrooms</h3>
              <p className="font-medium">{details.bedrooms}</p>
            </div>
          )}
          {details.bathrooms && (
            <div>
              <h3 className="text-sm text-muted-foreground">Bathrooms</h3>
              <p className="font-medium">{details.bathrooms}</p>
            </div>
          )}
          {details.square_footage && (
            <div>
              <h3 className="text-sm text-muted-foreground">Area</h3>
              <p className="font-medium">{details.square_footage} sq ft</p>
            </div>
          )}
          <div>
            <h3 className="text-sm text-muted-foreground">Community</h3>
            <p className="font-medium">{details.community}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">Furnished</h3>
            <p className="font-medium">{details.furnished ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">Payment Terms</h3>
            <p className="font-medium capitalize">For {details.payment_terms}</p>
          </div>
        </div>
      </div>
    )
  }