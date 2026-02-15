import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlateService } from '@ddpcr-core/services';

@Component({
    selector: 'plate-upload',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './plate-upload.component.html',
    styleUrls: ['./plate-upload.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlateUploadComponent {
    private readonly plateService = inject(PlateService);

    protected onFileSelected(event: Event, input: HTMLInputElement): void {
        const file = input.files?.[0];

        if (file) {
            this.plateService.uploadPlateFile(file);
            input.value = '';
        }
    }
}