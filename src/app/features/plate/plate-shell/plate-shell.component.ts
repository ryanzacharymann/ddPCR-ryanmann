import { ChangeDetectionStrategy, Component } from "@angular/core";
import { PlateUploadComponent } from "../plate-upload/plate-upload.component";
import { PlateGridComponent } from "../plate-grid/plate-grid.component";

@Component({
    selector: 'plate-shell',
    imports: [
        PlateUploadComponent,
        PlateGridComponent
    ],
    templateUrl: './plate-shell.component.html',
    styleUrls: ['./plate-shell.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlateShellComponent {

}
