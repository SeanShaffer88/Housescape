# Housescape architecture evaluation

Date: 2026-10-29. Status: recommendation; no implementation or performance benchmark completed.

## Recommendation

Build Housescape as an independent offline Windows 11 application. Reuse established rendering, geometry, file-format and packaging libraries rather than writing every subsystem. Keep Sweet Home 3D as a workflow reference and a possible future import source, not the application core.

This recommendation optimizes for the complete agreed scope. If the objective changes to obtaining basic room planning as quickly as possible, extending Sweet Home 3D becomes the better choice.

## Requirements and repository

Personal use, Windows 11 x64, Ryzen 7, 16 GB RAM, NVIDIA graphics reported as RTX 5050 with 4027 MB memory. Verify dedicated VRAM before assigning graphics budgets. No AI, account, cloud service, activation or network requirement. Include installation and first launch in offline testing.

Scope: accurate 2D planning and synchronized 3D; curved/sloped walls; openings; levels; stairs; roofs; outdoor planning; sections; electrical drawings; dimensions; scaled printing; PNG/PDF/SVG/JSON/DXF export. Add personal furniture and texture imports, layout alternatives, favorites, clearances, renovation layers, local costs and attachments. Advanced features remain in scope but follow the core editor.

Housescape currently contains a minimal README and MIT license, with no application implementation to preserve.

## Evidence

Sweet Home 3D already supplies a substantial offline home-planning foundation. Its official documentation describes furniture and texture imports, tracing, printing and extensibility [1]. Its plugin directory lists roof, staircase, terrain, side-view, automatic dimensioning and image export tools [2]. These capabilities must not be treated as absent.

The plugin API exposes actions, the home model, controller and undo support [3]. HomeObject supports custom properties and content [4], making costs, notes and additional metadata plausible extensions. The Wall API includes arcs, linked ends, per-side finishes and different end heights [5].

The documented core model includes walls, rooms, levels, furniture and polylines, but does not list dedicated roof, terrain, electrical circuit or design-variant classes [6]. That is evidence of an integration burden, not proof that these features cannot be implemented. The Swing PlanComponent exposes rendering and SVG export [7]; a wholesale workspace redesign would need deeper UI integration than adding menu commands.

## Options

| Criterion | Sweet Home 3D plugins | Maintained Sweet Home 3D fork | Independent app |
|---|---|---|---|
| Time to useful basic editor | Best: existing application | Good: existing application | Slowest: foundations required |
| Dimensions, levels, furniture, walkthrough | Existing foundation | Existing foundation | Must implement and verify |
| Personal inventory, notes, costs | Good extension candidates | Good | Good with explicit schema |
| Roof/stair/terrain generation | Existing plugins to evaluate | Can integrate and improve | Dedicated implementations required |
| Coordinated parametric building edits | Increasing custom integration | Feasible through core changes | Can be designed into model |
| Sections with printable cut geometry | Side view alone does not establish this | Substantial implementation | Substantial implementation |
| Electrical devices, wiring, layers, legends | Custom model/UI/export integration | Feasible with core changes | Dedicated subsystem |
| Variants and renovation visibility | Custom persistence/UI rules | Feasible with core changes | Explicit project concepts |
| Proposed modern workspace | Constrained by host integration | Broad changes and upstream maintenance | Full control |
| Maintenance burden | Plugin compatibility | Upstream merge work plus custom features | Entire application owned by project |
| Existing MIT repository | Review plugin licensing separately | GPL-derived distribution obligations | MIT possible for original code; audit dependencies |

These are engineering judgments based on documentation and API inspection, not results of running the plugins. Roof, terrain and staircase plugin editability and interoperability remain untested.

## Why the independent app wins for this scope

The most demanding requirements cross subsystem boundaries. Moving a wall should update its openings, adjoining rooms, dimensions, roof dependencies, relevant electrical attachment points and section output. Layout alternatives and renovation layers need consistent visibility and identity across editing, rendering, persistence and export.

