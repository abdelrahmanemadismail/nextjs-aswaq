"use client";

import { useState } from "react";
import { useProfile } from "@/context/ProfileContext";
import { EditableBusinessProfile } from "@/types/profile";
import {
  updateBusinessProfile,
  uploadBusinessLogo,
  deleteBusinessLogo,
} from "@/actions/business-profile-actions";
import { z } from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building2,
  Mail,
  Phone,
  CalendarIcon,
  Edit2,
  Save,
  X,
  Shield,
  Loader2,
  MapPin,
  Receipt,
  Building,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ImageCropper from "@/components/ImageCropper";
import DatePicker from "@/components/DatePicker";
import { cn } from "@/lib/utils";

const businessProfileSchema = z.object({
  business_name: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name cannot exceed 100 characters"),
  trade_license_number: z
    .string()
    .min(3, "Trade license number is required")
    .max(50, "Trade license number cannot exceed 50 characters"),
  trade_license_expiry: z
    .string()
    .min(1, "Trade license expiry date is required"),
  company_address: z
    .string()
    .min(5, "Company address must be at least 5 characters")
    .max(200, "Company address cannot exceed 200 characters"),
  company_phone: z
    .string()
    .min(8, "Company phone must be at least 8 characters")
    .max(20, "Company phone cannot exceed 20 characters")
    .regex(/^[0-9+\-() ]+$/, "Invalid phone number format"),
  company_email: z.string().email("Invalid email address").toLowerCase(),
  tax_registration_number: z.string().optional(),
  business_category: z.string().min(1, "Business category is required"),
  company_logo: z.string().optional().nullable(),
});

type BusinessFormData = z.infer<typeof businessProfileSchema>;

const LoadingState = () => (

    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
);

const ErrorState = () => (
    <Card>
      <CardHeader>
        <CardTitle>Error Loading Profile</CardTitle>
        <CardDescription>
          We couldn&apos;t load your business profile information. This might
          happen if:
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>You haven&apos;t created a business profile yet</li>
          <li>There was a network error</li>
          <li>Your session has expired</li>
        </ul>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
          <Button
            variant="default"
            onClick={() => (window.location.href = "/")}
          >
            Go to Home
          </Button>
        </div>
      </CardContent>
    </Card>
);

