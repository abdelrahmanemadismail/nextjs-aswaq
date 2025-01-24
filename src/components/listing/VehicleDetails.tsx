// components/listing/VehicleDetails.tsx
interface VehicleDetailsProps {
    details: {
      brand: string;
      model: string;
      year: number;
      color?: string;
      mileage?: number;
      specs?: string;
      sub_category: 'car' | 'motorcycle' | 'boats' | 'heavytrucks';
      payment_terms: 'rent' | 'sale';
    }
  }
  
  export function VehicleDetails({ details }: VehicleDetailsProps) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Vehicle Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm text-muted-foreground">Brand</h3>
            <p className="font-medium">{details.brand}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">Model</h3>
            <p className="font-medium">{details.model}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">Year</h3>
            <p className="font-medium">{details.year}</p>
          </div>
          {details.color && (
            <div>
              <h3 className="text-sm text-muted-foreground">Color</h3>
              <p className="font-medium">{details.color}</p>
            </div>
          )}
          {details.mileage && (
            <div>
              <h3 className="text-sm text-muted-foreground">Mileage</h3>
              <p className="font-medium">{details.mileage.toLocaleString()} km</p>
            </div>
          )}
          <div>
            <h3 className="text-sm text-muted-foreground">Category</h3>
            <p className="font-medium capitalize">{details.sub_category}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">Payment Terms</h3>
            <p className="font-medium capitalize">For {details.payment_terms}</p>
          </div>
        </div>
      </div>
    )
  }