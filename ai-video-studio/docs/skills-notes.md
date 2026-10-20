# What we took from the official skills

Sources (read 2026-10-20):
- Anthropic `frontend-design` skill: github.com/anthropics/skills, skills/frontend-design/SKILL.md
- Remotion `remotion-best-practices` skill: github.com/remotion-dev/skills

## Website design (frontend-design)
- Removed the common "generated page" tells: labels above every heading, all-caps monospace labels,
  words joined with middle dots, arrows on buttons, one highlighted word in the headline,
  near-black background with a single bright accent, identical rounded cards everywhere.
- One bold element only: very large condensed Hebrew headlines (Karantina). Everything else is quiet.
- The accent comes from the subject: chroma-key green, the colour of a green screen.
- Numbers are used only where the content is a real sequence (the three steps).

## Video (Remotion)
- Every frame is a pure function of time (already how our renderer works).
- Spring easing for entrances instead of plain ease-out.
- Motion blur on fast moves (kinetic zoom punch).
- Transitions as overlapping scenes plus overlays at the cut (light leak) without shortening the timeline.
- Hand-drawn style highlights and underlines driven by time (lifestyle style).
