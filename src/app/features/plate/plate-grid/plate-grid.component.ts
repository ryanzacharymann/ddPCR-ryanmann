import { Component, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { PlateService } from "@ddpcr-core/services";

@Component({
    selector: 'plate-grid',
    templateUrl: './plate-grid.component.html',
    styleUrls: ['./plate-grid.component.scss']
})
export class PlateGridComponent {
    private readonly plateService = inject(PlateService);
    public readonly wells = toSignal(this.plateService.getWells(), {
        initialValue: []
    });
}
