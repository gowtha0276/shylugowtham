import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-wedding-invite',
  templateUrl: './wedding-invite.component.html',
  styleUrls: ['./wedding-invite.component.scss'],
  standalone: true
})
export class WeddingInviteComponent implements OnInit, OnDestroy {
  isOpen = false;
  scrollProgress = 0;
  showCountdown = false;
  scrollPhase = 0; // 0: Hero, 1-2: Zoom, 3+: Countdown
  
  // Countdown values
  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.body.style.overflowY = 'hidden';

    this.updateCountdown();
    setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  ngOnDestroy(): void {
    document.body.style.overflowY = 'auto';
  }

  openCurtain(): void {
    this.isOpen = true;
    document.body.style.overflowY = 'auto';

    setTimeout(() => {
      const contentBox = document.querySelector('.content');
      if (contentBox) {
        contentBox.classList.add('show');
      }
    }, 1800);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    // Only process scroll if the curtain has been opened
    if (!this.isOpen) {
      this.showCountdown = false;
      return;
    }

    const scrollTop = window.scrollY;
    const spacerHeight = window.innerHeight; // One viewport height for zoom phase
    const countdownTrigger = spacerHeight * 1.5; // Trigger after about one and a half viewport heights
    const maxZoomScreens = 2;
    
    // Calculate zoom progress (0-2 scrolls = first 2 viewport heights)
    const zoomScrollProgress = Math.min(scrollTop / spacerHeight, maxZoomScreens);
    this.scrollPhase = Math.floor(zoomScrollProgress);
    
    // Apply zoom effect to background (0.3 scale over 2 viewport heights)
    const zoomLevel = 1 + zoomScrollProgress * 0.15;
    const bgImage = document.querySelector('.background-image') as HTMLElement;
    if (bgImage) {
      bgImage.style.transform = `scale(${zoomLevel})`;
    }

    // Apply text fade out as you scroll
    const content = document.querySelector('.content') as HTMLElement;
    if (content) {
      const opacity = Math.max(1 - zoomScrollProgress * 0.35, 0.3);
      content.style.opacity = opacity.toString();
      const scale = Math.max(1 - zoomScrollProgress * 0.05, 0.9);
      content.style.transform = `scale(${scale})`;
    }

    // Release main-container from fixed positioning after parallax
    const mainContainer = document.querySelector('.main-container') as HTMLElement;
    if (mainContainer) {
      if (scrollTop > countdownTrigger) {
        mainContainer.style.position = 'absolute';
        mainContainer.style.top = '0';
        mainContainer.style.zIndex = '1';
        mainContainer.style.pointerEvents = 'none';
        mainContainer.style.visibility = 'hidden';
        mainContainer.style.opacity = '0';
      } else {
        mainContainer.style.position = 'fixed';
        mainContainer.style.zIndex = '10';
        mainContainer.style.pointerEvents = 'auto';
        mainContainer.style.visibility = 'visible';
        mainContainer.style.opacity = '1';
      }
    }

    // Show countdown after scrolling (trigger earlier for better visibility)
    if (scrollTop > countdownTrigger) {
      this.showCountdown = true;
    } else {
      this.showCountdown = false;
    }
  }

  updateCountdown(): void {
    const weddingDate = new Date('June 18, 2026 07:00:00').getTime();
    const now = new Date().getTime();
    const gap = weddingDate - now;

    this.days = Math.floor(gap / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((gap % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.minutes = Math.floor((gap % (1000 * 60 * 60)) / (1000 * 60));
    this.seconds = Math.floor((gap % (1000 * 60)) / 1000);
  }
}