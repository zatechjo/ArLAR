@AGENTS.md

# ArLAR Rebuild Context

Start with `docs/claude-handoff.md`.

Supporting docs:

- `docs/site-inventory.md`
- `docs/fullstack-architecture.md`
- `docs/content-model.md`
- `docs/migration-plan.md`
- `docs/route-map.md`

Design is intentionally not decided here. The current app screen is only a plain workspace index.

## Current Main Menu Inventory

This is the current live-site header/menu structure. Treat it as source context, not a required IA or design pattern. The existing header is cluttered and should be refreshed; Claude should reorganize, rename, group, or simplify navigation as it sees fit for a better modern user experience while preserving access to the important content.

### Top Utility Bar

- English
- العربية
- French
- About ArLAR
- Related Links
- Contact Us
- Search

### Primary CTA Buttons

- ArLAR25 Algeria Congress
- Special Interest Groups
- For Public & Patients
- ArLAR News

### Main Navigation

- Home
  - About ArLAR
  - History of ArLAR
  - President Message
  - Board of Directors
  - Scientific Committee
  - ArLAR Media Group
  - ArLAR Bylaws
  - Secretariat
- ArLAR College
  - ArLAR College Members
  - ArLAR College Events
- ArLAR Members
- Events & Congresses
  - ArLAR21 Jordan Replay
  - ArLAR23 Kuwait Replay
  - ArLAR Past Congresses
  - ArLAR Members Events & Congresses
  - International Events & Congresses
  - Related Links
- For Healthcare Professionals
  - ArLAR Publications
  - ArLAR Partners
- Educational Library
- Join ArLAR

Note: the current site effectively hides the institutional/about pages under `Home` and also repeats `About ArLAR` in the utility bar. This is probably an information architecture smell, not something to preserve literally.
