import { ChangeDetectionStrategy, Component, computed, inject, Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { PLATE_ROW_LABELS, Well } from "@ddpcr-core/models";
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
    public readonly wells: Signal<Well[]> = toSignal(this.plateService.getWells(), {
        initialValue: []
    });

    protected readonly rows = PLATE_ROW_LABELS;

    // Dynamic columns based on file data
    readonly columns = computed(() => {
        const count = this.wells().length === 96 ? 12 : 6;
        return Array.from({ length: count }, (_, i) => i + 1);
    });
}
