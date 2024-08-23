import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'search-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  @Output() searchQuery = new EventEmitter<string>();
  @ViewChild('txtQuery')
  txtQuery!: ElementRef;
  private debounceTimer?: NodeJS.Timeout

  closeSearchBar(input: HTMLInputElement) {
    input.value = '';
  }
  searchBoardGame(query: string) {

    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.searchQuery.emit(query);
    }, 600);
  }
}
