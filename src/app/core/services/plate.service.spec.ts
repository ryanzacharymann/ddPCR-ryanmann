import { PlateService } from './plate.service';
import { Well, PlateDropletResponse, DEFAULT_THRESHOLD, ALLOWED_WELLS, PLATE_ROW_LABELS, WELL_TO_COLUMN_MAP } from '@ddpcr-core/models';
import { firstValueFrom, take } from 'rxjs';

describe('PlateService', () => {
    let service: PlateService;

    // Helper to create a valid array of wells that passes size validation
    const createMockWells = (count: number): Well[] =>
        Array.from({ length: count }, (_, i) => ({
            WellName: `A${i + 1}`,
            WellIndex: i,
            DropletCount: 15000
        }));

    // Helper to wrap wells in the specific JSON structure expected by uploadPlateFile
    const createPayload = (wells: Well[]): PlateDropletResponse => ({
        PlateDropletInfo: {
            Version: 1,
            DropletInfo: { Version: 1, Wells: wells }
        }
    });

    const createMockFile = (content: object, fileName = 'plate.json', type = 'application/json'): File => {
        const blob = new Blob([JSON.stringify(content)], { type });
        return new File([blob], fileName, { type });
    };

    beforeEach(() => {
        service = new PlateService();
    });

    it('should initialize with default values', async () => {
        const config = await firstValueFrom(service.getPlateConfig().pipe(take(1)));
        const threshold = await firstValueFrom(service.getThreshold().pipe(take(1)));
        const error = await firstValueFrom(service.getError().pipe(take(1)));

        expect(config.wells).toEqual([]);
        expect(threshold).toBe(DEFAULT_THRESHOLD);
        expect(error).toBeNull();
    });

    it('should update well classification when threshold changes', async () => {
        const mockWells: Well[] = [
            { WellName: 'A1', WellIndex: 0, DropletCount: 50 },
            { WellName: 'A2', WellIndex: 1, DropletCount: 150 },
            ...createMockWells(46).map(w => ({ ...w, WellIndex: w.WellIndex + 2, WellName: `B${w.WellIndex}` }))
        ];

        const file = createMockFile(createPayload(mockWells));

        // Ensure upload is processed and state is pushed to rawData$
        await firstValueFrom(service.uploadPlateFile(file));

        // Set threshold higher than A1 but lower than A2
        service.setThreshold(100);

        // take(1) ensures we wait for the combined stream to emit the result of transformData
        const config = await firstValueFrom(service.getPlateConfig().pipe(take(1)));

        expect(config.wells.length).toBe(48);
        expect(config.wells[0].isNormal).toBe(false); // 50 < 100
        expect(config.wells[1].isNormal).toBe(true);  // 150 >= 100

        // Lower threshold and check again
        service.setThreshold(40);
        const updatedConfig = await firstValueFrom(service.getPlateConfig().pipe(take(1)));
        expect(updatedConfig.wells[0].isNormal).toBe(true); // 50 >= 40
    });

    it('should reject non-JSON files based on extension', async () => {
        const file = createMockFile({}, 'data.csv', 'text/csv');

        await firstValueFrom(service.uploadPlateFile(file));
        const error = await firstValueFrom(service.getError().pipe(take(1)));

        expect(error).toBe('Invalid file type. Please upload a JSON file.');
    });

    it('should validate plate size against ALLOWED_WELLS', async () => {
        const invalidPayload = createPayload(createMockWells(10));
        const file = createMockFile(invalidPayload);

        await firstValueFrom(service.uploadPlateFile(file));
        const error = await firstValueFrom(service.getError().pipe(take(1)));

        expect(error).toContain(`Wells array length (10) must be one of: ${ALLOWED_WELLS.join(', ')}`);
    });

    it('should detect duplicate WellNames and WellIndices', async () => {
        const duplicateWells: Well[] = [
            { WellName: 'A1', WellIndex: 0, DropletCount: 100 },
            { WellName: 'A1', WellIndex: 0, DropletCount: 100 },
            ...createMockWells(46).map(w => ({ ...w, WellIndex: w.WellIndex + 2, WellName: `B${w.WellIndex}` }))
        ];

        const file = createMockFile(createPayload(duplicateWells));

        await firstValueFrom(service.uploadPlateFile(file));
        const error = await firstValueFrom(service.getError().pipe(take(1)));

        expect(error).toContain('Duplicate WellName detected: A1');
        expect(error).toContain('Duplicate WellIndex detected: 0');
    });

    it('should validate that WellIndex is within array bounds', async () => {
        const wells = createMockWells(48);
        wells[0].WellIndex = 99;

        const file = createMockFile(createPayload(wells));

        await firstValueFrom(service.uploadPlateFile(file));
        const error = await firstValueFrom(service.getError().pipe(take(1)));

        expect(error).toContain('Index 99 is out of range (Allowed: 0-47)');
    });

    it('should calculate plate summary metrics correctly', async () => {
        const wells: Well[] = [
            { WellName: 'A1', WellIndex: 0, DropletCount: 10 },
            { WellName: 'A2', WellIndex: 1, DropletCount: 200 },
            ...createMockWells(46).map(w => ({ ...w, WellIndex: w.WellIndex + 2, WellName: `B${w.WellIndex}` }))
        ];

        const file = createMockFile(createPayload(wells));
        await firstValueFrom(service.uploadPlateFile(file));

        // Threshold affects 'isNormal', which the summary uses
        service.setThreshold(100);

        const summary = await firstValueFrom(service.getPlateSummary().pipe(take(1)));

        expect(summary.totalWells).toBe(48);
        expect(summary.totalLowDroplets).toBe(1); // Only A1 is below 100
    });

    it('should clear previous errors when a new upload starts', async () => {
        // Trigger an initial error
        const badFile = createMockFile({}, 'invalid.json');
        await firstValueFrom(service.uploadPlateFile(badFile));

        let error = await firstValueFrom(service.getError().pipe(take(1)));
        expect(error).not.toBeNull();

        // Start a new upload
        const validPayload = createPayload(createMockWells(48));
        const goodFile = createMockFile(validPayload);

        // We don't await the full upload immediately; we check that the error is cleared synchronously
        const upload$ = service.uploadPlateFile(goodFile);

        error = await firstValueFrom(service.getError().pipe(take(1)));
        expect(error).toBeNull();

        // Clean up
        await firstValueFrom(upload$);
    });

    it('should calculate plate grid configuration (rows and columns) correctly', async () => {
        // Create 96 wells to test a different plate geometry if WELL_TO_COLUMN_MAP supports it
        // Or stick to 48 if that is your primary use case.
        const wellCount = 48;
        const wells = createMockWells(wellCount);
        const file = createMockFile(createPayload(wells));

        await firstValueFrom(service.uploadPlateFile(file));

        const config = await firstValueFrom(service.getPlateConfig().pipe(take(1)));

        // 1. Verify data integrity
        expect(config.wells.length).toBe(wellCount);

        // 2. Verify Row Labels (assuming PLATE_ROW_LABELS is 'A' through 'H' etc.)
        expect(config.rows).toEqual(PLATE_ROW_LABELS);
        expect(config.rows.length).toBeGreaterThan(0);

        // 3. Verify Column Calculation
        // For 48 wells, typical column count is 6 (8 rows * 6 cols) 
        // or for 96 wells it's 12 (8 rows * 12 cols).
        // This checks if the service correctly used WELL_TO_COLUMN_MAP.
        const expectedColumns = WELL_TO_COLUMN_MAP[wellCount] || 12;
        expect(config.columns.length).toBe(expectedColumns);
        expect(config.columns[0]).toBe(1);
        expect(config.columns[config.columns.length - 1]).toBe(expectedColumns);
    });

    it('should reject if any well is missing required data fields', async () => {
        const wells = createMockWells(48);
        // Force a missing field
        (wells[5] as any).DropletCount = undefined;

        const file = createMockFile(createPayload(wells));
        await firstValueFrom(service.uploadPlateFile(file));

        const error = await firstValueFrom(service.getError().pipe(take(1)));
        expect(error).toContain('Missing Name, Index, or Count');
    });

    it('should handle malformed JSON syntax', async () => {
        const blob = new Blob(['{ "incomplete": '], { type: 'application/json' });
        const file = new File([blob], 'broken.json', { type: 'application/json' });

        await firstValueFrom(service.uploadPlateFile(file));
        const error = await firstValueFrom(service.getError().pipe(take(1)));

        expect(error).toBeDefined();
        // Check for standard JS SyntaxError message snippet
        expect(error?.toLowerCase()).toContain('json');
    });

    it('should reset state when a subsequent upload fails', async () => {
        // 1. Success upload
        const validFile = createMockFile(createPayload(createMockWells(48)));
        await firstValueFrom(service.uploadPlateFile(validFile));

        // 2. Failed upload (invalid file)
        const badFile = createMockFile({}, 'wrong.json', 'text/csv');
        await firstValueFrom(service.uploadPlateFile(badFile));

        const config = await firstValueFrom(service.getPlateConfig().pipe(take(1)));
        const summary = await firstValueFrom(service.getPlateSummary().pipe(take(1)));

        expect(config.wells).toEqual([]);
        expect(summary.totalWells).toBe(0);
    });
});