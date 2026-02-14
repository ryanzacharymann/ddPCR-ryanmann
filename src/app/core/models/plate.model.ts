export interface PlateDropletResponse {
    PlateDropletInfo: PlateDropletInfo;
}

export interface PlateDropletInfo {
    Version: number;
    DropletInfo: DropletContainer;
}

export interface DropletContainer {
    Version: number;
    Wells: Well[];
}

export interface Well {
    WellName: string;
    WellIndex: number;
    DropletCount: number;
    isNormal?: boolean;
}

export const WELLS_STORAGE_KEY = 'ddpcr_wells_data';
export const THRESHOLD_STORAGE_KEY = 'ddpcr_threshold_value';