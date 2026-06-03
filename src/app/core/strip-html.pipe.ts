import { Pipe, PipeTransform } from '@angular/core';

const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

@Pipe({ name: 'stripHtml', pure: true })
export class StripHtmlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return value
      .replace(/<[^>]*>/g, ' ')
      .replace(/&[a-z#0-9]+;/gi, entity => HTML_ENTITIES[entity] ?? ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
}
