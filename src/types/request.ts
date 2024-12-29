export interface SignupRequest {
  email: string;
  password: string;
  organization?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AddUserRequest {
  email: string;
  password: string;
  role: "admin" | "editor" | "viewer";
}

export interface UpdatePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ArtistRequest {
  name: string;
  grammy: number;
  hidden: boolean;
}

export interface AlbumRequest {
  artist_id: string;
  name: string;
  year: number;
  hidden: boolean;
}

export interface TrackRequest {
  artist_id: string;
  album_id: string;
  name: string;
  duration: number;
  hidden: boolean;
}

export interface FavoriteRequest {
  category: "artist" | "album" | "track";
  item_id: string;
}
