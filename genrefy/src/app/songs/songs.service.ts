// src/app/songs/songs.service.ts
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SongsService {
  constructor(private http: HttpClient) {}

  async fetchLikedTracks(accessToken: string): Promise<any[]> {
    let offset = 0;
    const limit = 50;
    let songs: any[] = [];
    let hasNext = true;

    while (hasNext) {
      const chunk = await this.fetchLikedTracksChunk(accessToken, limit, offset);
      hasNext = chunk.next !== null;
      offset += limit;
      const extractedData = chunk.items.map((item: any) => {
        const songName = item.track.name;
        const artistName = item.track.artists[0].name;
        const artistId = item.track.artists[0].id;
        const uri = item.track.uri 

        return { songName, artistName, artistId, uri };
      });
      songs = songs.concat(extractedData);
    }
    localStorage.setItem('songs', JSON.stringify(songs));
    return songs;
  }

  getLikedTracksFromLocalStorage(): any[] {
    const songs = localStorage.getItem('songs');
    return songs ? JSON.parse(songs) : [];
  }

  private async fetchLikedTracksChunk(
    accessToken: string,
    limit: number,
    offset: number
  ): Promise<any> {
    const url = `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });


    return await response.json();
  }

  createPlaylist(accessToken:string, playlistName: string): Observable<any> {
    const userId = localStorage.getItem('user_id');
    const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
    const body = {
      name: playlistName
    };
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + accessToken
      })
    };
  
    return this.http.post(url, body, options);
  }

  addTracksToPlaylist(accessToken:string, playlistId: string, trackUris: string[]): Observable<any> {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    const body = {
      uris: trackUris
    };
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + accessToken
      })
    };
  
    return this.http.post(url, body, options);
  }

}

