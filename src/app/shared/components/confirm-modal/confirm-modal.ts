import { Component, Input, output } from '@angular/core';
import { ActionButton } from '../../ui/action-button/action-button';

@Component({
  selector: 'app-confirm-modal',
  imports: [ActionButton],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
})
export class ConfirmModal {
  private static nextInstanceId = 0;

  private readonly instanceId = ConfirmModal.nextInstanceId++;

  protected readonly titleId = `app-confirm-modal-title-${this.instanceId}`;
  protected readonly messageId = `app-confirm-modal-desc-${this.instanceId}`;

  @Input() visible = false;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) message!: string;
  @Input({ required: true }) confirmLabel!: string;
  @Input({ required: true }) cancelLabel!: string;
  @Input() iconClass = 'pi pi-exclamation-triangle';

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected onBackdropClick(): void {
    this.cancelled.emit();
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }

  protected onConfirm(): void {
    this.confirmed.emit();
  }
}
