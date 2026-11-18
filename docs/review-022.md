# Review 022 | Reading and contribution

Base: `c692476eaabfc1376c914b25fd44087c783d29f4`. Reviewed implementation: `ddbb2b3`, branch `task/022-reading-and-contribution`.

- Fixed: contribution links lost the atlas path on subdirectory deployments; regression coverage verifies the preserved path and record hash.
- Fixed: reopening a contribution for another context could carry over text from the prior record. Forms now reset on close or context change and restore focus on close.
- Fixed: the external action sends prefilled text to GitHub before posting. The UI now discloses that transfer and warns against including private information.
- Corrected: the 209 BCE addition on 琅琊刻石 is not the production date of the original 219 BCE block. Added the holding museum's separate dimension listing.

Source-merge outcome: accepted on the owner's instruction after the review fixes and local checks; not an editorial approval or a deployment. The reviewer implemented the fixes and self-checked them. Browser layout at the prescribed widths and zoom, a live marker click, and real issue submission were not independently verified. The seven new objects remain drafts; the Beilin source availability limitation in the delivery still applies.
