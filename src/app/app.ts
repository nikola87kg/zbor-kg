import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthService } from './core/auth.service';
import { ThemeService } from './core/theme.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  requiresAuth?: boolean;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly isOpen = signal(true);

  readonly navItems: NavItem[] = [
    { label: 'Вести', route: '/vesti', icon: 'newspaper' },
    { label: 'Календар', route: '/kalendar', icon: 'calendar_today', requiresAuth: true },
    { label: 'Акције', route: '/akcije', icon: 'campaign', requiresAuth: true },
    { label: 'Афере', route: '/afere', icon: 'gavel' },
  ];

  toggleSidenav(): void {
    this.isOpen.update(open => !open);
  }

  logout(): void {
    this.auth.logout().catch(console.error);
  }
}
