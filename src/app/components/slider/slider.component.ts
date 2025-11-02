import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit, OnDestroy {
  slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=400&fit=crop',
      title: 'الكيك الفاخر',
      description: 'أفضل أنواع الكيك بأسعار مميزة'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd64e4b?w=1200&h=400&fit=crop',
      title: 'الحلويات الشرقية',
      description: 'حلويات تقليدية بطعم لا يُنسى'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1599599810964-b5f7e5e6e5e5?w=1200&h=400&fit=crop',
      title: 'الشوكولاتة الممتازة',
      description: 'شوكولاتة بلجيكية فاخرة'
    }
  ];

  currentSlide = 0;
  autoSlideInterval: any;

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }
}

