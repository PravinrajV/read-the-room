# Prompt source verification

Checked Friday, November 13, 2026 (ET). The production app does not fetch these pages. This is a build-time check so each card says only what the source says.

| ID | Source | As of | What we confirmed |
| --- | --- | --- | --- |
| tsa-311-liquids | TSA liquids FAQ | 2026-11-13 | Travel-size containers 3.4 oz / 100 ml, one quart-size bag per passenger. |
| tsa-shoes-on | TSA press release | 2025-07-08 | Passengers can keep shoes on at TSA checkpoints. Page still posted 2026-11-13. |
| dot-tarmac-three-hours | 14 CFR 259.4 (eCFR; govinfo 2025 annual also read) | 2026-11-10 | Domestic deplane opportunity before 3 hours, international 4 hours, with listed exceptions. eCFR said title 14 was current as of 2026-11-10. |
| dot-tarmac-food-water | Same section | 2026-11-10 | Adequate food and potable water no later than 2 hours, unless the pilot precludes it for safety or security. |
| faa-lap-child | 14 CFR 121.311 | 2026-11-10 | A child who has not reached a second birthday may be held by an adult in an approved seat. |
| dot-no-smoking-flights | 14 CFR Part 252 | 2026-11-10 | Air carriers shall prohibit smoking on scheduled passenger flights. Smoking includes e-cigarettes and similar vapor products. |
| faa-seat-belts-movement | 14 CFR 121.311 | 2026-11-10 | Each person occupies an approved seat with a separate belt during taxi, takeoff, and landing, with the lap-child exception. |
| nfl-clear-bag | NFL game day bag policy | 2026-11-13 | Clear bag 12 x 6 x 12, or a one-gallon clear freezer bag, plus one small non-clear bag 4.5 x 6.5. Medical exceptions after inspection. |
| nps-drones | NPS uncrewed aircraft article | 2026-11-13 | Policy Memorandum 14-05 is still in force with a few exceptions: no launching, landing, or operating uncrewed aircraft on NPS lands and waters. |
| amtrak-quiet-car | Amtrak Quiet Car | 2026-11-13 | Limit conversation, no phone calls, headphones at a volume others cannot hear. First come, first served except Acela. One seat per person. |
| apple-14-day-returns | Apple U.S. retail sales policy | 2026-11-13 | Undamaged product, accessories, packaging, and receipt, within 14 days of the date received. |
| ikea-365-180-returns | IKEA U.S. return policy | 2026-11-13 | 365 days for unopened products, 180 days for opened products, with proof of purchase, for a full refund. |
| yosemite-bear-canisters | Yosemite bears and food storage | 2024-03-14 | Bear canisters required for overnight wilderness hikers. Food hangs are no longer legal. |
| yosemite-car-food-after-dark | Same page | 2024-03-14 | Daylight only in a closed car, out of sight. After dark, use a food locker, including the trunk. |
| yosemite-no-timed-entry-2026 | Yosemite entrance reservations | 2026-02-18 | No timed reservation system in 2026. |
| yellowstone-wildlife-distance | Yellowstone safety | 2026-07-28 | 100 yards from bears, wolves, and cougars. 25 yards from other animals, including bison and elk. |
| yellowstone-no-thermal-swim | Same page | 2026-07-28 | Illegal to swim or bathe in water that is entirely of thermal origin. |
| yellowstone-boardwalks | Same page | 2026-07-28 | Stay on boardwalks and designated trails in thermal areas. Do not touch features or runoff. |
| nps-no-collecting | 36 CFR 2.1 (govinfo 2025 annual) | 2026-11-13 | No taking or disturbing wildlife, plants, fossils, archeological items, or mineral resources except as otherwise provided. |
| nps-no-trail-shortcuts | 36 CFR 2.1(b) | 2026-11-13 | Where hiking is restricted to a designated trail system, shortcutting is prohibited. |
| ny-school-device-ban | NY Education Law 2803 | 2026-11-13 | Schools must prohibit student use of internet-enabled devices during the school day on school grounds, with listed exceptions. No suspension solely for this. |
| nga-two-feet | National Gallery of Art guidelines | 2026-11-13 | Stay two feet away and do not touch the art or cases. |
| nga-bag-check | Same page | 2026-11-13 | Bags larger than 12 x 17 x 8 inches must be checked, free of charge. Items larger than 17 x 26 are not permitted. Carry bags on the side or front. |
| nga-indoor-photography | Same page | 2026-11-13 | Personal photography welcome except where noted. No indoor use of tripods, lights, selfie sticks, or drones. Drone use is prohibited. |
| nga-no-gallery-calls | Same page | 2026-11-13 | Headphones in galleries. No phone calls. |
| nga-no-food-in-galleries | Same page | 2026-11-13 | No food or drinks in spaces containing art. Keep water bottles closed. |
| wmata-no-eating | WMATA Metro manners | 2026-05-19 | Unlawful to eat or drink in the Metro system. |
| amtrak-one-seat | Amtrak Quiet Car | 2026-11-13 | Occupy only one seat per person. Do not use the next seat for bags. |
| nga-kids-accompanied | NGA guidelines | 2026-11-13 | Children 12 and under must be with an adult. One adult per 10 children in groups. No backpack-style baby carriers. |
| yellowstone-no-feeding | Yellowstone safety | 2026-07-28 | Never feed wildlife, even birds and squirrels. |

DOT and some eCFR HTML pages did not return usable text to this box's curl client (403 or JS shells). The regulation text was confirmed from the official govinfo annual CFR XML, and the eCFR URLs are the public current citations. Live `npm run verify:sources` should still see HTTP 200 on a normal browser path for those links.
