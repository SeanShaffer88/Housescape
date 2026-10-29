# Prototype validation

2026-10-29. This record distinguishes implemented and checked behavior from future work.

## Automated checks

- 19 Vitest geometry tests: rectangle area/perimeter; dimension edits and shared nodes; angled room; miter coincidence; crossing/invalid/disconnected geometry; invalid import schema; analytic arc length/segment area, signed sweep and nearly straight walls; arc-length edits; render tessellation; door void volume and lintel; window sill; invalid/overlapping openings; orphan-opening rejection; JSON round trip; 40-step undo/redo without accumulated drift; history branching/isolation; rejection preserving previous state.
- TypeScript strict type check and Vite production build pass locally.
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

## Native build limitation

Local `cargo check` was attempted and could not compile because the Microsoft C++ linker `link.exe` is absent from the available toolchain. No Visual Studio C++ toolchain was found through vswhere. Native execution, native download handling, a clean-machine offline installation, and performance on the user's target GPU remain unverified locally. The shell configuration and CI build do not constitute an installer or native UI test.

## Follow-up acceptance gates

Test drawing/partitioning multiple rooms, thick-wall overlap handling at acute joins, general topology, true inner-face room areas, worker isolation, atomic saves and recovery, local asset archives, accurate vector printing and DXF units. Revisit geometry-library selection before expanding from one simple room. Catalogs and advanced planning tools follow those foundations.
