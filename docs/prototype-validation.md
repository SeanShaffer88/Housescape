# Prototype validation

2026-10-29. This record distinguishes implemented and checked behavior from future work.

## Automated checks

- 19 Vitest geometry tests: rectangle area/perimeter; dimension edits and shared nodes; angled room; miter coincidence; crossing/invalid/disconnected geometry; invalid import schema; analytic arc length/segment area, signed sweep and nearly straight walls; arc-length edits; render tessellation; door void volume and lintel; window sill; invalid/overlapping openings; orphan-opening rejection; JSON round trip; 40-step undo/redo without accumulated drift; history branching/isolation; rejection preserving previous state.
- TypeScript strict type check and Vite production build pass locally.
- Eight native file-workflow tests cover cancellation without I/O, write errors, waiting for confirmed completion, snapshot isolation across a save dialog, size limits before reads, malformed/invalid imports and a curved-room round trip. Total: 27 passing tests.
- `npm audit` after updating the test tool reports zero vulnerabilities.
- GitHub Actions repeats tests/build on Windows, then checks and builds the Tauri executable. See the actual run for its final result.

## Local interface checks

In-app browser at `http://127.0.0.1:5173/`:

- Initial measured studio shows 24.00 m² and 20.00 m boundary, with connected 2D and rendered 3D.
- Editing wall 1 to 8 m shows 28.00 m²; its adjoining wall becomes 4.47 m.
- Undo restores 24.00 m²; redo restores the edited room.
- Editing to 1 m is rejected because its door no longer fits; the valid model is retained.
- Curved studio shows 26.28 m² and 20.44 m boundary; curved wall length is 4.44 m.
- No graphics errors were captured during these checks.
- Applying unchanged curved-wall dimensions succeeds without rounding the actual stored length to the display precision.
- A preset opening can be added to a curved wall.
- Saving the curved room, loading the angled example and reopening the exported file restores the curved room and its opening.
- Dragging the upper-left corner by 0.5 m in each axis updates its adjoining walls to 6.52 m and 4.53 m and the room area to 28.78 m².
- A UI issue discovered during testing (a visible native file input) was fixed; example loading now uses a prompt instead of leaving a stale example selection after import.

## Native Windows validation

Microsoft C++ Build Tools and the Windows SDK are now installed. Local optimized Tauri builds of 0.1.0 and 0.1.1 complete successfully. The earlier missing-linker limitation is resolved.

The baseline native app rendered its 2D plan and WebGL 3D view. Editing wall 1 to 8 m produced 28.00 m² and a 4.47 m adjoining wall; undo restored 24.00 m². Its download-based Save created an actual project file in Downloads.

Native testing exposed nonfunctional new-window concept links. Version 0.1.1 replaces them with an in-app viewer. Both bundled concept images, Close and Escape were verified in the production browser preview without console errors. The workspace concept image and Close button were also verified in the native window. A third SVG mockup documents this viewer.

Version 0.1.1 uses app-owned native Open/Save As dialogs and narrowly scoped filesystem permissions for selected files. File controls are disabled while a request is pending; success follows the completed write, and cancellation/errors have distinct messages.

Completed native checks on the locally compiled 0.1.1 executable:

- Save As wrote a valid version-1, four-wall project to a path containing spaces; the app reported the completed write. The saved file was independently inspected from disk.
- Editing wall 2 to a quarter-circle with arc length 4.442882938 m produced 26.28 m², a 20.44 m boundary and the matching curved 3D wall.
- Dragging inside the 3D canvas visibly changed the camera orbit without changing the room dimensions.
- Opening the saved project restored the original measured room and 24.00 m² from the curved test room; the app reported `Project opened.` This exercises native file selection, stat, read and geometry validation.
- Cancelling native Save As with Escape returned `Save cancelled.` and preserved the 24.00 m² project.
- The app remained functional after the local development/preview servers on ports 5173 and 4173 were stopped; it loaded bundled assets at the Tauri local origin.

The Windows automation helper could observe but could not operate the owned native dialog's file controls. The user completed the Save/Open selections; the resulting file, native status messages and restored geometry were independently verified. Other native UI actions were automated. Malformed-file, oversized-file and disk-write-error handling were covered by automated tests, not induced through native dialogs.

Clean-machine installation, crash recovery and large-project performance remain unverified. This is an executable prototype with WebView2 as a prerequisite, not a self-contained installer.

## Follow-up acceptance gates

Test drawing/partitioning multiple rooms, thick-wall overlap handling at acute joins, general topology, true inner-face room areas, worker isolation, atomic saves and recovery, local asset archives, accurate vector printing and DXF units. Revisit geometry-library selection before expanding from one simple room. Catalogs and advanced planning tools follow those foundations.
