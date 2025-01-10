'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { UserProfile, UserRole, BusinessProfile } from '@/types/profile'
import { getUserProfile, getUserRole, getBusinessProfile } from '@/actions/profile-actions'
import { toast } from "@/hooks/use-toast"

interface ProfileContextType {
    profile: UserProfile | null
    role: UserRole | null
    businessProfile: BusinessProfile | null
    isLoading: boolean
    error: Error | null
    refreshProfile: () => Promise<void>
  }

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load user profile, role, and business profile in parallel
      const [profileData, roleData, businessProfileData] = await Promise.all([
        getUserProfile(),
        getUserRole(),
        getBusinessProfile()
      ])

      setProfile(profileData)
      setRole(roleData)
      setBusinessProfile(businessProfileData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load profile'))
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load profile data on mount
  useEffect(() => {
    loadProfile()
  }, [])  

  const contextValue: ProfileContextType = {
    profile,
    role,
    businessProfile,
    isLoading,
    error,
    refreshProfile: loadProfile
  }

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}