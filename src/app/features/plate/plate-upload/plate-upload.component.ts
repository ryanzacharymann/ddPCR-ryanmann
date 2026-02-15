import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlateService } from '@ddpcr-core/services';

@Component({
    selector: 'plate-upload',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="upload-container">
      <label for="file-upload" class="custom-label">Upload Plate JSON</label>
      <input 
        #fileInput
        id="file-upload"
        type="file" 
        accept=".json" 
        (change)="onFileSelected($event, fileInput)" 
      />
    </div>
  `,
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