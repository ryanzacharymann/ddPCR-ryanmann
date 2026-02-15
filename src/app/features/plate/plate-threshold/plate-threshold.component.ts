import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PlateService } from '@ddpcr-core/services';

@Component({
    selector: 'plate-threshold',
    standalone: true,
    templateUrl: './plate-threshold.component.html',
    styleUrl: './plate-threshold.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlateThresholdComponent {
    private plateService = inject(PlateService);

    protected currentThreshold = toSignal(this.plateService.getThreshold(), { initialValue: 100 });

    protected updateThreshold(value: string): void {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            this.plateService.setThreshold(numValue);
        }
    }
}