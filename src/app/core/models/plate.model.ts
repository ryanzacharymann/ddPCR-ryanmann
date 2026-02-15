export interface PlateDropletResponse {
    PlateDropletInfo: PlateDropletInfo;
}

export interface PlateDropletInfo {
    Version: number;
    DropletInfo: DropletInfo;
}

export interface DropletInfo {
    Version: number;
    Wells: Well[];
}

export interface Well {
    WellName: string;
    WellIndex: number;
    DropletCount: number;
    isNormal?: boolean;
}

export interface PlateSummary {
    totalWells: number;
    totalLowDroplets: number;
}

export const PLATE_ROW_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;

export const WELLS_STORAGE_KEY = 'ddpcr_wells_data';
export const THRESHOLD_STORAGE_KEY = 'ddpcr_threshold_value';
export const DEFAULT_THRESHOLD = 100;

