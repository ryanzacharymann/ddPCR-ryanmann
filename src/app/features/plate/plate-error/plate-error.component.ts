import { ChangeDetectionStrategy, Component, inject, Signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { PlateService } from "@ddpcr-core/services";

@Component({
    selector: 'plate-error',
    templateUrl: './plate-error.component.html',
    styleUrls: ['./plate-error.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlateErrorComponent {
    private readonly plateService = inject(PlateService);

    protected readonly error: Signal<string | null> = toSignal(this.plateService.getError(), { initialValue: null });
}
