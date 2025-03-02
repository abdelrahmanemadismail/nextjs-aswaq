"use client";

import { useState } from "react";
import { useProfile } from "@/context/ProfileContext";
import { EditableUserProfile } from "@/types/profile";
import {
  updateUserProfile,
  uploadProfileImage,
  deleteProfileImage,
} from "@/actions/profile-actions";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  CalendarIcon,
  Edit2,
  Save,
  X,
  Shield,
  Loader2,
} from "lucide-react";
import ImageCropper from "@/components/ImageCropper";
import DatePicker from "@/components/DatePicker";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { profile, isLoading, refreshProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<EditableUserProfile>({
    full_name: "",
    avatar_url: "",
    date_of_birth: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle save profile
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await deleteProfileImage();
      await updateUserProfile(editedProfile);
      await refreshProfile();
      setIsEditing(false);
      toast({
        title: t.profile.updated,
        description: t.profile.updatedDescription,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: t.profile.updateError,
        description: t.profile.updateErrorDescription,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle avatar upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedImage(e.target.files[0]);
      setShowCropper(true);
    }
  };

  const handleCroppedImage = async (file: File) => {
    try {
      setShowCropper(false);
      await deleteProfileImage();
      const res = await uploadProfileImage(file);
      setEditedProfile(res);
      await refreshProfile();
      toast({
        title: t.profile.avatarUpdated,
        description: t.profile.avatarUpdatedDescription,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: t.profile.avatarUpdateError,
        description: t.profile.avatarUpdateErrorDescription,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-48" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-72" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Skeleton className="h-32 w-32 rounded-full" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
    );
  }

  if (!profile) {
    return (
        <Card>
          <CardHeader>
            <CardTitle>{t.profile.notFound.title}</CardTitle>
            <CardDescription>
              {t.profile.notFound.description}
            </CardDescription>
          </CardHeader>
        </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t.profile.title}</CardTitle>
              <CardDescription>
                {t.profile.description}
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button
                variant="primary_outline"
                onClick={() => {
                  setEditedProfile({
                    full_name: profile.full_name,
                    avatar_url: profile.avatar_url,
                    date_of_birth: profile.date_of_birth,
                  });
                  setIsEditing(true);
                }}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                {t.profile.edit}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="primary_outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  <X className="mr-2 h-4 w-4" />
                  {t.profile.cancel}
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {t.profile.saveChanges}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage
                  src={profile.avatar_url || undefined}
                  alt={profile.full_name}
                />
                <AvatarFallback>
                  <User className="h-16 w-16 text-primary" />
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    id="avatar-upload"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-3 py-1 rounded-full cursor-pointer"
                  >
                    {t.profile.changePhoto}
                  </label>
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">{profile.full_name}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">
                  <User className="inline mr-2 h-4 w-4 text-primary" />
                  {t.profile.fullName}
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={
                    isEditing ? editedProfile.full_name : profile.full_name
                  }
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="disabled:cursor-default"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="inline mr-2 h-4 w-4 text-primary" />
                  {t.profile.email}
                  {isEditing &&
                    <Button variant="link" onClick={() => {router.push("/auth/change-email")}}>{t.profile.changeEmail}</Button>
                  }
                </Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="disabled:cursor-default"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone_number">
                  <Phone className="inline mr-2 h-4 w-4 text-primary" />
                  {t.profile.phoneNumber}
                  {isEditing &&
                    <Button variant="link" onClick={() => {router.push("/auth/phone-verification")}}>{t.profile.changePhoneNumber}</Button>
                  }
                </Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={profile.phone_number || ""}
                  disabled
                  className="disabled:cursor-default"
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">
                  <CalendarIcon className="inline mr-2 h-4 w-4 text-primary" />
                  {t.profile.dateOfBirth}
                </Label>
                <DatePicker
                  id="date_of_birth"
                  value={
                    isEditing
                      ? editedProfile.date_of_birth
                      : profile.date_of_birth
                  }
                  onChange={(date) => {
                    setEditedProfile((prev) => ({
                      ...prev,
                      date_of_birth: date,
                    }));
                  }}
                  readOnly={!isEditing}
                  placeholder={t.profile.selectBirthDate}
                  maxDate={new Date()}
                  displayFormat="PP"
                />
              </div>
            </div>

            {/* Verification Status */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>{t.profile.verificationStatus}</Label>
                  <div>
                    <Badge
                      variant={
                        profile.verification_status === "verified"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {profile.verification_status.charAt(0).toUpperCase() +
                        profile.verification_status.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                {profile.verification_status !== "verified" && (
                  <Button variant="primary_outline" onClick={() => {router.push("/profile/verification")}}>
                    <Shield className="mr-1 h-3 w-3" />
                    {t.profile.getVerified}
                  </Button>
                )}
              </div>
              <div className="space-y-3 text-sm text-muted-foreground mt-6">
                    <p>{t.profile.whyVerification}</p>
                    <ul className="list-decimal pl-4 space-y-2">
                      {t.profile.verificationBenefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
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
    </>
  );
}