import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongsComponent } from './songs.component';

@NgModule({
  declarations: [
    SongsComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SongsComponent
  ]
})
export class SongsModule { }
