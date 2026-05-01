import { Component, HostListener, OnDestroy, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var confetti: any;

@Component({
  selector: 'app-wedding-invite',
  templateUrl: './wedding-invite.component.html',
  styleUrls: ['./wedding-invite.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class WeddingInviteComponent implements OnInit, AfterViewInit, OnDestroy {
  isOpen = false;
  scrollProgress = 0;
  showCountdown = false;
  scrollPhase = 0; // 0: Hero, 1-2: Zoom, 3+: Countdown
  scratchCompleted = false;
  private scratchCtx: CanvasRenderingContext2D | null = null;
  private isScratching = false;
  private scratchRadius = 26;
  private scratchPoints = 0;
  private onResize = () => this.resizeScratchCanvas();

  @ViewChild('scratchCanvas') scratchCanvas!: ElementRef<HTMLCanvasElement>;
  
  // Countdown values
  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;
  images = [
    'assets/couple2.webp',
    'assets/couple3.webp',
    'assets/couple4.webp',
    'assets/couple2.webp',
    'assets/couple3.webp',
    'assets/couple4.webp',
    'assets/couple2.webp',
    'assets/couple3.webp',
    'assets/couple4.webp',
    'assets/couple2.webp'
  ];
  selectedImage: string | null = null;

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.body.style.overflowY = 'hidden';

    this.updateCountdown();
    setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  ngAfterViewInit(): void {
    this.initializeScratchCanvas();
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
    document.body.style.overflowY = 'auto';
    window.removeEventListener('resize', this.onResize);
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

  initializeScratchCanvas(): void {
    const canvas = this.scratchCanvas?.nativeElement;
    if (!canvas) {
      return;
    }

    this.scratchCtx = canvas.getContext('2d');
    this.resizeScratchCanvas();
  }

  private resizeScratchCanvas(): void {
    const canvas = this.scratchCanvas?.nativeElement;
    if (!canvas || !this.scratchCtx) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    this.scratchCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.scratchCtx.lineCap = 'round';
    this.scratchCtx.lineJoin = 'round';
    this.fillScratchOverlay();
  }

  private fillScratchOverlay(): void {
    if (!this.scratchCtx || !this.scratchCanvas) {
      return;
    }

    this.scratchPoints = 0;
    const canvas = this.scratchCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();

    this.scratchCtx.globalCompositeOperation = 'source-over';
    this.scratchCtx.fillStyle = 'rgba(209, 179, 117, 0.95)';
    this.scratchCtx.fillRect(0, 0, rect.width, rect.height);
    this.scratchCtx.globalCompositeOperation = 'destination-out';
  }

  startScratch(event: PointerEvent): void {
    if (this.scratchCompleted || !this.scratchCtx) {
      return;
    }

    this.isScratching = true;
    const point = this.getCanvasPoint(event);
    this.drawScratchPoint(point.x, point.y);
    (event.target as HTMLCanvasElement)?.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  scratchMove(event: PointerEvent): void {
    if (!this.isScratching || this.scratchCompleted || !this.scratchCtx) {
      return;
    }

    const point = this.getCanvasPoint(event);
    this.drawScratchPoint(point.x, point.y);
  }

  endScratch(): void {
    if (!this.isScratching) {
      return;
    }

    this.isScratching = false;
    this.checkScratchComplete();
  }

  private getCanvasPoint(event: PointerEvent): { x: number; y: number } {
    const canvas = this.scratchCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  private drawScratchPoint(x: number, y: number): void {
    if (!this.scratchCtx) {
      return;
    }

    this.scratchPoints += 1;
    this.scratchCtx.beginPath();
    this.scratchCtx.arc(x, y, this.scratchRadius, 0, Math.PI * 2);
    this.scratchCtx.fill();

    if (this.scratchPoints >= 4) {
      this.checkScratchComplete();
    }
  }

  private checkScratchComplete(): void {
    if (!this.scratchCtx || !this.scratchCanvas) {
      return;
    }

    const canvas = this.scratchCanvas.nativeElement;
    const imageData = this.scratchCtx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let cleared = 0;
    const step = 16;

    for (let i = 3; i < pixels.length; i += step) {
      if (pixels[i] === 0) {
        cleared++;
      }
    }

    const total = pixels.length / step;
    if (cleared / total > 0.5 || this.scratchPoints >= 8) {
      this.completeScratch();
    }
  }

  private completeScratch(): void {
    if (!this.scratchCtx || !this.scratchCanvas) {
      return;
    }

    const canvas = this.scratchCanvas.nativeElement;
    this.scratchCtx.clearRect(0, 0, canvas.width, canvas.height);
    this.scratchCompleted = true;

    this.triggerConfetti();
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
    const countdownTrigger = spacerHeight * 0.85; // Trigger before one full viewport scroll
    const maxZoomScreens = 1;
    
    // Calculate zoom progress (0-1 scroll = first viewport height)
    const zoomScrollProgress = Math.min(scrollTop / spacerHeight, maxZoomScreens);
    this.scrollPhase = Math.floor(zoomScrollProgress + 0.01);
    
    // Apply zoom effect to background (0.2 scale over 1 viewport height)
    const zoomLevel = 1 + zoomScrollProgress * 0.2;
    const bgImage = document.querySelector('.background-image') as HTMLElement;
    if (bgImage) {
      bgImage.style.transform = `scale(${zoomLevel})`;
    }

    // Apply text fade out as you scroll
    const content = document.querySelector('.content') as HTMLElement;
    if (content) {
      const opacity = Math.max(1 - zoomScrollProgress * 0.8, 0.15);
      content.style.opacity = opacity.toString();
      const scale = Math.max(1 - zoomScrollProgress * 0.08, 0.9);
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

  private triggerConfetti(): void {
    const cardElement = this.scratchCanvas.nativeElement.closest('.scratch-card') as HTMLElement;
    if (!cardElement) return;

    const rect = cardElement.getBoundingClientRect();
    const originX = (rect.left + rect.width / 2) / window.innerWidth;
    const originY = (rect.top + rect.height / 2) / window.innerHeight;

    let count = 0;
    const interval = setInterval(() => {
      confetti({
        particleCount: 80,
        spread: 120,
        startVelocity: 55,
        origin: { x: originX, y: originY }
      });

      confetti({
        particleCount: 40,
        spread: 200,
        startVelocity: 70,
        origin: { x: originX, y: originY }
      });

      count++;
      if (count > 5) clearInterval(interval);
    }, 200);
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

  openGalleryImage(image: string): void {
    this.selectedImage = image;
  }

  closeGalleryImage(): void {
    this.selectedImage = null;
  }
}