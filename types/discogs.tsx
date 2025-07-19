export interface DiscogsSearchResult {
  id: number;
  title: string;
  type: string;
  cover_image?: string;
  year?: string;
  genre?: string[];
  artist?: string;
}

export interface DiscogsRelease {
  id: number;
  title: string;
  artists: { name: string }[];
  genres: string[];
  year?: string;
  tracklist: { title: string; duration?: string }[];
  images?: { uri: string }[];
}