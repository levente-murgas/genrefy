import { Injectable } from '@angular/core';
import { SongsService } from '../songs/songs.service';


@Injectable({
  providedIn: 'root'
})
export class FiltersService {

  constructor(
    private songsService: SongsService
  ) { }

  async fetchLikedTracksWithGenres(accessToken: string): Promise<any[]> {
    // Call the fetchLikedTracks, extractArtistIds, fetchArtists, amendGenresToTracks methods
    // and return the liked tracks with genres
    const likedTracks = this.songsService.getLikedTracksFromLocalStorage();
    // Extract unique artist IDs
    const uniqueArtistIds = [...new Set(likedTracks.map((track) => track.artistId))];
    // Fetch artist data
    const artistsData = await this.fetchArtists(accessToken, uniqueArtistIds);

    // Create mapping of artist ID to genres
    const artistGenresMap: { [key: string]: string[] } = {};
    artistsData.forEach((artist) => {
      artistGenresMap[artist.id] = artist.genres;
    });

    // Amend genres to liked tracks
    likedTracks.forEach((track) => {
      track.genres = artistGenresMap[track.artistId];
    });

    return likedTracks;
  }

  // Fetch artist data in chunks of 50
  async fetchArtists(accessToken: string, artistIds: string[]): Promise<any[]> {
    const chunkSize = 50;
    const artistsData: any[] = [];

    for (let i = 0; i < artistIds.length; i += chunkSize) {
      const idsChunk = artistIds.slice(i, i + chunkSize).join(',');
      const response = await fetch(`https://api.spotify.com/v1/artists?ids=${idsChunk}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch artist data: ${response.statusText}`);
      }

      const data = await response.json();
      artistsData.push(...data.artists);
    }

    return artistsData;
  }

  getTopGenres(likedTracks: any[], topN: number) {
    // Create a map of genres to counts
    const genresMap: { [key: string]: number } = {};
    likedTracks.forEach((track) => {
      track.genres.forEach((genre: string) => {
        genresMap[genre] = genresMap[genre] ? genresMap[genre] + 1 : 1;
      });
    });

    // Sort genres by count
    const genres = Object.keys(genresMap);
    genres.sort((a, b) => genresMap[b] - genresMap[a]);

    // Return top N genres
    return genres.slice(0, topN);
  }

  filterSongsByGenres(likedTracks: any[], genres: Set<string>) {
    return likedTracks.filter((track) => {
      const trackGenres = new Set(track.genres);
      return [...genres].every((genre) => trackGenres.has(genre));
    });
  }

  setFilteredSongs(filteredSongs: any[]) {
    localStorage.setItem('filteredSongs', JSON.stringify(filteredSongs));
  }

  getFilteredSongs(): any[] {
    const filteredSongs = localStorage.getItem('filteredSongs');
    return filteredSongs ? JSON.parse(filteredSongs) : [];
  }
}
