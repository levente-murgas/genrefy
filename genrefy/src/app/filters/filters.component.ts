import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FiltersService } from './filters.service';


@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css'],
})
export class FiltersComponent implements OnInit {
  accessToken: string | null = null;
  likedTracks: any[] = [];
  @Input() topGenres: string[] = [];
  @Input() selectedGenres: Set<string> = new Set();
  @Input() filteredSongCount: number = 0;
  filteredSongs: any[] = [];

  constructor(private filtersService: FiltersService, private router: Router) {}

  async ngOnInit() {
    this.accessToken = localStorage.getItem('access_token');
    this.likedTracks = await this.filtersService.fetchLikedTracksWithGenres(this.accessToken!!);
    this.filteredSongCount = this.likedTracks.length;
    this.topGenres = this.filtersService.getTopGenres(this.likedTracks, 9);
  }

  onGenreToggle(genre: string) {
    if (this.selectedGenres.has(genre)) { 
      this.selectedGenres.delete(genre);
    } else {
      this.selectedGenres.add(genre);
    }

    this.filteredSongs = this.filtersService.filterSongsByGenres(this.likedTracks, this.selectedGenres);
    this.filteredSongCount = this.filteredSongs.length;
  }

  onShowResult() {
    this.filtersService.setFilteredSongs(this.filteredSongs);
    this.router.navigate(['/songs']);
  }
}
