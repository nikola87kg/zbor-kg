import { Component, viewChild } from '@angular/core';
import { Toolbar } from './toolbar/toolbar';
import { Sidebar } from './sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [Toolbar, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly sidebar = viewChild.required(Sidebar);
}
