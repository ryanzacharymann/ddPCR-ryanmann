import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { PlateService } from '@ddpcr-core/services';
import { DEFAULT_THRESHOLD, MAX_THRESHOLD, MIN_THRESHOLD } from '@ddpcr-core/models';

@Component({
    selector: 'plate-threshold',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './plate-threshold.component.html',
    styleUrl: './plate-threshold.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlateThresholdComponent {
    private readonly plateService = inject(PlateService);

    protected readonly thresholdControl = new FormControl<number>(DEFAULT_THRESHOLD, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(MIN_THRESHOLD), Validators.max(MAX_THRESHOLD)]
    });

    protected readonly currentThreshold = toSignal(this.plateService.getThreshold(), { initialValue: DEFAULT_THRESHOLD });

    constructor() {
        effect(() => {
            const value = this.currentThreshold();
            this.thresholdControl.setValue(value, { emitEvent: false });
        });
    }

    protected updateThreshold(): void {
        if (this.thresholdControl.valid) {
            this.plateService.setThreshold(this.thresholdControl.value);
        }
    }
}