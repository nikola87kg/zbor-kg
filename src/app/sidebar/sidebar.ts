import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/auth.service';

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
export class Sidebar {
  readonly auth = inject(AuthService);
  readonly isOpen = signal(true);

  readonly navItems: NavItem[] = [
    { label: 'Вести', route: '/vesti', icon: 'newspaper' },
    { label: 'Календар', route: '/kalendar', icon: 'calendar_today', requiresAuth: true },
    { label: 'Акције', route: '/akcije', icon: 'campaign', requiresAuth: true },
    { label: 'Афере', route: '/afere', icon: 'gavel' },
  ];

  toggle(): void {
    this.isOpen.update(open => !open);
  }
}
