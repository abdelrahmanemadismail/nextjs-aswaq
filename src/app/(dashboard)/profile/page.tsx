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

export default function ProfilePage() {
  const router = useRouter();
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
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
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
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8">
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
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              We couldn&apos;t find your profile information. Please try
              refreshing the page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                Manage your account profile information
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
                <Button onClick={handleSave} disabled={isSaving}>
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
                    Change Photo
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
                  Full Name
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
                  Email
                  {isEditing &&
                    <Button variant="link" onClick={() => {router.push("/auth/change-email")}}>Change Email</Button>
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
                  Phone Number
                  {isEditing &&
                    <Button variant="link" onClick={() => {router.push("/auth/phone-verification")}}>Change Phone Number</Button>
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
                  Date of birth
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
                  placeholder="Select birth date"
                  maxDate={new Date()}
                  displayFormat="PP"
                />
              </div>
            </div>

            {/* Verification Status */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Verification Status</Label>
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
                  <Button variant="primary_outline">
                    <Shield className="mr-1 h-3 w-3" />
                    Get Verified
                  </Button>
                )}
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
    </div>
  );
}