A fork can support these requirements, but it combines inherited architecture constraints with responsibility for new features and upstream integration. A plugin suite offers a faster start, but the full scope risks turning into an implicit fork through UI and rendering overrides.

The independent app has the larger initial correctness risk: snapping, wall joins, room topology, curved geometry and reliable undo are difficult. It is justified only if a prototype demonstrates those foundations before catalog expansion and visual polish.

## Proposed technical direction

- Tauri 2 desktop shell with a self-contained Windows installer and bundled required WebView2 runtime strategy; confirm offline clean-machine installation [9].
- TypeScript UI and a geometry/domain package independent of the UI framework. Choose the framework at scaffolding time.
- Three.js for the interactive 3D scene [10]. Derive 2D, 3D and exports from the same authoritative domain model. Three.js is a renderer, not a CAD geometry engine.
- Prototype maintained polygon/triangulation/boolean libraries before selecting them. Define units and tolerances centrally. Keep heavy computation off the UI thread; add Rust only where evidence warrants it.
- Versioned portable .housescape archive containing structured project data and referenced assets, with atomic saves, backups, recovery and schema migrations.
- Stable object identifiers; explicit levels, walls, openings, furniture, roofs, stairs, terrain, electrical objects, variants and renovation status. Add advanced schemas incrementally rather than implementing them all upfront.
- GLB/glTF furniture import first, with dimension/scale correction and asset attribution. Other import formats follow demonstrated need. Do not promise lossless SH3D import.
- Geometry-based sections and scaled vector output. Screen clipping alone does not satisfy printable sections.
- Adaptive graphics quality, bounded texture sizes and asset loading. Target smooth 1080p editing, subject to measurement on the actual PC; no frame-rate guarantee yet.

## Implementation gates

1. Geometry prototype: create a measured room with an angled join, curved wall and wall opening; edit dimensions; verify room area, undo/redo and synchronized 3D. Preserve correctness through repeated edits.
2. Persistence/printing prototype: save/reopen without dimension drift; recover an interrupted save; verify vector PDF scale and DXF units. Test on a clean offline Windows machine.
3. Useful editor: personal furniture, materials, adjustable 2D/3D workspace, layout alternatives, clearances, favorites and core exports. Create UI mockups before changing the proposed design.
4. Building/site tools: multiple levels, parametric stairs and roofs, balconies, terrain, fences/gates, sections and electrical planning. Validate dependencies and export visibility together.
5. Personal project tools: renovation layers, quantities/manual prices, attachments and presentation sheets. Costs remain user-entered; clearances use configurable planning thresholds.

If the geometry and printing gates fail, stop expanding features and revisit the architecture. Do not claim full SpacePlanner parity until a hands-on editor audit and acceptance checklist are complete.

## Licensing and content

Sweet Home 3D is GPL v2-or-later [8]. A distributed derivative cannot simply retain MIT as its only license; preserve required notices and comply with applicable source/license obligations. Personal use does not remove the relevance of those obligations when publishing derived work to GitHub. Check each plugin and asset independently. An independent implementation can retain MIT for original code while honoring dependency and asset licenses. Do not copy competitors' catalogs or UI assets.

## Sources

1. https://www.sweethome3d.com/users-guide/
2. https://www.sweethome3d.com/plugins/
3. https://www.sweethome3d.com/javadoc/com/eteks/sweethome3d/plugin/Plugin.html
4. https://www.sweethome3d.com/javadoc/com/eteks/sweethome3d/model/HomeObject.html
5. https://www.sweethome3d.com/javadoc/com/eteks/sweethome3d/model/Wall.html
6. https://www.sweethome3d.com/javadoc/com/eteks/sweethome3d/model/package-summary.html
7. https://www.sweethome3d.com/javadoc/com/eteks/sweethome3d/swing/PlanComponent.html
8. https://www.sweethome3d.com/license/
9. https://v2.tauri.app/distribute/windows-installer/
10. https://threejs.org/docs/

