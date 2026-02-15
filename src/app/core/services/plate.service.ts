import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, from, map, Observable, of, take, tap } from 'rxjs';
import { ALLOWED_WELLS, DEFAULT_THRESHOLD, MAX_THRESHOLD, MIN_THRESHOLD, PLATE_ROW_LABELS, PlateConfig, PlateDropletResponse, PlateSummary, Well, WELL_TO_COLUMN_MAP } from '@ddpcr-core/models';

// Feature toggle: enable strict droplet count validation against MIN/MAX thresholds.
// Currently disabled because thresholds are not finalized by product requirements.
const ENABLE_DROPLET_RANGE_VALIDATION = false;

/**
 * PlateService
 *
 * Centralized state and validation service for droplet plate data.
 *
 * Responsibilities:
 * - Accepts and validates uploaded plate JSON files.
 * - Maintains raw well data and manages a user-adjustable droplet threshold.
 * - Derives computed state (classification, summaries, and layout) reactively.
 * - Calculates plate geometry (rows/columns) based on the number of wells detected.
 * - Surfaces validation and parsing errors to consumers via an observable stream.
 *
 * Reactive Model:
 * - `rawData$`: The private source-of-truth for well data.
 * - `threshold$`: A stream for the active droplet threshold, controlled by the consumer.
 * - `processed$`: A derived stream that applies `isNormal` classification to wells based on the threshold.
 * - `plateGridConfig$`: A derived stream that computes the plate layout, including row labels and column counts.
 * - `summary$`: A derived stream computing aggregate metrics (total wells, low droplet counts).
 * - `error$`: A stream emitting the latest validation or parsing error message.
 *
 * Design Notes:
 * - Immutability: All derived state is computed without mutating the source data.
 * - Atomic Updates: File uploads reset errors and update the internal data state in one sequence.
 * - Reactive Sync: Changes to the threshold or raw data automatically propagate through all derived streams.
 * - Single Subscription: Consumers are encouraged to use the public getters to subscribe to state.
 *
 * @providedIn 'root'
 */
@Injectable({
    providedIn: 'root'
})
export class PlateService {
    // BehaviorSubject to store private raw data
    private readonly rawData$ = new BehaviorSubject<Well[]>([]);
    private readonly threshold$ = new BehaviorSubject<number>(DEFAULT_THRESHOLD);

    // BehaiorSubject to store private processed data
    private readonly processed$: Observable<Well[]> = combineLatest([
        this.rawData$,
        this.threshold$
    ]).pipe(
        map(([wells, threshold]) => this.transformData(wells, threshold))
    );

    /** * Derived stream that computes the structural layout of the plate 
     * (rows, columns, and mapped well data) based on the current processed state.
     */
    private readonly plateGridConfig$: Observable<PlateConfig> = this.processed$.pipe(
        map(wells => {
            const count = wells.length;

            // Derive column count from the map, defaulting to 12 if unknown
            const columnCount = WELL_TO_COLUMN_MAP[count] || 12;

            return {
                wells,
                rows: PLATE_ROW_LABELS,
                columns: Array.from({ length: columnCount }, (_, i) => i + 1)
            };
        })
    );

    // BehaviorSubject to store private summary
    private readonly summary$: Observable<PlateSummary> = this.processed$.pipe(
        map(wells => ({
            totalWells: wells.length,
            totalLowDroplets: wells.reduce((acc, well) => acc + (well.isNormal ? 0 : 1), 0)
        }))
    )

    // BehaviorSubject to store private error messages
    private readonly error$ = new BehaviorSubject<string | null>(null);

    /**
     * Uploads and processes a plate JSON file containing droplet well data.
     *
     * - Validates file type and extension (JSON only)
     * - Parses and validates the expected plate structure
     * - Ensures the Wells array length matches supported plate formats
     * - Performs per-well data validation
     * - Updates internal state on success, emits an error message on failure
     *
     * @param file JSON file exported from a plate droplet source
     * @returns Observable emitting the validated Well array, or an empty array on error
     */
    public uploadPlateFile(file: File): Observable<Well[]> {
        // Reset error state and grid immediately
        this.error$.next(null);
        this.rawData$.next([]);

        // 0. Basic file validation (sync, fail fast)
        const isJsonMime =
            file.type === 'application/json' ||
            file.type === 'text/json' ||
            file.type === ''; // some browsers leave this empty

        const hasJsonExtension = file.name.toLowerCase().endsWith('.json');

        if (!isJsonMime || !hasJsonExtension) {
            this.error$.next('Invalid file type. Please upload a JSON file.');
            return of([]);
        }

        return from(file.text()).pipe(
            // 1. Parse the JSON string
            map(text => JSON.parse(text) as PlateDropletResponse),

            // 2. Extract and validate existence
            map(data => {
                const wells = data?.PlateDropletInfo?.DropletInfo?.Wells;
                if (!Array.isArray(wells)) {
                    throw new Error('Invalid JSON structure: Wells array not found');
                }
                return wells;
            }),

            // 3. Dynamic length validation
            map(wells => {
                const length = wells.length;
                if (!ALLOWED_WELLS.includes(length)) {
                    throw new Error(
                        `Invalid JSON structure: Wells array length (${length}) must be one of: ${ALLOWED_WELLS.join(', ')}`
                    );
                }
                return wells;
            }),

            // 4. Well Data Validation
            map(wells => {
                return this.validateWells(wells);
            }),

            // 5. Success: State update
            tap(wells => this.rawData$.next(wells)),

            // 6. Error handling
            catchError(err => {
                console.error('PlateService: Error processing file', err);
                // Update the state with the specific error message
                this.error$.next(err.message);
                return of([]);
            }),
            take(1)
        );
    }

