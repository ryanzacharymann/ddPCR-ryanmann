import { ChangeDetectionStrategy, Component, inject, Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Well } from "@ddpcr-core/models";
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
}
