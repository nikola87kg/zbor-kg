import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
  animateChild,
  group,
} from '@angular/animations';

/** Page container: fades + slides up on enter */
export const pageAnimation = trigger('pageAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('350ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'none' })),
  ]),
]);

/** Card grid: staggers children in on data load */
export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        stagger('55ms', [
          animate(
            '280ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({ opacity: 1, transform: 'none' }),
          ),
        ]),
      ],
      { optional: true },
    ),
  ]),
]);

/** Single item fade+slide in (detail pages, form cards) */
export const fadeSlideIn = trigger('fadeSlideIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(24px)' }),
    animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'none' })),
  ]),
]);

/** Home nav buttons stagger */
export const navStagger = trigger('navStagger', [
  transition(':enter', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'scale(0.92)' }),
        stagger('70ms', [
          animate(
            '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            style({ opacity: 1, transform: 'none' }),
          ),
        ]),
      ],
      { optional: true },
    ),
  ]),
]);
