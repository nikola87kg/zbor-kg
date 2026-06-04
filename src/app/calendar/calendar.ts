import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ActionsService } from '../core/actions.service';
import { AuthService } from '../core/auth.service';
import { Action } from '../models';
import { DayDialog } from './day-dialog';

interface CalendarDay {
  day: number;
  hasAction: boolean;
  actions: Action[];
}

@Component({
  selector: 'app-calendar',
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar implements OnInit {
  private readonly actionsService = inject(ActionsService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly viewDate = signal(new Date());

  readonly MONTHS = [
    'Јануар',
    'Фебруар',
    'Март',
    'Април',
    'Мај',
    'Јун',
    'Јул',
    'Август',
    'Септембар',
    'Октобар',
    'Новембар',
    'Децембар',
  ];
  readonly DAY_NAMES = ['Нед', 'Пон', 'Уто', 'Сре', 'Чет', 'Пет', 'Суб'];

  readonly monthLabel = computed(() => {
    const d = this.viewDate();
    return `${this.MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  });

  /** Actions in the currently viewed month, sorted oldest first */
  readonly monthActions = computed(() => {
    const d = this.viewDate();
    return this.actionsService
      .actions()
      .filter((a) => {
        const ad = new Date(a.date);
        return ad.getFullYear() === d.getFullYear() && ad.getMonth() === d.getMonth();
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  /** Calendar grid: null = empty cell, CalendarDay = real day */
  readonly calendarGrid = computed((): (CalendarDay | null)[] => {
    const d = this.viewDate();
    const year = d.getFullYear();
    const month = d.getMonth();

    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const actionsByDay = new Map<number, Action[]>();
    for (const a of this.monthActions()) {
      const dayNum = new Date(a.date).getDate();
      if (!actionsByDay.has(dayNum)) actionsByDay.set(dayNum, []);
      actionsByDay.get(dayNum)!.push(a);
    }

    const cells: (CalendarDay | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const acts = actionsByDay.get(day) ?? [];
      cells.push({ day, hasAction: acts.length > 0, actions: acts });
    }
    return cells;
  });

  readonly today = new Date();

  async ngOnInit(): Promise<void> {
    try {
      await this.actionsService.listActions();
    } catch (e) {
      console.error('Calendar load error:', e);
    } finally {
      this.loading.set(false);
    }
  }

  prevMonth(): void {
    const d = this.viewDate();
    this.viewDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const d = this.viewDate();
    this.viewDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  isToday(day: number): boolean {
    const d = this.viewDate();
    return (
      day === this.today.getDate() &&
      d.getMonth() === this.today.getMonth() &&
      d.getFullYear() === this.today.getFullYear()
    );
  }

  openDayDialog(cell: CalendarDay): void {
    const d = this.viewDate();
    const date = new Date(d.getFullYear(), d.getMonth(), cell.day);
    const months = [
      'јануар',
      'фебруар',
      'март',
      'април',
      'мај',
      'јун',
      'јул',
      'август',
      'септембар',
      'октобар',
      'новембар',
      'децембар',
    ];
    const dateLabel = `${cell.day}. ${months[d.getMonth()]} ${d.getFullYear()}.`;
    this.dialog.open(DayDialog, {
      data: { date, dateLabel, actions: cell.actions },
      width: '400px',
      maxWidth: '95vw',
    });
  }

  openAction(id: string): void {
    this.router.navigate(['/akcije', id]);
  }

  tooltipFor(cell: CalendarDay): string {
    return cell.actions.map((a) => a.title).join('\n');
  }
}
