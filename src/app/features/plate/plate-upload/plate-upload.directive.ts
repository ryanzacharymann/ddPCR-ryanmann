import { Directive, output, signal } from '@angular/core';

@Directive({
    selector: '[plateDragDrop]',
    standalone: true,
    host: {
        '[class.fileover]': 'fileOver()',
        '(dragover)': 'onDragOver($event)',
        '(dragleave)': 'onDragLeave($event)',
        '(drop)': 'onDrop($event)'
    }
})
export class PlateDragDropDirective {
    public readonly onFileDropped = output<FileList>();
    private readonly _fileOver = signal(false);

    public get fileOver() {
        return this._fileOver.asReadonly();
    }

    protected onDragOver(evt: DragEvent): void {
        evt.preventDefault();
        evt.stopPropagation();
        this._fileOver.set(true);
    }

    protected onDragLeave(evt: DragEvent): void {
        evt.preventDefault();
        evt.stopPropagation();
        this._fileOver.set(false);
    }

    protected onDrop(evt: DragEvent): void {
        evt.preventDefault();
        evt.stopPropagation();
        this._fileOver.set(false);

        const files = evt.dataTransfer?.files;
        if (files && files.length > 0) {
            this.onFileDropped.emit(files);
        }
    }
}