export default function BusinessProfilePage() {
  const { businessProfile, isLoading, refreshProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showDeleteLogoDialog, setShowDeleteLogoDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof BusinessFormData, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof BusinessFormData, boolean>>
  >({});
  const [editedProfile, setEditedProfile] = useState<EditableBusinessProfile>({
    business_name: "",
    company_logo: "",
    trade_license_number: "",
    trade_license_expiry: "",
    company_address: "",
    company_phone: "",
    company_email: "",
    tax_registration_number: "",
    business_category: "",
  });

  const validateField = (field: keyof BusinessFormData, value: string) => {
    try {
      const fieldSchema = businessProfileSchema.shape[field];
      fieldSchema.parse(value);
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [field]: err.errors[0].message,
        }));
      }
    }
  };

  const validateForm = () => {
    try {
      businessProfileSchema.parse(editedProfile);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors = err.errors.reduce((acc, error) => {
          if (error.path[0]) {
            acc[error.path[0] as keyof BusinessFormData] = error.message;
          }
          return acc;
        }, {} as Record<keyof BusinessFormData, string>);
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value || null,
    }));
    if (touched[name as keyof BusinessFormData]) {
      validateField(name as keyof BusinessFormData, value);
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardDialog(false);
    setIsEditing(false);
    setEditedProfile(
      businessProfile || {
        business_name: "",
        company_logo: "",
        trade_license_number: "",
        trade_license_expiry: "",
        company_address: "",
        company_phone: "",
        company_email: "",
        tax_registration_number: "",
        business_category: "",
      }
    );
    setErrors({});
    setTouched({});
  };

  const handleDeleteLogo = async () => {
    try {
      setIsSaving(true);
      await deleteBusinessLogo();
      setEditedProfile((prev) => ({ ...prev, company_logo: null }));
      await refreshProfile();

      toast({
        title: "Logo deleted",
        description: "Your business logo has been removed successfully.",
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setShowDeleteLogoDialog(false);
    }
  };

  const handleSave = async () => {
    setShowSaveDialog(false);
    setTouched(
      Object.keys(editedProfile).reduce((acc, key) => {
        acc[key as keyof BusinessFormData] = true;
        return acc;
      }, {} as Record<keyof BusinessFormData, boolean>)
    );

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      await updateBusinessProfile(editedProfile);
      await refreshProfile();
      setIsEditing(false);

      toast({
        title: "Profile updated",
        description: "Your business profile has been updated successfully.",
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedImage(e.target.files[0]);
      setShowCropper(true);
    }
  };

  const handleCroppedImage = async (file: File) => {
    try {
      setShowCropper(false);
      await deleteBusinessLogo();
      const res = await uploadBusinessLogo(file);
      setEditedProfile((prev) => ({ ...prev, company_logo: res.company_logo }));
      await refreshProfile();

      toast({
        title: "Logo updated",
        description: "Your business logo has been updated successfully.",
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload business logo. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!businessProfile) {
    return <ErrorState />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>
                Manage your business information
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button
                variant="primary_outline"
                onClick={() => {
                  setEditedProfile(businessProfile);
                  setIsEditing(true);
                }}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="primary_outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (Object.keys(errors).length === 0) {
                      setShowSaveDialog(true);
                    } else {
                      handleSave();
                    }
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage
                  src={businessProfile.company_logo || undefined}
                  alt={businessProfile.business_name}
                />
                <AvatarFallback>
                  <Building className="h-16 w-16 text-primary" />
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    id="logo-upload"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <label
                    htmlFor="logo-upload"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-3 py-1 rounded-full cursor-pointer"
                  >
                    Change Logo
                  </label>
                  {businessProfile.company_logo && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setShowDeleteLogoDialog(true)}
                    >
                      Delete Logo
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business_name">
                <Building2 className="inline mr-2 h-4 w-4 text-primary" />
                Business Name
              </Label>
              <Input
                id="business_name"
                name="business_name"
                value={
                  isEditing
                    ? editedProfile.business_name
                    : businessProfile.business_name
                }
                onChange={handleInputChange}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, business_name: true }));
                  validateField("business_name", editedProfile.business_name);
                }}
                disabled={!isEditing}
                className={cn(
                  "disabled:cursor-default",
                  errors.business_name && "border-red-500"
                )}
              />
              {touched.business_name && errors.business_name && (
                <Alert variant="destructive" className="py-2 border-none">
                  <AlertDescription>{errors.business_name}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade_license_number">
                <Receipt className="inline mr-2 h-4 w-4 text-primary" />
                Trade License Number
              </Label>
              <Input
                id="trade_license_number"
                name="trade_license_number"
                value={
                  isEditing
                    ? editedProfile.trade_license_number
                    : businessProfile.trade_license_number
                }
                onChange={handleInputChange}
                onBlur={() => {
                  setTouched((prev) => ({
                    ...prev,
                    trade_license_number: true,
                  }));
                  validateField(
                    "trade_license_number",
                    editedProfile.trade_license_number
                  );
                }}
                disabled={!isEditing}
                className={cn(
                  "disabled:cursor-default",
                  errors.trade_license_number && "border-red-500"
                )}
              />
              {touched.trade_license_number && errors.trade_license_number && (
                <Alert variant="destructive" className="py-2 border-none">
                  <AlertDescription>
                    {errors.trade_license_number}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade_license_expiry">
                <CalendarIcon className="inline mr-2 h-4 w-4 text-primary" />
                Trade License Expiry
              </Label>
              <DatePicker
                id="trade_license_expiry"
                value={
                  isEditing
                    ? editedProfile.trade_license_expiry
                    : businessProfile.trade_license_expiry
                }
                onChange={(date) => {
                  setEditedProfile((prev) => ({
                    ...prev,
                    trade_license_expiry: date,
                  }));
                  if (touched.trade_license_expiry) {
                    validateField("trade_license_expiry", date || "");
                  }
                }}
                onBlur={() => {
                  setTouched((prev) => ({
                    ...prev,
                    trade_license_expiry: true,
                  }));
                  validateField(
                    "trade_license_expiry",
                    editedProfile.trade_license_expiry || ""
                  );
                }}
                readOnly={!isEditing}
                minDate={new Date()}
                placeholder="Select expiry date"
                className={cn(errors.trade_license_expiry && "border-red-500")}
              />
              {touched.trade_license_expiry && errors.trade_license_expiry && (
                <Alert variant="destructive" className="py-2 border-none">
                  <AlertDescription>
                    {errors.trade_license_expiry}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_email">
                <Mail className="inline mr-2 h-4 w-4 text-primary" />
                Company Email
              </Label>
              <Input
                id="company_email"
                name="company_email"
                type="email"
                value={
                  isEditing
                    ? editedProfile.company_email
                    : businessProfile.company_email
                }
                onChange={handleInputChange}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, company_email: true }));
                  validateField("company_email", editedProfile.company_email);
                }}
                disabled={!isEditing}
                className={cn(
                  "disabled:cursor-default",
                  errors.company_email && "border-red-500"
                )}
              />
              {touched.company_email && errors.company_email && (
                <Alert variant="destructive" className="py-2 border-none">
                  <AlertDescription>{errors.company_email}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_phone">
                <Phone className="inline mr-2 h-4 w-4 text-primary" />
                Company Phone
              </Label>
              <Input
                id="company_phone"
                name="company_phone"
                type="tel"
                value={
                  isEditing
                    ? editedProfile.company_phone
                    : businessProfile.company_phone
                }
                onChange={handleInputChange}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, company_phone: true }));
                  validateField("company_phone", editedProfile.company_phone);
                }}
                disabled={!isEditing}
                className={cn(
                  "disabled:cursor-default",
                  errors.company_phone && "border-red-500"
                )}
              />
              {touched.company_phone && errors.company_phone && (
                <Alert variant="destructive" className="py-2 border-none">
                  <AlertDescription>{errors.company_phone}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="company_address">
                <MapPin className="inline mr-2 h-4 w-4 text-primary" />
                Company Address
              </Label>
              <Input
                id="company_address"
                name="company_address"
                value={
                  isEditing
                    ? editedProfile.company_address
                    : businessProfile.company_address
                }
                onChange={handleInputChange}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, company_address: true }));
                  validateField(
                    "company_address",
                    editedProfile.company_address
                  );
                }}
                disabled={!isEditing}
                className={cn(
                  "disabled:cursor-default",
                  errors.company_address && "border-red-500"
                )}
              />
              {touched.company_address && errors.company_address && (
                <Alert variant="destructive" className="py-2 border-none">
                  <AlertDescription>{errors.company_address}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_registration_number">
                <Receipt className="inline mr-2 h-4 w-4 text-primary" />
                Tax Registration Number (Optional)
              </Label>
              <Input
                id="tax_registration_number"
                name="tax_registration_number"
                value={
                  isEditing
                    ? editedProfile.tax_registration_number || ""
                    : businessProfile.tax_registration_number || ""
                }
                onChange={handleInputChange}
                disabled={!isEditing}
                className="disabled:cursor-default"
              />
            </div>
          </div>

          {/* License Verification Status */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>License Verification Status</Label>
                <div>
                  <Badge
                    variant={
                      businessProfile.trade_license_verified
                        ? "default"
                        : "destructive"
                    }
                  >
                    {businessProfile.trade_license_verified
                      ? "Verified"
                      : "Unverified"}
                  </Badge>
                </div>
              </div>
              {!businessProfile.trade_license_verified && (
                <Button variant="primary_outline">
                  <Shield className="mr-1 h-3 w-3" />
                  Get Verified
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Cropper Modal */}
      {selectedImage && (
        <ImageCropper
          isOpen={showCropper}
          onClose={() => setShowCropper(false)}
          imageFile={selectedImage}
          onSave={handleCroppedImage}
        />
      )}

      {/* Discard Changes Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDiscardChanges}
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Logo Dialog */}
      <AlertDialog
        open={showDeleteLogoDialog}
        onOpenChange={setShowDeleteLogoDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Logo?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your business logo? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteLogo}
            >
              Delete Logo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Changes Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these changes to your business
              profile?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
