import { ChangeDetectionStrategy, Component, inject, Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { PlateSummary } from "@ddpcr-core/models";
import { PlateService } from "@ddpcr-core/services";

@Component({
    selector: 'plate-summary',
    templateUrl: './plate-summary.component.html',
    styleUrls: ['./plate-summary.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlateSummaryComponent {
    private readonly plateService = inject(PlateService);

    protected readonly summary: Signal<PlateSummary> = toSignal(this.plateService.getPlateSummary(), {
        initialValue: { totalWells: 0, totalLowDroplets: 0 }
    });
}
