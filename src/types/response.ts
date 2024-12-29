export interface ApiResponse {
  status: number;
  data: any | null;
  message: string;
  error: string | null;
}

export interface LoginResponse extends ApiResponse {
  data: {
    token: string;
  } | null;
}

export interface UserResponse extends ApiResponse {
  data:
    | {
        user_id: string;
        email: string;
        role: string;
        created_at: Date;
      }[]
    | null;
}

export interface ArtistResponse extends ApiResponse {
  data:
    | {
        artist_id: string;
        name: string;
        grammy: number;
        hidden: boolean;
      }[]
    | null;
}

export interface AlbumResponse extends ApiResponse {
  data:
    | {
        album_id: string;
        artist_name: string;
        name: string;
        year: number;
        hidden: boolean;
      }[]
    | null;
}

export interface TrackResponse extends ApiResponse {
  data:
    | {
        track_id: string;
        artist_name: string;
        album_name: string;
        name: string;
        duration: number;
        hidden: boolean;
      }[]
    | null;
}

export interface FavoriteResponse extends ApiResponse {
  data:
    | {
        favorite_id: string;
        category: "artist" | "album" | "track";
        item_id: string;
        name: string;
        created_at: Date;
      }[]
    | null;
}
