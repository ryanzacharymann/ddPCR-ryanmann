import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { PlateDropletResponse, THRESHOLD_STORAGE_KEY, Well, WELLS_STORAGE_KEY } from '@ddpcr-core/models';

@Injectable({
    providedIn: 'root'
})
export class PlateService {
    // BehaviorSubject to store raw data
    private readonly rawData$ = new BehaviorSubject<Well[]>(this.loadFromStorage(WELLS_STORAGE_KEY, []));
    private readonly threshold$ = new BehaviorSubject<number>(this.loadFromStorage(THRESHOLD_STORAGE_KEY, 100));

    // BehaiorSubject to store processed data
    private readonly processed$ = combineLatest([
        this.rawData$,
        this.threshold$
    ]).pipe(
        map(([wells, threshold]) => this.transformData(wells, threshold))
    );

    // Well Methods
    public storeWells(data: Well[]): void {
        const wrapper: PlateDropletResponse = {
            PlateDropletInfo: {
                Version: 1,
                DropletInfo: {
                    Version: 1,
                    Wells: data
                }
            }
        };
        localStorage.setItem(WELLS_STORAGE_KEY, JSON.stringify(wrapper));
        this.rawData$.next(data);
    }

    public getWells(): Observable<Well[]> {
        return this.processed$;
    }

    public setWells(data: Well[]): void {
        this.rawData$.next(data);
    }

    // Threshold Methods
    public getThreshold(): Observable<number> {
        return this.threshold$;
    }

    public setThreshold(value: number): void {
        this.threshold$.next(value);
    }

    private transformData(wells: Well[], threshold: number): Well[] {
        return wells.map(well => ({
            ...well,
            isNormal: well.DropletCount >= threshold
        }));
    }

    // Local Storage Helper
    private loadFromStorage<T>(key: string, defaultValue: T): T {
        const stored = localStorage.getItem(key);
        try {
            if (!stored) return defaultValue;
            const parsed = JSON.parse(stored);

            // Check if the parsed object is the nested response or the raw array
            if (parsed?.PlateDropletInfo?.DropletInfo?.Wells) {
                return parsed.PlateDropletInfo.DropletInfo.Wells as unknown as T;
            }

            return parsed;
        } catch (e) {
            console.error(`Error parsing storage key: ${key}`, e);
            return defaultValue;
        }
    }
}