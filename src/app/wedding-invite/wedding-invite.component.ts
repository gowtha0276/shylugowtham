import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-wedding-invite',
  templateUrl: './wedding-invite.component.html',
  styleUrls: ['./wedding-invite.component.scss'],
  standalone: true
})
export class WeddingInviteComponent implements OnInit {
  isOpen = false;
  scrollProgress = 0;
  showCountdown = false;
  
  // Countdown values
  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;

  ngOnInit(): void {
    this.updateCountdown();
    setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  openCurtain(): void {
    this.isOpen = true;

    setTimeout(() => {
      const contentBox = document.querySelector('.content');
      if (contentBox) {
        contentBox.classList.add('show');
      }
    }, 1800);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = (scrollTop / docHeight) * 100;

    // Apply zoom effect to background (parallax)
    const zoomLevel = 1 + (this.scrollProgress / 100) * 0.3;
    const bgImage = document.querySelector('.background-image') as HTMLElement;
    if (bgImage) {
      bgImage.style.transform = `scale(${zoomLevel})`;
    }

    // Show countdown after scrolling past the parallax phase
    if (this.scrollProgress > 30) {
      this.showCountdown = true;
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