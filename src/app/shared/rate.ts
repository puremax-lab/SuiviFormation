import { Component, computed, input } from '@angular/core';

/** Attendance rate shown as a coloured pill: green, orange under 90 %, red under 75 %. */
@Component({
  selector: 'app-rate',
  template: `<span class="rate" [class]="level()">{{
    value() === null ? '—' : value() + ' %'
  }}</span>`,
})
export class Rate {
  readonly value = input.required<number | null>();

  protected readonly level = computed(() => {
    const value = this.value();
    if (value === null) {
      return 'rate-none';
    }
    return value >= 90 ? 'rate-good' : value >= 75 ? 'rate-warn' : 'rate-bad';
  });
}
