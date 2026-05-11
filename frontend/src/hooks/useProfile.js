import { useCallback, useEffect, useState } from "react";
import { profileService } from "../services/profileService";

export function useProfile() {
  const [profile, setProfile] = useState(() => profileService.getCached());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [requestError, setRequestError] = useState("");

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setRequestError("");

    const response = await profileService.get();

    if (!response.ok) {
      setRequestError(response.message);
    } else {
      setProfile(response.data);
    }

    setIsLoading(false);
    return response;
  }, []);

  useEffect(() => {
    let isActive = true;

    async function fetchProfile() {
      setIsLoading(true);
      setRequestError("");

      const response = await profileService.get();

      if (!isActive) return;

      if (!response.ok) {
        setRequestError(response.message);
      } else {
        setProfile(response.data);
      }

      setIsLoading(false);
    }

    fetchProfile();

    return () => {
      isActive = false;
    };
  }, []);

  const updateProfile = async (payload) => {
    setIsSaving(true);
    setRequestError("");

    const response = await profileService.update(payload);
    setIsSaving(false);

    if (!response.ok) {
      setRequestError(response.message);
    } else {
      setProfile(response.data);
    }

    return response;
  };

  return {
    profile,
    isLoading,
    isSaving,
    requestError,
    loadProfile,
    updateProfile,
  };
}
