import {
  HomeIcon,
  SearchIcon,
  RssIcon,
  PlusCircleIcon,
  MenuAlt2Icon,
} from "@heroicons/react/outline";
import { HeartIcon, PlusIcon } from "@heroicons/react/solid";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { playlistIdState } from "../atoms/playlistAtom";
import useSpotify from "../hooks/useSpotify";

function Sidebar() {
  const spotifyApi = useSpotify();
  const { data: session, status } = useSession();
  const [playlists, setPlaylists] = useState<
    SpotifyApi.PlaylistObjectSimplified[]
  >([]);
  const [, setPlaylistId] = useRecoilState(playlistIdState);

  useEffect(() => {
    if (spotifyApi.getAccessToken()) {
      spotifyApi.getUserPlaylists().then((playlists) => {
        setPlaylists(playlists.body.items);
      });
    }
  }, [session, spotifyApi]);

  return (
    <div className="text-gray-500 p-5 text-sm border-r border-gray-900 overflow-y-scroll scrollbar-hide h-screen lg:text-sm sm:max-w-[12rem] lg:max-w-[15rem] hidden md:inline-flex pb-36">
      <div className="space-y-4">
        <button className="spotify-side-button">
          <HomeIcon className="h-5 w-5" />
          <p className="text-gray-400">Home</p>
        </button>
        <button className="spotify-side-button">
          <SearchIcon className="h-5 w-5" />
          <p className="text-gray-400">Search</p>
        </button>
        <button className="spotify-side-button">
          <MenuAlt2Icon className="h-5 w-5" />
          <p className="text-gray-400">Your Library</p>
        </button>
        <hr className="border-t-[0.1px] border-gray-900" />
        <button className="spotify-side-button">
          <PlusIcon className="h-5 w-5 text-gray-200" />
          <p className="text-gray-400">Create Playlist</p>
        </button>
        <button className="spotify-side-button">
          <HeartIcon className="h-5 w-5 text-blue-400" />
          <p className="text-gray-400">Liked Songs</p>
        </button>
        <button className="spotify-side-button">
          <RssIcon className="h-5 w-5 text-green-500" />
          <p className="text-gray-400">Your Episodes</p>
        </button>
        <hr className="border-t-[0.1px] border-gray-900" />

        {/** Playlists */}
        {playlists.map((playlist) => (
          <p
            onClick={() => setPlaylistId(playlist.id)}
            key={playlist.id}
            className="cursor-pointer hover:text-white"
          >
            {playlist.name}
          </p>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
