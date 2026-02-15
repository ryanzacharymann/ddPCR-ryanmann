import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlateShellComponent } from "@ddpcr-feature/plate";

@Component({
    selector: 'app-root',
    templateUrl: './app.html',
    styleUrl: './app.scss',
    imports: [PlateShellComponent],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
}
