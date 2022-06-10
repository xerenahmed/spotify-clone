import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { currentTrackIdState } from "../atoms/songAtom";
import SpotifyApi from "../lib/spotify";
import useSpotify from "./useSpotify";

function useSongInfo(): SpotifyApi.SingleTrackResponse | null {
    const { data: session, status } = useSession();
    const spotifyApi = useSpotify();
    const [currentTrackId, setCurrentTrackId] = useRecoilState(currentTrackIdState);
    const [songInfo, setSongInfo] = useState<any>(null);

    useEffect(() => {
        const fetchSongInfo = async () => {
            if (currentTrackId) {
                const trackInfo = await spotifyApi.getTrack(currentTrackId);
                setSongInfo(trackInfo.body);
            }
        }

        fetchSongInfo();
    }, [currentTrackId, spotifyApi]);
    return songInfo;
}

export default useSongInfo
