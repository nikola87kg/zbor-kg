import { Component, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from '../core/auth.service';
import { Subscription } from 'rxjs';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  requiresAuth?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnDestroy {
  readonly auth = inject(AuthService);
  readonly isMobile = signal(false);
  readonly isOpen = signal(true);

  private readonly bpSub: Subscription;

  readonly navItems: NavItem[] = [
    { label: 'Почетна', route: '/', icon: 'home' },
    { label: 'Вести', route: '/vesti', icon: 'newspaper' },
    { label: 'Календар', route: '/kalendar', icon: 'calendar_today' },
    { label: 'Акције', route: '/akcije', icon: 'campaign' },
    { label: 'Афере', route: '/afere', icon: 'gavel' },
    { label: 'Пријава проблема', route: '/prijava-problema', icon: 'report_problem' },
    { label: 'Проблеми', route: '/prijavljeni-problemi', icon: 'list_alt' },
  ];

  constructor() {
    const observer = inject(BreakpointObserver);
    this.bpSub = observer.observe('(max-width: 599px)').subscribe((result) => {
      this.isMobile.set(result.matches);
      // On mobile start closed; on desktop start open
      this.isOpen.set(!result.matches);
    });
  }

  ngOnDestroy(): void {
    this.bpSub.unsubscribe();
  }

  toggle(): void {
    this.isOpen.update((open) => !open);
  }

  closeIfMobile(): void {
    if (this.isMobile()) this.isOpen.set(false);
  }
}
