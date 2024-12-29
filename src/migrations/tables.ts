import { pool } from "../config/database";

const createTables = async () => {
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Organizations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        org_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Users table with organization reference
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) CHECK (role IN ('admin', 'editor', 'viewer')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Artists table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS artists (
        artist_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        grammy INTEGER DEFAULT 0,
        hidden BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Albums table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS albums (
        album_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        artist_id UUID REFERENCES artists(artist_id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        year INTEGER NOT NULL,
        hidden BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tracks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tracks (
        track_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        album_id UUID REFERENCES albums(album_id) ON DELETE CASCADE,
        artist_id UUID REFERENCES artists(artist_id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        duration INTEGER NOT NULL,
        hidden BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Favorites table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        favorite_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        category VARCHAR(20) CHECK (category IN ('artist', 'album', 'track')),
        item_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
      CREATE INDEX IF NOT EXISTS idx_artists_org_id ON artists(org_id);
      CREATE INDEX IF NOT EXISTS idx_albums_artist_id ON albums(artist_id);
      CREATE INDEX IF NOT EXISTS idx_tracks_album_id ON tracks(album_id);
      CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks(artist_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
    `);

    console.log("All tables and indexes created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};

createTables();
