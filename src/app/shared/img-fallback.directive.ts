import { Directive, ElementRef, Input, OnChanges, Renderer2, inject } from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]',
  standalone: true,
  host: { '(error)': 'onError()' },
})
export class ImgFallbackDirective implements OnChanges {
  @Input() appImgFallback: string | null | undefined;

  private readonly el = inject(ElementRef<HTMLImageElement>);
  private readonly renderer = inject(Renderer2);
  private readonly fallbackSrc = '/images/zbor-logo-veliki.png';

  ngOnChanges(): void {
    if (this.appImgFallback) {
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.appImgFallback);
      this.renderer.removeClass(this.el.nativeElement, 'img-fallback');
    } else {
      this.showFallback();
    }
  }

  onError(): void {
    if (!this.el.nativeElement.classList.contains('img-fallback')) {
      this.showFallback();
    }
  }

  private showFallback(): void {
    this.renderer.setAttribute(this.el.nativeElement, 'src', this.fallbackSrc);
    this.renderer.addClass(this.el.nativeElement, 'img-fallback');
  }
}
