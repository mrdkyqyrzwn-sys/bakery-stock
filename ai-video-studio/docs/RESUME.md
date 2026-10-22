# Resume notes (22 Oct, ~14:10 UTC)

## Workflow (set by the owner)
- Claude codes everything directly in the GitHub repo mrdkyqyrzwn-sys/hebrew-ad-spark-studio. Lovable syncs from main.
- Lovable is used ONLY to publish (deploy_project), after the owner says yes. No Lovable chat messages (credits).
- Before every push to main: `bunx vitest run` and `bun run build` must pass.

## Live state
- Published 22 Oct ~13:57 UTC, commit 1ba444f on main: the audit fixes plus the redesign v1.
- DB migration 0013 (planned_at, referral_uses, new refund/cancel/reward functions) is already applied to production.

## In progress (branches pushed to origin, not merged)
1. `home-redesign`: home page redesign. The owner said the site "looks AI":
   - instant clarity;
   - one font (no serif accent words);
   - crafted motion, with a hero before→after demo;
   - fewer sections and no icon-card rows;
   - a sticky mobile CTA.
2. `engine-fill`: video engine composition fixes. The samples looked bad: tiny cutouts on empty frames, small text, ghosted crossfades. 12 new sample renders are in the scratchpad, NOT yet uploaded to the site.

## Next (the owner's top priority: "replace ALL sample videos, connect Nano Banana")
1. The owner is adding a Google AI Studio key as env var GEMINI_API_KEY (new session needed). Then:
   - use Nano Banana (gemini-2.5-flash-image, REST generateContent with responseModalities IMAGE) to make strong, consistent photo sets for each fictional sample business: food/bakery, beauty salon, retail, course, travel, playful/party. Use 6-8 photos per business: hero product shots, details, the place, hands at work, with no real brands, no text and no faces of real people;
   - or enhance licensed stock photos;
   - label the samples honestly on the site: "דוגמה לעסק בדיוני, תמונות שנוצרו להמחשה".
2. Re-render all 12 samples with the engine-fill branch, upload them with the lovable-assets flow or through Lovable, and replace src/assets/samples/*.asset.json.
3. Merge home-redesign and engine-fill into main after the owner approves the screenshots. Test, build, push, publish on yes.
4. Then: Nano Banana photo enhancement for customers (opt-in, before/after, real photos only).
