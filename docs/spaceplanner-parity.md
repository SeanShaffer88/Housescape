# SpacePlanner editor parity

Target: the layout and interactions in the user's editor screenshot and SpacePlanner's live guest editor, inspected 2026-10-29. Housescape keeps its own identity and locally bundled assets. AI and cloud accounts remain excluded by the agreed scope.

**Version 0.2.0 is an editor foundation, not complete functional parity.** The earlier green geometry-lab interface is superseded by the reference-style editor. The following checklist is the acceptance backlog for the complete app.

| Feature | Current status | Remaining work |
|---|---|---|
| Top toolbar, left grouped tools, central canvas, right inspector | Implemented | Refine against further reference workflows |
| Full-plan 2D and full-canvas 3D switching | Implemented | Walkthrough, camera bookmarks and view manager |
| Rulers, grid, cursor-anchored zoom, fit, pan, coordinates | Implemented | More snapping modes and spacing guides |
| Feet/inches, fractions and metric | Implemented | Display precision and scale preferences |
| Select wall/corner, edit length/height/thickness/curve | Implemented | Full dimension constraints; per-face finishes; sloped walls |
| Rectangle room and clicked wall-chain boundary | Single closed room only | Multiple rooms, partitions, shared-wall topology, L/round presets |
| Doors, windows and pass-through openings | Basic placement and dimensions; door swing in 2D | Styles, frames/leaves in 3D and richer wall constraints |
| Layers | Implemented for available entities | Enable additional layers with their actual systems |
| Room labels and centreline areas | Implemented | Multiple-room discovery and inner-face/net area calculations |
| Measurement, persistent dimensions and notes | Implemented | Rich callouts and annotation editing/deletion |
| Floor finishes | Solid tones in 2D/3D | Local photo textures and per-face materials |
| Native project Open/Save As; local draft | Implemented | Atomic saves, backups and crash recovery; asset archive |
| Furniture library and personal furniture | Planned | Search, categories, favourites, transform tools and GLB imports |
| Multiple floors and adjacent-floor overlays | Planned | Level model, elevations, split levels and floor navigation |
| Stairs and landings | Planned | Parametric straight/L/U stairs and coordinated slab openings |
| Roofs | Planned | Hip/gable/shed/flat, pitch, wall dependencies and cut geometry |
| Balconies, terraces, railings, fences and gates | Planned | Parametric site/building elements and elevations |
| Gardens, terrain, pools, paths and lot boundaries | Planned | Editable terrain/site model and local outdoor assets |
| Electrical devices and wiring | Planned | Wall attachment, circuits, home-run arcs and export legends |
| Sections and elevations / Views | Planned | Geometric cuts and exportable drawings |
| Reference-image tracing | Planned | Offline image/PDF placement, calibration and opacity |
| Exports | 3D PNG capture and project JSON | 2D PNG/SVG, scale-accurate PDF and unit-preserving DXF |
| Layout alternatives, clearances and renovation layers | Planned | Shared identities, variants and configurable checks |
| Costs, inventory and project documents | Planned | Manual prices, quantity calculation, attachments and CSV |
| AI import / AI photo generation | Excluded | User chose no AI |
| Login, subscriptions and cloud saving | Excluded | Local files and local draft replace them |

Unavailable controls are disabled and labeled Planned. Their placement establishes the target tool organization, rather than implying that those systems work already. The geometry model still requires one closed counterclockwise boundary. Drawing a new boundary replaces that one room and is undoable.

## Next implementation gate

Build and verify shared-wall topology and multi-room discovery before expanding catalogs or architectural systems. Required cases include a partition splitting a room, openings on a shared wall, moving shared corners, deleting walls to merge spaces, undo/redo and native file round trips. Then implement furniture and the level/roof/stair systems using that common model.

## Design references

- [2D target mockup](../public/mockups/editor-2d.svg)
- [3D target mockup](../public/mockups/editor-3d.svg)
- [SpacePlanner editor](https://spaceplanner.co/editor)
- [SpacePlanner documentation](https://spaceplanner.co/docs)
