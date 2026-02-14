# ddPCR demo

src/
├── app/
│   ├── core/                  # Singleton services & global models
│   │   ├── models/
│   │   │   ├── plate.model.ts  # Interfaces for Well, Plate, and Config
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── plate.service.ts # Core logic: parsing, thresholding, state
│   ├── features/              # Feature-based components
│   │   ├── plate-shell/       # Main container component
│   │   ├── plate-grid/        # The 8x12 or 8x6 visual grid
│   │   ├── plate-controls/    # File upload and Threshold input
│   │   └── plate-summary/     # Totals and Legend
│   ├── shared/                # Reusable UI (pipes, directives)
│   │   └── pipes/
│   │       └── well-label.pipe.ts # Converts index (0) to Label (A1)
│   └── app.component.ts
├── assets/
│   ├── data/                  # Sample JSON files for testing
│   └── config/
│       └── app-config.json    # External default threshold (optional)


src/app/
├── core/
│   ├── models/
│   │   ├── plate.model.ts      (Interfaces for Well, PlateData)
│   │   └── constants.ts        (Grid dimensions: 8x12 vs 8x6)
│   └── services/
│       └── plate.service.ts    (State management, parsing, and threshold logic)
├── features/
│   └── plate-viewer/
│       ├── components/
│       │   ├── plate-grid/      (The 2D visualization)
│       │   ├── plate-summary/   (Total vs Low count)
│       │   └── threshold-ctrl/  (Input and Update button)
│       └── plate-viewer.component.ts (The "Smart" orchestrator)
└── shared/
    └── components/
        └── file-upload/         (Generic reusable file input)