    /**
     * Retrieves the current plate configuration, including processed well data,
     * row labels, and calculated column ranges based on the plate size.
     * * @returns Observable of the PlateConfig.
     */
    public getPlateConfig(): Observable<PlateConfig> {
        return this.plateGridConfig$;
    }

    public getPlateSummary(): Observable<PlateSummary> {
        return this.summary$;
    }

    // Threshold Methods
    public getThreshold(): Observable<number> {
        return this.threshold$;
    }

    public setThreshold(value: number): void {
        this.threshold$.next(value);
    }

    // Error Messages
    public getError(): Observable<string | null> {
        return this.error$;
    }

    /**
     * Derives computed well state based on a droplet count threshold.
     *
     * Adds an `isNormal` flag indicating whether the well meets or exceeds
     * the provided droplet threshold.
     *
     * @param wells Array of wells to transform
     * @param threshold Minimum droplet count considered normal
     * @returns New array of wells with `isNormal` applied
     */
    private transformData(wells: Well[], threshold: number): Well[] {
        return wells.map(well => ({
            ...well,
            isNormal: well.DropletCount >= threshold
        }));
    }

    /**
     * Validates an array of wells for required fields, uniqueness, and index bounds.
     *
     * - Ensures WellName, WellIndex, and DropletCount are present
     * - Enforces unique WellName and WellIndex values
     * - Validates WellIndex is within array bounds
     *
     * @param wells Array of wells to validate
     * @returns The original wells array if validation passes
     * @throws Error if any validation rules fail
     */
    private validateWells(wells: Well[]): Well[] {
        const errors: string[] = [];
        const seenNames = new Set<string>();
        const seenIndices = new Set<number>();
        const maxIndex = wells.length - 1;

        wells.forEach((well, i) => {
            const wellIdentifier = well.WellName || `at array index ${i}`;

            // 1. Check for Required Fields
            if (well.WellName === undefined || well.WellIndex === undefined || well.DropletCount === undefined) {
                errors.push(`Well ${wellIdentifier}: Missing Name, Index, or Count`);
                return; // Skip further checks for this specific well
            }

            // 2. Uniqueness Checks
            if (seenNames.has(well.WellName)) {
                errors.push(`Duplicate WellName detected: ${well.WellName}`);
            } else {
                seenNames.add(well.WellName);
            }
            if (seenIndices.has(well.WellIndex)) {
                errors.push(`Duplicate WellIndex detected: ${well.WellIndex}`);
            } else {
                seenIndices.add(well.WellIndex);
            }

            // 3. Index Validation
            if (well.WellIndex < 0 || well.WellIndex > maxIndex) {
                errors.push(`${well.WellName}: Index ${well.WellIndex} is out of range (Allowed: 0-${maxIndex})`);
            }

            // 4. Optional feature: droplet count validation
            // Disabled because thresholds are not finalized yet.
            // TODO: Re-enable once MIN_THRESHOLD / MAX_THRESHOLD are defined by product.
            if (ENABLE_DROPLET_RANGE_VALIDATION) {
                if (
                    well.DropletCount < MIN_THRESHOLD ||
                    well.DropletCount > MAX_THRESHOLD
                ) {
                    errors.push(
                        `${well.WellName}: Droplet count ${well.DropletCount} is outside allowed range (${MIN_THRESHOLD}-${MAX_THRESHOLD})`
                    );
                }
            }
        });

        // 5. Final Validation Check
        if (errors.length > 0) {
            throw new Error(`Well Validation failed:\n- ${errors.join('\n- ')}`);
        }

        return wells;
    }
}