import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import SpotifyApi from "../lib/spotify";

function useSpotify() {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (session) {
            if (session.error === "Refresh failed") {
                signIn();
                return
            }

            SpotifyApi.setAccessToken((session.user as any).accessToken);
        }
    }, [session])

    return SpotifyApi;
}

export default useSpotify
