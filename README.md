# Angular Plate Droplet Grid

This Angular application provides a high-performance grid visualization for droplet counts in 48-well or 96-well plates. Users can upload plate data, adjust sensitivity thresholds, and identify low-droplet wells at a glance.

---

## Features

* **Dynamic Plate Grid:** Automatically adjusts between 48-well ($8 \times 6$) and 96-well ($8 \times 12$) layouts based on input data.
* **Well Classification:** * **Normal ($n$):** Droplet count $\ge$ threshold.
  * **Low ($L$):** Droplet count $<$ threshold. Low-droplet wells are visually highlighted for easy identification.
* **Threshold Control:** Default threshold is **100**. Users can input a custom threshold (0–500) and click **Update** to recalculate well classifications and the summary panel in real-time.
* **File Upload & Validation:** Upload plate JSON files (e.g., `PlateDropletInfo.json`). The application validates the schema and provides clear error displays for troubleshooting.
* **Summary Panel:** Displays total well counts and the frequency of low-droplet wells.

---

## Architecture

The application is built with a modular component and service structure to ensure a single source of truth.

## Project Structure

```text
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   ├── index.ts
│   │   │   └── plate.model.ts
│   │   └── services/
│   │       ├── index.ts
│   │       ├── plate.service.spec.ts
│   │       └── plate.service.ts
│   ├── features/
│   │   └── plate/
│   │       ├── plate-error/
│   │       ├── plate-grid/
│   │       ├── plate-summary/
│   │       ├── plate-threshold/
│   │       ├── plate-upload/
│   │       ├── index.ts
│   │       ├── plate.component.html
│   │       ├── plate.component.scss
│   │       └── plate.component.ts
│   ├── app.config.ts
│   ├── app.html
│   ├── app.scss
│   ├── app.spec.ts
│   └── app.ts
├── index.html
├── main.ts
└── styles.scss
├── .editorconfig
├── .gitignore
├── angular.json
├── eslint.config.js
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.spec.json
```

### Core Logic

* **PlateModel:** The primary data structure and source of truth shared throughout the application.
* **PlateService:** Handles JSON upload processing, validation logic, and state management across components.

### Component Breakdown

* **Plate Upload:** Manages file selection and data ingestion.
* **Plate Threshold Handler:** UI controls for adjusting droplet sensitivity.
* **Plate Error Viewer:** Visual feedback for validation or upload issues.
* **Plate Grid:** The main visualization for the 48/96 well layout.
* **Plate Summary & Legend:** High-level statistics and UI key for classifications.

---

## Deployment & CI/CD

The latest version of the **MVP** branch is automatically built and deployed. You can view the live environment and repository status below:

* **View Branch:** [MVP Branch Strategy](https://github.com/ryanzacharymann/ddPCR-ryanmann/tree/MVP)
* **Deployment Status:** [![Build Status](https://img.shields.io/badge/Deployment-Live-brightgreen)](https://github.com/ryanzacharymann/ddPCR-ryanmann/tree/MVP)

---

## Development & Quality Assurance

The project includes built-in suites for unit testing and linting to maintain code quality.

```bash
# Run unit tests
npm run test:local

# Run linter
npm run lint

# Install dependencies
npm ci

# Start the development server
ng serve
