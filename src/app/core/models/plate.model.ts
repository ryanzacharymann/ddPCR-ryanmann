/**
 * Supported plate well counts.
 * Used to validate plate layouts (e.g., 48-well, 96-well).
 */
export const ALLOWED_WELLS: readonly number[] = [48, 96] as const;

/**
 * Mapping of total wells to column counts, assuming a standard 8-row layout.
 * This derives the logic directly from your constraints.
 */
export const WELL_TO_COLUMN_MAP: Record<number, number> = {
    48: 6,
    96: 12
};

/**
 * Default droplet threshold used to classify wells.
 */
export const DEFAULT_THRESHOLD = 100;

/**
 * Minimum allowable droplet threshold.
 */
export const MIN_THRESHOLD = 0;

/**
 * Maximum allowable droplet threshold.
 */
export const MAX_THRESHOLD = 500;

/**
 * Row labels used for plate grid rendering (A–H).
 */
export const PLATE_ROW_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;

/**
 * Represents a single well on a plate.
 */
export interface Well {
    /** Human-readable well identifier (e.g., "A1") */
    WellName: string;

    /** Zero-based numeric index of the well */
    WellIndex: number;

    /** Number of droplets detected in the well */
    DropletCount: number;

    /** Optional flag indicating whether the well is within normal range */
    isNormal?: boolean;
}

/**
 * Contains droplet data and metadata for all wells on a plate.
 */
export interface DropletInfo {
    /** Schema or payload version */
    Version: number;

    /** Collection of wells and their droplet counts */
    Wells: Well[];
}

/**
 * Plate-level droplet information wrapper.
 */
export interface PlateDropletInfo {
    /** Schema or payload version */
    Version: number;

    /** Detailed droplet information for the plate */
    DropletInfo: DropletInfo;
}

/**
 * Root API response for plate droplet data.
 */
export interface PlateDropletResponse {
    /** Plate droplet payload */
    PlateDropletInfo: PlateDropletInfo;
}

/**
 * Aggregate summary statistics for a plate.
 */
export interface PlateSummary {
    /** Total number of wells on the plate */
    totalWells: number;

    /** Number of wells below the droplet threshold */
    totalLowDroplets: number;
}

/**
 * Represents the layout configuration for a plate grid.
 */
export interface PlateConfig {
    wells: Well[];
    rows: readonly string[];
    columns: number[];
}