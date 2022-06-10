import { ChevronDownIcon } from "@heroicons/react/outline";
import { shuffle } from "lodash";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { playlistState, playlistIdState } from "../atoms/playlistAtom";
import useSpotify from "../hooks/useSpotify";
import Songs from "./Songs";
import Image from "next/image";
import { useRouter } from "next/router";

const colors = [
  "from-indigo-500",
  "from-blue-500",
  "from-green-500",
  "from-red-500",
  "from-yellow-500",
  "from-pink-500",
  "from-purple-500",
];

function Center() {
  const { data: session } = useSession();
  const spotifyApi = useSpotify();
  const [color, setColor] = useState<string | null>(null);
  const [playlistId, setPlaylistId] = useRecoilState(playlistIdState);
  const [playlist, setPlaylist] = useRecoilState(playlistState);
  const router = useRouter();

  const routerPlaylistId: string | null = (Array.isArray(router.query.playlist) ? router.query.playlist[0] : router.query.playlist) || null;

  useEffect(() => {
    setColor(shuffle(colors).pop() as string);
  }, [playlistId]);

  useEffect(() => {
    if (playlistId) {
      spotifyApi
      .getPlaylist(playlistId)
      .then((data) => {
        setPlaylist(data.body as any);
        if (routerPlaylistId !== playlistId) {
          router.replace(`/?playlist=${playlistId}`);
        }
      })
      .catch(console.error);
    }
  }, [spotifyApi, playlistId]);

  useEffect(() => {
    if (typeof routerPlaylistId === "string") {
      setPlaylistId(routerPlaylistId);
    } else {
      setPlaylistId("1xyRfCBqJln7xkqIDZPXLf");
    }
  }, [routerPlaylistId]);

  if(!playlist) {
    return <p></p>;
  }

  return (
    <div className="flex-grow flex-col h-screen overflow-y-scroll scrollbar-hide pb-20">
      <div className="relative">
      <header className="absolute top-5 right-8">
        <div
          className="flex items-center space-x-3 bg-black text-white opacity-90 hover:opacity-80 cursor-pointer rounded-full p-1 pr-2"
          onClick={signOut as any}
        >
          <Image
            className="h-10 w-190 rounded-full"
            src={(session?.user as any)?.image as string}
            alt=""
            width={40}
            height={40}
            quality={10}
            priority={true}
          />
          <h2>{session?.user?.name}</h2>
          <ChevronDownIcon className="h-5 w-5" />
        </div>
      </header>

      <section
        className={`flex items-end space-x-7 bg-gradient-to-b to-black ${color} text-white p-8 h-80 w-full`}
      >
        <Image
          src={playlist.images[0].url}
          alt=""
          className="shadow-2xl"
          height={176}
          width={176}
          quality={10}
        />
        <div>
          <p>PLAYLIST</p>
          <h1 className="text-2xl md:text-3xl xl:text-5xl font-bold ">
            {playlist?.name}
          </h1>
        </div>
      </section>
      </div>

      <div>
        <Songs />
      </div>
    </div>
  );
}

export default Center;
