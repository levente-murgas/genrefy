import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SongsService } from './songs.service';
import { FiltersService } from '../filters/filters.service';
import { MatDialog } from '@angular/material/dialog';
import { PlaylistNameDialogComponent } from '../playlist-name-dialog/playlist-name-dialog.component';


@Component({
  selector: 'app-songs',
  templateUrl: './songs.component.html',
  styleUrls: ['./songs.component.css'],
})
export class SongsComponent implements OnInit {
  accessToken: string | null = null;
  numberOfSongs: number = 0;
  songs: any[] = [];
  isLoading: boolean = false;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private songsService: SongsService,
    private filtersService: FiltersService
  ) {}

  async ngOnInit() {
    console.log('SongsComponent.ngOnInit() called');
    this.songs = this.filtersService.getFilteredSongs();
    if (this.songs.length === 0) { 
      this.accessToken = localStorage.getItem('access_token');
      // Remove the code from the URL
      const queryParams = this.route.snapshot.queryParams;
      if (queryParams && queryParams['code']) {
        this.router.navigate([], { queryParams: { code: null }, queryParamsHandling: 'merge' });
      }
      this.songs = this.songsService.getLikedTracksFromLocalStorage();
      if (this.songs.length === 0) {
        if (this.accessToken) {
          this.isLoading = true;
          this.songs = await this.songsService.fetchLikedTracks(this.accessToken);
          console.log(this.songs)
          this.numberOfSongs = this.songs.length;
          this.isLoading = false;
        } else {
          console.log('No access token found');
        }
      } else {
        this.numberOfSongs = this.songs.length;
        this.isLoading = false;
      }
    } else {
      this.numberOfSongs = this.songs.length;
      this.isLoading = false;
    }
  }

  savePlaylist(playlistName: string): void {
    this.accessToken = localStorage.getItem('access_token');
    console.log(this.songs)
    this.songsService.createPlaylist(this.accessToken!!, playlistName).subscribe(response => {
      const playlistId = response.id;
      const trackUris = this.songs.map(song => song.uri);
  
      this.songsService.addTracksToPlaylist(this.accessToken!!, playlistId, trackUris).subscribe(() => {
        console.log('Playlist created and tracks added');
      });
    });
  }
  openPlaylistNameDialog(): void {
    const dialogRef = this.dialog.open(PlaylistNameDialogComponent, {
      width: '300px',
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.savePlaylist(result);
      }
    });
  }
  

  navigateToFilters(): void {
    this.router.navigate(['/filters']); // Navigate to filters page
  }

}
