import { useCallback, useMemo } from "react";
import { trpc } from "@/providers/trpc";

export interface UnifiedUser {
  id: number;
  name: string;
  email?: string | null;
  avatar?: string | null;
  role: string;
  authType: "oauth" | "local";
}

export function useAuth() {
  const utils = trpc.useUtils();
  const oauthQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const localQuery = trpc.localAuth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.invalidate();
    },
  });

  const user: UnifiedUser | null = useMemo(() => {
    if (oauthQuery.data) {
      return {
        id: oauthQuery.data.id,
        name: oauthQuery.data.name || "User",
        email: oauthQuery.data.email,
        avatar: oauthQuery.data.avatar,
        role: oauthQuery.data.role,
        authType: "oauth" as const,
      };
    }
    if (localQuery.data) {
      return {
        id: localQuery.data.id,
        name: localQuery.data.name || localQuery.data.displayName || localQuery.data.username,
        email: localQuery.data.email,
        avatar: localQuery.data.avatar,
        role: localQuery.data.role,
        authType: "local" as const,
      };
    }
    return null;
  }, [oauthQuery.data, localQuery.data]);

  const isLoading = oauthQuery.isLoading || localQuery.isLoading;
  const isLoggedIn = !!user;

  const logout = useCallback(() => {
    localStorage.removeItem("local_auth_token");
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        window.location.reload();
      },
    });
  }, [logoutMutation]);

  const getOAuthUrl = useCallback(() => {
    const appID = import.meta.env.VITE_APP_ID;
    const authUrl = import.meta.env.VITE_KIMI_AUTH_URL;
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);
    const url = new URL(`${authUrl}/api/oauth/authorize`);
    url.searchParams.set("client_id", appID);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "profile");
    url.searchParams.set("state", state);
    return url.toString();
  }, []);

  return {
    user,
    isLoading,
    isLoggedIn,
    logout,
    getOAuthUrl,
  };
}
