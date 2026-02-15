import { ChangeDetectionStrategy, Component } from "@angular/core";
import { PlateUploadComponent } from "./plate-upload/plate-upload.component";
import { PlateGridComponent } from "./plate-grid/plate-grid.component";
import { PlateSummaryComponent } from "./plate-summary/plate-summary.component";
import { PlateThresholdComponent } from "./plate-threshold/plate-threshold.component";
import { PlateErrorComponent } from "./plate-error/plate-error.component";

@Component({
    selector: 'plate-shell',
    imports: [
        PlateUploadComponent,
        PlateGridComponent,
        PlateSummaryComponent,
        PlateThresholdComponent,
        PlateErrorComponent
    ],
    templateUrl: './plate.component.html',
    styleUrls: ['./plate.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlateShellComponent {

}
