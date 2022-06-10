import {
  FastForwardIcon,
  ReplyIcon,
  RewindIcon,
  SwitchHorizontalIcon,
  VolumeOffIcon,
  VolumeUpIcon,
} from "@heroicons/react/outline";
import { PauseIcon, PlayIcon } from "@heroicons/react/solid";
import { debounce } from "lodash";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { currentTrackIdState, isPlayingState } from "../atoms/songAtom";
import useSongInfo from "../hooks/useSongInfo";
import useSpotify from "../hooks/useSpotify";
import { millisToMinutesAndSeconds } from "../lib/time";
import Image from 'next/image';

function Player() {
  const spotifyApi = useSpotify();
  const { data: session } = useSession();
  const [currentTrackId, setCurrentTrackId] =
    useRecoilState(currentTrackIdState);
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
  const [volume, setVolume] = useState(100);
  const [currentDuration, setCurrentDuration] = useState(0);
  const songInfo = useSongInfo();
  const debounceChangeVolume = useCallback(
    debounce((volume) => {
      spotifyApi.setVolume(volume).catch(console.error);
    }, 100),
    []
  );
  const fetchCurrentSong = () => {
    if (!songInfo) {
      spotifyApi.getMyCurrentPlayingTrack().then((data) => {
        if (data.body?.item) {
          setCurrentTrackId(data.body.item.id);
        }

        spotifyApi.getMyCurrentPlaybackState().then((data) => {
          setIsPlaying(data.body?.is_playing);
        });
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCurrentSong();
    }, 2000)
    return () => {
      clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (spotifyApi.getAccessToken()) {
      fetchCurrentSong();
    }
  }, [currentTrackId, spotifyApi, session]);

  const handlePlayPause = () => {
    spotifyApi.getMyCurrentPlaybackState().then((data) => {
      if (data.body?.is_playing) {
        spotifyApi.pause();
        setIsPlaying(false);
      } else {
        spotifyApi.play();
        setIsPlaying(true);
      }
    });
  };

  const seek = (positionMs: number) => {
    spotifyApi.seek(positionMs).then(
      function () {
        console.log("Seek to " + positionMs);
      },
      function (err) {
        //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
        console.log("Something went wrong!", err);
      }
    );
  };

  const prevSong = spotifyApi.skipToPrevious as any;
  const nextSong = spotifyApi.skipToNext as any;


  useEffect(() => {
    debounceChangeVolume(volume);
  }, [volume]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        spotifyApi.getMyCurrentPlaybackState().then((data) => {
          if(data.body.progress_ms) {
            setCurrentDuration(data.body.progress_ms);
          }
        })
      }
    }, 1000);

    return () => {
      clearInterval(interval)
    }
  }, [isPlaying])
  return (
    <div className="h-24 bg-gradient-to-b from-black to-gray-900 text-white grid grid-cols-3 text-xs md:text-base px-2 md:px-8">
      {/* Left */}
      <div className="flex items-center space-x-4">
        {songInfo?.album.images[0].url ? (<Image
          src={songInfo?.album.images[0].url as string}
          className="hidden md:inline h-16 w-16"
          width={64}
          height={64}
          quality={50}
        />) : <span className="w-16 h-16 bg-gray-500"></span>}
        <div className="hidden sm:inline">
          <h3>{songInfo?.name}</h3>
          <p className="text-xs text-gray-400">
            {songInfo?.artists?.[0]?.name}
          </p>
        </div>
      </div>
      {/* Center */}
      <div className="flex flex-col justify-evenly">
        <div className="flex items-center justify-evenly">
          <SwitchHorizontalIcon onClick={prevSong} className="button hidden sm:inline" />
          <RewindIcon className="button" />
          {isPlaying ? (
            <PauseIcon onClick={handlePlayPause} className="button w-10 h-10" />
          ) : (
            <PlayIcon onClick={handlePlayPause} className="button w-10 h-10" />
          )}

          <FastForwardIcon onClick={nextSong} className="button" />
          <ReplyIcon className="button hidden sm:inline" />
        </div>
        <div className="flex items-center space-x-2">
        <p className="text-xs text-gray-600">{millisToMinutesAndSeconds(currentDuration)}</p>
          <input
            type="range"
            min="0"
            max={songInfo?.duration_ms}
            value={currentDuration}
            onChange={(e) => {
              setCurrentDuration(parseInt(e.target.value));
              seek(parseInt(e.target.value));
            }}
            className="w-full h-[4px]"
          />
          <p className="text-xs text-gray-600">{songInfo?.duration_ms && millisToMinutesAndSeconds(songInfo.duration_ms)}</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center space-x-3 md:space-x-4 justify-end pr-5">
        <VolumeOffIcon
          onClick={() => setVolume(Number(Math.max(0, volume - 10)))}
          className="button"
        />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          className="w-14 md:w-28 h-[4px] sm:h-auto"
          onChange={(e) => setVolume(Number(e.target.value))}
        />
        <VolumeUpIcon
          onClick={() => setVolume(Number(Math.min(100, volume + 10)))}
          className="button"
        />
      </div>
    </div>
  );
}

export default Player;
