import { Component, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { PlateDragDropDirective } from './plate-upload.directive';
import { PlateService } from '@ddpcr-core/services';

@Component({
    selector: 'plate-upload',
    standalone: true,
    imports: [PlateDragDropDirective],
    templateUrl: './plate-upload.component.html',
    styleUrls: ['./plate-upload.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlateUploadComponent {
    private readonly plateService = inject(PlateService);
    private readonly _file = signal<File | null>(null);

    public readonly file = this._file.asReadonly();
    public readonly hasFile = computed(() => !!this._file());

    // Parameter is strictly typed as FileList
    public onFileDropped(files: FileList): void {
        const firstFile = files.item(0);
        if (firstFile) {
            this.handleFile(firstFile);
        }
    }

    public fileBrowseHandler(event: Event): void {
        const element = event.target as HTMLInputElement;
        const firstFile = element.files?.item(0);
        if (firstFile) {
            this.handleFile(firstFile);
        }
    }

    private async handleFile(file: File): Promise<void> {
        // Keep the light-weight type check in the component 
        // to give immediate feedback before processing.
        const isJson = file.type === 'application/json' || file.name.endsWith('.json');
        if (!isJson) {
            console.error('Invalid file type.');
            return;
        }

        try {
            await this.plateService.uploadPlateFile(file);
            this._file.set(file); // Update local state only on success
        } catch (err) {
            // Handle UI-specific error logic here (e.g., Toast notifications)
            this._file.set(null);
        }
    }

    protected clearFile(): void {
        this._file.set(null);
        this.plateService.setWells([]);
    }
}