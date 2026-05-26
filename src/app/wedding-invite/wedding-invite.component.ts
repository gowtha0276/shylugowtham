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
  showCountdown = false;
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
    'assets/10.webp',
    'assets/20.webp',
    'assets/30.jpeg',
    'assets/40.webp',
    'assets/50.webp',
    'assets/70.webp',
    'assets/80.webp',
    'assets/90.webp',
    'assets/100.webp',
    'assets/110.jpeg',
    'assets/120.webp',
    'assets/130.webp',
  ];
  selectedImage: string | null = null;
  private preloadedImages: HTMLImageElement[] = [];

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.body.style.overflowY = 'hidden';

    this.preloadGalleryImages();
    this.updateCountdown();
    setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  preloadGalleryImages(): void {
    this.preloadedImages = this.images.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
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
    if (!this.isOpen) {
      this.showCountdown = false;
      return;
    }

    const scrollTop = window.scrollY;
    const spacerHeight = window.innerHeight;
    const countdownTrigger = spacerHeight * 0.85;

    this.showCountdown = scrollTop > countdownTrigger;
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