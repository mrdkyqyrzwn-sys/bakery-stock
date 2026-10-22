# Resume notes (22 Oct, ~13:15 UTC)

## Workflow, set by the owner on 22 Oct
- Claude codes everything directly in GitHub repo mrdkyqyrzwn-sys/hebrew-ad-spark-studio (branch main; Lovable syncs from it). The clone is at /home/user/hebrew-ad-spark-studio.
- Lovable is used ONLY to publish (deploy_project), and only after the owner says yes.
- No Lovable chat messages: they cost credits, and 37 credits were left.
- Before every push: `bunx vitest run` and `bun run build` must pass.

## In progress
A deep audit by two agents:
- UX: report in scratchpad/audit-ux/REPORT.md;
- code: report in scratchpad/audit-code/REPORT.md.

Next: fix all findings in code, test, build, push to main, then ask the owner whether to publish.

## After that
Nano Banana photo enhancement, coded directly:
- use the Lovable AI gateway (env LOVABLE_API_KEY, model google/gemini-2.5-flash-image);
- enhance REAL photos only (light, sharpness, upscale, declutter); never invent products or people;
- off by default, with a before/after choice per photo;
- log the cost; update the privacy policy.
Spec: the Lovable message umsg_01m5htwnbjftk8y83phw2y54ba, which the owner stopped.

## Engine ideas not yet built
See ai-video-studio/docs/skills/style-research/*.md, section B of each file.
