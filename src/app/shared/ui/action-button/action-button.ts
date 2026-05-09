import { Component, Input, output } from '@angular/core';

export type ActionButtonVariant = 'gray' | 'danger' | 'dangerSoft' | 'green';

@Component({
  selector: 'app-action-button',
  imports: [],
  templateUrl: './action-button.html',
  styleUrl: './action-button.css',
})
export class ActionButton {
  @Input({ required: true }) label!: string;
  @Input() icon?: string;
  @Input() variant: ActionButtonVariant = 'gray';
  @Input() disabled = false;

  readonly clicked = output<void>();

  protected readonly baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-medium transition-opacity disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed';

  protected variantClasses: Record<ActionButtonVariant, string> = {
    gray: 'bg-neutral/30  text-base-content border border-neutral/20 hover:bg-neutral/20 hover: cursor-pointer',
    danger: 'border border-transparent bg-danger text-inverted hover:bg-danger/80 hover: cursor-pointer',
    dangerSoft: 'border border-danger/30 bg-danger/20 text-danger hover:bg-danger/10 hover: cursor-pointer',
    green: 'border border-transparent bg-primary text-secondary hover:bg-primary/80 hover: cursor-pointer',
  };

  protected iconClasses(icon: string): string {
    return `${icon} text-base leading-none`;
  }

  protected onClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
