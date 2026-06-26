"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  fetchClientProfile,
  fetchUnreadNotificationCount,
} from "../api/client-portal-api";
import type { PortalClientProfile } from "../types/portal.types";

type ClientPortalContextValue = {
  profile: PortalClientProfile | null;
  profileLoading: boolean;
  unreadCount: number;
  refreshProfile: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
};

const ClientPortalContext = createContext<ClientPortalContextValue | null>(null);

export function ClientPortalProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<PortalClientProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const data = await fetchClientProfile();
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await fetchUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
    void refreshUnreadCount();
  }, [refreshProfile, refreshUnreadCount, pathname]);

  const value = useMemo(
    () => ({
      profile,
      profileLoading,
      unreadCount,
      refreshProfile,
      refreshUnreadCount,
    }),
    [profile, profileLoading, unreadCount, refreshProfile, refreshUnreadCount],
  );

  return (
    <ClientPortalContext.Provider value={value}>{children}</ClientPortalContext.Provider>
  );
}

export function useClientPortal() {
  const context = useContext(ClientPortalContext);
  if (!context) {
    throw new Error("useClientPortal must be used within ClientPortalProvider");
  }
  return context;
}
