import { Component, EventEmitter, Output, OnInit, HostListener, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { ScoreEntry } from '../scoreboard/scoreboard';

export type DifficultyLevel = 'Andi' | 'Schuh' | 'Mexxx';

export interface GameSettings {
  audioUrl: string;
  difficulty: DifficultyLevel;
}

@Component({
  selector: 'app-start-screen',
  imports: [CommonModule, FormsModule],
  templateUrl: './start-screen.html',
  styleUrl: './start-screen.css'
})
export class StartScreenComponent implements OnInit, AfterViewInit {
  @Output() startGame = new EventEmitter<GameSettings>();
  @Output() difficultyChange = new EventEmitter<DifficultyLevel>();
  @ViewChildren('accordion0, accordion1, accordion2, accordion3', { read: ElementRef }) accordions!: QueryList<ElementRef<HTMLDetailsElement>>;
  
  audioUrl: string = '';
  isLargeScreen: boolean = false;
  isMediumScreen: boolean = false;
  difficulty: DifficultyLevel = 'Andi';
  difficultyValue: number = 0; // 0 = Andi, 1 = Schuh, 2 = Mexxx
  scoreboard: ScoreEntry[] = [];

  ngOnInit() {
    // Load saved audio URL from localStorage
    const savedAudioUrl = localStorage.getItem('truttihunt-audio-url');
    if (savedAudioUrl) {
      this.audioUrl = savedAudioUrl;
    }
    
    // Load saved difficulty from localStorage
    const savedDifficulty = localStorage.getItem('truttihunt-difficulty') as DifficultyLevel;
    if (savedDifficulty) {
      this.difficulty = savedDifficulty;
      this.difficultyValue = this.getDifficultyValue(savedDifficulty);
    }
    
    // Load scoreboard from localStorage
    this.loadScoreboard();
    
    // Check screen size
    this.checkScreenSize();
  }
  
  ngAfterViewInit() {
    // Auto-expand all accordions on large screens
    this.autoExpandAccordions();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
    this.autoExpandAccordions();
  }

  checkScreenSize() {
    this.isLargeScreen = window.innerWidth >= 900 && window.innerHeight >= 700;
    this.isMediumScreen = window.innerWidth >= 600;
  }
  
  autoExpandAccordions() {
    if (this.isLargeScreen && this.accordions) {
      setTimeout(() => {
        this.accordions.forEach(accordion => {
          if (accordion?.nativeElement) {
            accordion.nativeElement.open = true;
          }
        });
      }, 0);
    }
  }
  
  getRowForAccordion(index: number): number {
    // Calculate row based on current grid layout
    // 2 columns (>= 600px): [0,1] = row 0, [2,3] = row 1
    // 1 column (< 600px): each accordion is its own row
    const columnsPerRow = window.innerWidth >= 600 ? 2 : 1;
    return Math.floor(index / columnsPerRow);
  }
  
  syncRowAccordions(row: number, isOpen: boolean) {
    // Sync all accordions in the specified row to the given state
    const accordionElements = this.accordions.toArray();
    accordionElements.forEach((accordion, i) => {
      if (accordion?.nativeElement && this.getRowForAccordion(i) === row) {
        accordion.nativeElement.open = isOpen;
      }
    });
  }
  
  onAccordionToggle(index: number) {
    if (!this.accordions) return;
    
    const accordionElements = this.accordions.toArray();
    const clickedAccordion = accordionElements[index]?.nativeElement;
    
    if (!clickedAccordion) return;
    
    const clickedRow = this.getRowForAccordion(index);
    const isOpening = clickedAccordion.open;
    
    // On large screens, keep all accordions open
    if (this.isLargeScreen) {
      this.syncRowAccordions(clickedRow, true);
      return;
    }
    
    // Sync all accordions in the same row to match the clicked state
    this.syncRowAccordions(clickedRow, isOpening);
    
    // If opening this row, close all other rows
    if (isOpening) {
      accordionElements.forEach((accordion, i) => {
        if (accordion?.nativeElement) {
          const accordionRow = this.getRowForAccordion(i);
          if (accordionRow !== clickedRow) {
            accordion.nativeElement.open = false;
          }
        }
      });
    }
  }

  getDifficultyValue(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case 'Andi': return 0;
      case 'Schuh': return 1;
      case 'Mexxx': return 2;
    }
  }

  getDifficultyFromValue(value: number): DifficultyLevel {
    switch (value) {
      case 0: return 'Andi';
      case 1: return 'Schuh';
      case 2: return 'Mexxx';
      default: return 'Andi';
    }
  }

  onDifficultyChange() {
    this.difficulty = this.getDifficultyFromValue(this.difficultyValue);
    this.difficultyChange.emit(this.difficulty);
  }

  getDifficultyIcon(difficulty: DifficultyLevel): string {
    switch (difficulty) {
      case 'Andi':
        return '🐔';
      case 'Schuh':
        return '🦃';
      case 'Mexxx':
        return '🔥';
      default:
        return '🐔';
    }
  }

  loadScoreboard() {
    const savedScoreboard = localStorage.getItem('truttihunt-scoreboard');
    if (savedScoreboard) {
      try {
        const loaded = JSON.parse(savedScoreboard);
        // Migrate old entries without difficulty field
        this.scoreboard = loaded.map((entry: any) => ({
          ...entry,
          difficulty: entry.difficulty || 'Andi'
        }));
      } catch (e) {
        this.scoreboard = [];
      }
    } else {
      this.scoreboard = [];
    }
  }

  onStartGame() {
    // Save audio URL to localStorage
    if (this.audioUrl.trim()) {
      localStorage.setItem('truttihunt-audio-url', this.audioUrl.trim());
    } else {
      localStorage.removeItem('truttihunt-audio-url');
    }
    
    // Save difficulty to localStorage
    localStorage.setItem('truttihunt-difficulty', this.difficulty);
    
    this.startGame.emit({
      audioUrl: this.audioUrl,
      difficulty: this.difficulty
    });
  }
}
