import { atom } from 'recoil';

export const playlistIdState = atom<string | null>({
    key: 'playlistIdState',
    default: null,
})

export const playlistState = atom<SpotifyApi.SinglePlaylistResponse | null>({
    key: 'playlistState',
    default: null,
})