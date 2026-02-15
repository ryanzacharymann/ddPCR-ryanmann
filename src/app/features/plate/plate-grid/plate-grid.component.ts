import { ChangeDetectionStrategy, Component, computed, inject, Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { PlateConfig } from "@ddpcr-core/models";
import { PlateService } from "@ddpcr-core/services";

@Component({
    selector: 'plate-grid',
    templateUrl: './plate-grid.component.html',
    styleUrls: ['./plate-grid.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlateGridComponent {
    private readonly plateService = inject(PlateService);
    protected readonly plateConfig: Signal<PlateConfig | undefined> = toSignal(
        this.plateService.getPlateConfig()
    );
    protected readonly gridReady: Signal<boolean> = computed(() => {
        const conf = this.plateConfig();
        return !!(
            conf &&
            conf.wells.length > 0 &&
            conf.columns.length > 0 &&
            conf.rows.length > 0
        );
    });
}
