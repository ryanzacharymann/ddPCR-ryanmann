import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { PlateGridComponent } from './plate-grid.component';
import { PlateService } from '@ddpcr-core/services';
import { PlateConfig } from '@ddpcr-core/models';
import { BehaviorSubject } from 'rxjs';

describe('PlateGridComponent', () => {
    let component: PlateGridComponent;
    let fixture: ComponentFixture<PlateGridComponent>;
    let plateServiceMock: jasmine.SpyObj<PlateService>;
    // Move the declaration here, but don't initialize yet
    let plateConfigSubject: BehaviorSubject<PlateConfig | undefined>;

    beforeEach(async () => {
        // Initialize a FRESH subject for every single test
        plateConfigSubject = new BehaviorSubject<PlateConfig | undefined>(undefined);

        plateServiceMock = jasmine.createSpyObj('PlateService', ['getPlateConfig']);
        plateServiceMock.getPlateConfig.and.returnValue(plateConfigSubject.asObservable() as any);

        await TestBed.configureTestingModule({
            imports: [PlateGridComponent],
            providers: [
                { provide: PlateService, useValue: plateServiceMock },
                provideZonelessChangeDetection()
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PlateGridComponent);
        component = fixture.componentInstance;

        // In Zoneless, we usually need an initial detectChanges to 
        // trigger the initial subscription in the component
        fixture.detectChanges();
    });

    afterEach(() => {
        // Optional: Ensure the subject is cleaned up
        plateConfigSubject.complete();
    });

    it('should initialize with gridReady as false', () => {
        expect(component['gridReady']()).toBeFalse();
    });

    it('should set gridReady to true when valid config is received', async () => {
        const mockConfig: PlateConfig = {
            wells: [{} as any],
            columns: [1],
            rows: ['A']
        };

        plateConfigSubject.next(mockConfig);

        // fixture.whenStable() is good for microtasks, 
        // but fixture.detectChanges() is often needed to trigger signal effects
        await fixture.whenStable();

        expect(component['plateConfig']()).toEqual(mockConfig);
        expect(component['gridReady']()).toBeTrue();
    });
});