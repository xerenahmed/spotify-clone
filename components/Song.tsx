import { millisToMinutesAndSeconds } from "../lib/time";
import Image from "next/image";
import { currentTrackIdState, isPlayingState } from "../atoms/songAtom";
import { useRecoilState } from "recoil";
import useSpotify from "../hooks/useSpotify";
import { ChartBarIcon } from "@heroicons/react/solid";

function Song({
  order,
  track,
}: {
  order: number;
  track: SpotifyApi.TrackObjectFull;
}) {
  const [currentTrackId, setCurrentTrackId] =
    useRecoilState(currentTrackIdState);
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
  const spotifyApi = useSpotify();

  const playSong = async () => {
    setCurrentTrackId(track.id);
    setIsPlaying(true);
    try {
      await spotifyApi.play({
        uris: [track.uri],
      });
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div
      className="grid grid-cols-2 text-gray-500 py-4 px-5 hover:bg-gray-900 rounded-lg cursor-pointer"
      onClick={playSong}
    >
      <div className="flex items-center space-x-4">
        {currentTrackId === track.id ? (
          <ChartBarIcon className="w-4 h-5 text-green-500" />
        ) : (
          <p className="text-gray-500 text-sm">{order + 1}</p>
        )}
        <div>
          <Image
            src={track.album.images[0].url}
            alt=""
            width={40}
            height={40}
            quality={10}
          />
        </div>
        <div>
          <p
            className={`w-36 lg:w-64 ${
              currentTrackId === track.id ? "text-green-500" : "text-white"
            } truncate`}
          >
            {track.name}
          </p>
          <p className="w-40">{track.artists[0].name}</p>
        </div>
      </div>

      <div className="flex items-center justify-between ml-auto md:ml-0">
        <p className="w-50 hidden md:inline">{track.album.name}</p>
        <p>{millisToMinutesAndSeconds(track.duration_ms)}</p>
      </div>
    </div>
  );
}

export default Song;
