import type { Prompt } from './types';

/**
 * Frozen 30-day catalog. Do not reorder after we ship. Index is days since
 * PROMPT_EPOCH_DAY_ID, modulo 30. Every source was checked on 2026-11-13.
 */
export const PROMPTS: readonly Prompt[] = [
  {
    id: 'tsa-311-liquids',
    title: 'The 3-1-1 liquids bag',
    category: 'airport',
    scenario:
      'At a TSA checkpoint, liquids, gels, and aerosols in your carry-on still have to be in travel-size containers of 3.4 ounces, or 100 milliliters, or less. Each person gets one quart-size bag of them. Toothpaste, shampoo, and lotion all count.',
    outcome:
      "TSA's liquids rule still limits you to travel-size containers of 3.4 ounces or 100 milliliters, and one quart-size bag per passenger.",
    source: {
      title: 'Liquids, Aerosols, and Gels Rule',
      publisher: 'Transportation Security Administration',
      url: 'https://www.tsa.gov/travel/frequently-asked-questions/liquids-aerosols-and-gels-rule',
      asOf: '2026-11-13',
    },
  },
  {
    id: 'tsa-shoes-on',
    title: 'Shoes stay on at TSA',
    category: 'airport',
    scenario:
      'In July 2025, the Department of Homeland Security ended the long-running shoes-off rule at TSA checkpoints. The agency says you can now keep your shoes on while you go through screening at U.S. airports. Other checkpoint steps, like identity checks, still apply.',
    outcome:
      'A TSA announcement dated July 8, 2025 says passengers can keep their shoes on at TSA security checkpoints. We confirmed that page was still posted on November 13, 2026.',
    source: {
      title: "DHS to End 'Shoes-Off' Travel Policy",
      publisher: 'Transportation Security Administration',
      url: 'https://www.tsa.gov/news/press/releases/2025/07/08/dhs-end-shoes-travel-policy',
      asOf: '2025-07-08',
    },
  },
  {
    id: 'dot-tarmac-three-hours',
    title: 'Off the plane after three hours',
    category: 'airline',
    scenario:
      'On a domestic flight stuck on the tarmac at a U.S. airport, the airline has to give you a chance to get off before that delay hits three hours. International flights at U.S. airports get a four-hour cap. Safety, security, and air-traffic exceptions still apply.',
    outcome:
      '14 CFR 259.4 requires a chance to deplane before a domestic tarmac delay exceeds three hours, or four hours on an international flight at a U.S. airport, with listed exceptions.',
    source: {
      title: '14 CFR 259.4, Contingency Plan for Lengthy Tarmac Delays',
      publisher: 'U.S. Government Publishing Office / eCFR',
      url: 'https://www.ecfr.gov/current/title-14/chapter-II/subchapter-A/part-259/section-259.4',
      asOf: '2026-11-10',
    },
  },
  {
    id: 'dot-tarmac-food-water',
    title: 'Food and water after two hours',
    category: 'airline',
    scenario:
      'If your flight is sitting on the tarmac, the airline has to offer adequate food and drinking water no later than two hours after the delay starts, unless the pilot decides safety or security rules that out. Lavatories have to stay usable too.',
    outcome:
      '14 CFR 259.4 requires adequate food and potable water no later than two hours after a tarmac delay starts, unless the pilot-in-command determines that safety or security considerations preclude that service.',
    source: {
      title: '14 CFR 259.4, Contingency Plan for Lengthy Tarmac Delays',
      publisher: 'U.S. Government Publishing Office / eCFR',
      url: 'https://www.ecfr.gov/current/title-14/chapter-II/subchapter-A/part-259/section-259.4',
      asOf: '2026-11-10',
    },
  },
  {
    id: 'faa-lap-child',
    title: 'Lap kids under two',
    category: 'airline',
    scenario:
      'On U.S. commercial flights, a child who has not turned two may be held by an adult in an approved seat, instead of sitting in a separate seat. The FAA does not require a child restraint, though it strongly recommends one. Once the child turns two, they need their own seat and belt.',
    outcome:
      '14 CFR 121.311 says a child who has not reached their second birthday may be held by an adult occupying an approved seat or berth. The FAA also says it does not require child restraint systems, but strongly recommends them.',
    source: {
      title: '14 CFR 121.311, Seats, safety belts, and shoulder harnesses',
      publisher: 'U.S. Government Publishing Office / eCFR',
      url: 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-G/part-121/subpart-K/section-121.311',
      asOf: '2026-11-10',
    },
  },
  {
    id: 'dot-no-smoking-flights',
    title: 'No smoking, including e-cigs',
    category: 'airline',
    scenario:
      'U.S. air carriers have to ban smoking on scheduled passenger flights. The rule treats electronic cigarettes and similar vapor devices as smoking too. The point is a smoke-free cabin, not a cigarette-only ban.',
    outcome:
      '14 CFR 252.4 requires air carriers to prohibit smoking on scheduled passenger flights. Part 252 defines smoking to include electronic cigarettes and similar products that produce a smoke, mist, vapor, or aerosol.',
    source: {
      title: '14 CFR Part 252, Smoking Aboard Aircraft',
      publisher: 'U.S. Government Publishing Office / eCFR',
      url: 'https://www.ecfr.gov/current/title-14/chapter-II/subchapter-A/part-252',
      asOf: '2026-11-10',
    },
  },
  {
    id: 'faa-seat-belts-movement',
    title: 'Belts on for taxi, takeoff, and landing',
    category: 'airline',
    scenario:
      'On these flights, everyone who has turned two has to be in an approved seat with a seat belt fastened during taxi, takeoff, and landing. Two people who are at least two years old cannot share one belt. A lap child under two is the listed exception.',
    outcome:
      '14 CFR 121.311 requires each person on board to occupy an approved seat or berth with a separate safety belt secured during movement on the surface, takeoff, and landing, with the listed exception for a child under two held by an adult.',
    source: {
      title: '14 CFR 121.311, Seats, safety belts, and shoulder harnesses',
      publisher: 'U.S. Government Publishing Office / eCFR',
      url: 'https://www.ecfr.gov/current/title-14/chapter-I/subchapter-G/part-121/subpart-K/section-121.311',
      asOf: '2026-11-10',
    },
  },
  {
    id: 'nfl-clear-bag',
    title: "The NFL's clear bag",
    category: 'venue',
    scenario:
      'NFL stadiums limit what you can carry in. The standard allowed bag is a clear plastic, vinyl, or PVC bag no bigger than 12 by 6 by 12 inches, or a one-gallon clear freezer bag. You can also bring one small non-clear bag no bigger than 4.5 by 6.5 inches. Medically necessary items are excepted after inspection.',
    outcome:
      "The NFL's posted game-day bag policy allows clear bags that do not exceed 12 by 6 by 12 inches, or a one-gallon clear freezer bag, plus one small non-clear bag no larger than 4.5 by 6.5 inches, with an exception for medically necessary items after proper inspection.",
    source: {
      title: 'NFL Stadium Game Day Bag Policy',
      publisher: 'National Football League',
      url: 'https://www.nfl.com/legal/clear-bag-policy',
      asOf: '2026-11-13',
    },
  },
  {
    id: 'nps-drones',
    title: 'No drones in the national parks',
    category: 'park',
    scenario:
      'In most National Park Service sites, you cannot launch, land, or operate a drone, quadcopter, or model airplane on park lands or waters. The 2014 policy is still in force, with only limited official exceptions. Park jurisdiction ends at the boundary, and FAA airspace rules still apply above it.',
    outcome:
      'NPS Policy Memorandum 14-05 directed superintendents to prohibit launching, landing, or operating unmanned aircraft on NPS lands and waters, subject to listed conditions and exceptions. The NPS article says that policy is still in force with a few exceptions.',
    source: {
      title: 'Uncrewed Aircraft in the National Parks',
      publisher: 'National Park Service',
      url: 'https://www.nps.gov/articles/uncrewed-aircraft-in-the-national-parks.htm',
      asOf: '2026-11-13',
    },
  },
  {
    id: 'amtrak-quiet-car',
    title: 'The Quiet Car',
    category: 'transit',
    scenario:
      'On many Amtrak corridor trains, the Quiet Car asks you to keep conversation low and skip phone calls. Headphones are required, and the volume has to stay low enough that your neighbors cannot hear it. On most of those trains, seats are first come, first served, and you are asked to take only one seat.',
    outcome:
      'Amtrak says guests in Quiet Cars are asked to limit conversation and speak in subdued tones, phone calls are not allowed, and electronic devices must be used with headphones at a volume other passengers cannot hear. Except on Acela, seating is first come, first served, and passengers are asked to occupy only one seat per person.',
    source: {
      title: 'Quiet Car',
      publisher: 'Amtrak',
      url: 'https://www.amtrak.com/quiet-car',
      asOf: '2026-11-13',
    },
  },
  {
    id: 'apple-14-day-returns',
    title: "Apple's 14-day window",
    category: 'return-policy',
    scenario:
      'If an undamaged Apple product is not what you expected, the U.S. Apple Store policy lets you return it with its accessories, packaging, and receipt within 14 days of the date you receive it, for an exchange or a refund to the original payment method. Gift cards and electronic software downloads are not eligible. Returns have to be in the country of purchase.',
    outcome:
      "Apple's U.S. retail sales policy says you may return any undamaged product with its included accessories, packaging, and original or gift receipt within 14 days of the date you receive it, for an exchange or a refund based on the original payment method, with the listed exceptions.",
    source: {
      title: 'Apple Store Purchase Policies, U.S. Sales and Refund Policy',
      publisher: 'Apple',
      url: 'https://www.apple.com/legal/sales-support/sales-policies/retail/',
      asOf: '2026-11-13',
    },
  },
  {
    id: 'ikea-365-180-returns',
    title: "IKEA's year, or half a year",
    category: 'return-policy',
    scenario:
      'IKEA in the United States gives you 365 days to return an unopened product, and 180 days to return a product you already opened, with proof of purchase, for a full refund. That is a long window, and it treats sealed goods more generously than opened ones.',
    outcome:
      'IKEA U.S. says it offers a 365-day return policy for unopened products, and that you may also return open products within 180 days, with proof of purchase, for a full refund.',
    source: {
      title: 'How to Return or Exchange Products',
      publisher: 'IKEA United States',
      url: 'https://www.ikea.com/us/en/customer-service/returns-claims/return-policy/',
      asOf: '2026-11-13',
    },
  },
  {
    id: 'yosemite-bear-canisters',
    title: 'Bear canisters in Yosemite wilderness',
    category: 'park',
    scenario:
      'If you stay overnight in Yosemite wilderness, a bear-resistant canister is required for your food. The park says hanging food is no longer legal. In Yosemite and the southern Sierra, canisters are described as the only effective, proven way to keep human food away from bears.',
    outcome:
      'Yosemite National Park says bear-resistant food containers are required for overnight hikers throughout the wilderness, and that counterbalance food hangs are no longer legal.',
    source: {
      title: 'Bears and Food Storage',
      publisher: 'Yosemite National Park, National Park Service',
      url: 'https://www.nps.gov/yose/planyourvisit/bears.htm',
      asOf: '2024-03-14',
    },
  },
  {
    id: 'yosemite-car-food-after-dark',
    title: 'No food in the car after dark',
    category: 'park',
    scenario:
      'In Yosemite developed areas, you may keep food in a car or truck during daylight if it is out of sight and the windows are fully closed. After dark, that is not enough: the park says to use a food locker, even for the trunk. Empty coolers and scented toiletries count as food too.',
    outcome:
      'Yosemite says that during daylight hours only, you may store food inside your car or truck, out of sight, with windows completely closed, and that you should not store food in your car, including the trunk, or truck after dark, and should use a food locker instead.',
    source: {
      title: 'Bears and Food Storage',
      publisher: 'Yosemite National Park, National Park Service',
      url: 'https://www.nps.gov/yose/planyourvisit/bears.htm',
      asOf: '2024-03-14',
    },
  },
  {
    id: 'yosemite-no-timed-entry-2026',
    title: 'Yosemite drops timed entry',
    category: 'park',
    scenario:
      'Yosemite will not use a timed reservation system in 2026. After reviewing 2025 traffic and parking, the park says a season-wide reservation is not the most effective approach this year. It is leaning on traffic monitoring, parking management, and weekday travel instead. Weekends and holidays can still get crowded.',
    outcome:
      'On a page last updated February 18, 2026, Yosemite National Park announced it will no longer use a timed reservation system in 2026, and will rely on other traffic and parking management tools instead.',
    source: {
      title: 'Entrance Reservations',
      publisher: 'Yosemite National Park, National Park Service',
      url: 'https://www.nps.gov/yose/planyourvisit/reservations.htm',
      asOf: '2026-02-18',
    },
  },
  {
    id: 'yellowstone-wildlife-distance',
    title: '100 yards from bears and wolves',
    category: 'park',
    scenario:
      'In Yellowstone, you have to stay at least 100 yards from bears, wolves, and cougars, and at least 25 yards from other animals, including bison and elk. If an animal walks toward you, you back up and keep that distance. The park also says it is illegal to stay close enough that you disturb or displace wildlife.',
    outcome:
      'Yellowstone National Park says to always stay at least 100 yards (91 m) away from bears, wolves, and cougars, and at least 25 yards (23 m) away from all other animals, including bison and elk, and that it is illegal to willfully remain near or approach wildlife within any distance that disturbs or displaces the animal.',
    source: {
      title: 'Safety',
      publisher: 'Yellowstone National Park, National Park Service',
      url: 'https://www.nps.gov/yell/planyourvisit/safety.htm',
      asOf: '2026-07-28',
    },
  },
  {
    id: 'yellowstone-no-thermal-swim',
    title: 'No soaking in the hot springs',
    category: 'park',
    scenario:
      "Yellowstone's hot springs can look inviting. Swimming or soaking in water that is entirely of thermal origin is illegal there. The park says more than 20 people have died from burns after entering or falling into those springs, and that contact can also damage the life that lives in them.",
    outcome:
      'Yellowstone National Park says swimming or soaking in hot springs is prohibited, and that it is illegal to swim or bathe in any water that is entirely of thermal origin.',
    source: {
      title: 'Safety',
      publisher: 'Yellowstone National Park, National Park Service',
      url: 'https://www.nps.gov/yell/planyourvisit/safety.htm',
      asOf: '2026-07-28',
    },
  },
  {
    id: 'yellowstone-boardwalks',
    title: 'Stay on the boardwalk',
    category: 'park',
    scenario:
      'Around Yellowstone thermal features, the crust can look solid and still be a thin lid over boiling water. The park tells you to stay on boardwalks and designated trails, keep kids close, and not run. Touching features or runoff is also off limits, both for burns and for the organisms that live there.',
    outcome:
      'Yellowstone National Park says to always walk on boardwalks and designated trails in thermal areas, to keep children close and not let them run on boardwalks, and not to touch thermal features or runoff.',
    source: {
      title: 'Safety',
      publisher: 'Yellowstone National Park, National Park Service',
      url: 'https://www.nps.gov/yell/planyourvisit/safety.htm',
      asOf: '2026-07-28',
    },
  },
  {
    id: 'nps-no-collecting',
    title: 'Leave the rocks where they are',
    category: 'park',
    scenario:
      'In National Park Service areas, you generally cannot take, disturb, or pocket living or dead wildlife, plants, fossils, archeological items, or mineral resources, unless a park has specifically allowed something like berries for personal use. A pretty rock in your pack is still a removal.',
    outcome:
      '36 CFR 2.1 prohibits possessing, destroying, injuring, defacing, removing, digging, or disturbing from its natural state wildlife, plants, paleontological or archeological resources, or a mineral resource, except as otherwise provided, with limited hand-gathering only where a superintendent has designated it.',
    source: {
      title: '36 CFR 2.1, Preservation of natural, cultural and archeological resources',
      publisher: 'U.S. Government Publishing Office / eCFR',
      url: 'https://www.ecfr.gov/current/title-36/chapter-I/part-2/section-2.1',
      asOf: '2026-11-13',
    },
  },
  {
    id: 'nps-no-trail-shortcuts',
    title: 'No shortcuts between trails',
    category: 'park',
    scenario:
      'When a park has restricted hiking to a marked trail or walkway system, cutting between switchbacks or ducking off to join the next trail is prohibited. The federal rule is not a blanket ban on every social path in every park. It applies where that restriction has been designated.',
    outcome:
      '36 CFR 2.1(b) says a superintendent may restrict hiking or pedestrian use to a designated trail or walkway system, and that leaving a trail or walkway to shortcut between portions of the same trail or to an adjacent trail, in violation of designated restrictions, is prohibited.',
    source: {
      title: '36 CFR 2.1, Preservation of natural, cultural and archeological resources',
      publisher: 'U.S. Government Publishing Office / eCFR',
      url: 'https://www.ecfr.gov/current/title-36/chapter-I/part-2/section-2.1',
      asOf: '2026-11-13',
    },
  },
  {
    id: 'ny-school-device-ban',
    title: 'Phones away for the school day',
    category: 'school',
    scenario:
      'New York requires public school districts, charter schools, and BOCES to prohibit students from using internet-enabled devices, including smartphones, tablets, and smartwatches, during the school day anywhere on school grounds. That includes lunch, recess, and passing time. Schools have to offer on-site storage and a way for a parent to reach a student. There are listed exceptions, including medical needs and IEP or 504 plans. A student cannot be suspended solely for this.',
    outcome:
      'New York Education Law section 2803 requires each school district, charter school, and BOCES to adopt a written policy prohibiting student use of internet-enabled devices during the school day anywhere on school grounds, with listed exceptions, on-site storage, a parent contact method, and a ban on suspension when this is the sole grounds.',
    source: {
      title: 'New York Education Law § 2803, Use of internet-enabled devices during the school day',
      publisher: 'New York State Senate',
      url: 'https://www.nysenate.gov/legislation/laws/EDN/2803',
      asOf: '2026-11-13',
    },
  },
  {
    id: 'nga-two-feet',
    title: 'Two feet from the art',
    category: 'museum',
    scenario:
      'At the National Gallery of Art in Washington, the basic ask is simple: stay at least two feet away, and do not touch the art or the cases. The museum says even clean hands can damage surfaces, and that this distance helps keep the work safe for the next visitor.',
    outcome:
      'The National Gallery of Art tells visitors to stay two feet away and not touch the art, and later says to admire works from a distance of at least two feet and not to touch the art or display cases, because even clean hands can damage surfaces.',
    source: {
      title: 'Guidelines and policies',
      publisher: 'National Gallery of Art',
      url: 'https://www.nga.gov/visit/guidelines-and-policies',
      asOf: '2026-11-13',
    },
  },
  {
    id: 'nga-bag-check',
    title: 'Big bags get checked',
    category: 'museum',
    scenario:
      'At the National Gallery of Art, bags larger than 12 by 17 by 8 inches have to be checked, and the museum says that check is free. Items larger than 17 by 26 inches are not allowed at all. Inside the galleries, bags are carried on your side or front, not on your back. Baby bags and medical supplies have listed exceptions.',
    outcome:
      'The National Gallery of Art says items larger than 12 by 17 by 8 inches must be checked, that the check is free of charge, that items larger than 17 by 26 inches are not permitted, and that bags must be carried on the side or front of your body, not your back, with listed exceptions for baby bags and medical items.',
    source: {
      title: 'Guidelines and policies',
      publisher: 'National Gallery of Art',
      url: 'https://www.nga.gov/visit/guidelines-and-policies',
      asOf: '2026-11-13',
    },
  },
  {
    id: 'nga-indoor-photography',
    title: 'Photos yes, tripods no',
    category: 'museum',
    scenario:
      'Personal, noncommercial photography is welcome at the National Gallery of Art unless a space says otherwise. You may carry a tripod, lights, a selfie stick, or even a drone if it fits the bag-size limit, but you cannot use those tools indoors. Tripods may only be used in the outdoor Sculpture Garden, except during busy events. Drone use is prohibited.',
    outcome:
      'The National Gallery of Art says noncommercial or personal photography is always welcome except where noted, that camera accessories like tripods, lights, selfie sticks, and drones may be carried if they are 12 by 17 by 8 inches or smaller but must not be used indoors, that tripods may only be used in the outdoor Sculpture Garden except during heavily attended events, and that using drones is prohibited.',
    source: {
      title: 'Guidelines and policies',
      publisher: 'National Gallery of Art',
      url: 'https://www.nga.gov/visit/guidelines-and-policies',
      asOf: '2026-11-13',
    },
  },
  {
    id: 'nga-no-gallery-calls',
    title: 'No phone calls in the galleries',
    category: 'museum',
    scenario:
      'At the National Gallery of Art, you can listen on headphones in the galleries. Phone calls are not allowed there. The idea is a quieter room for the people standing next to the work, not a ban on phones themselves.',
    outcome:
      'The National Gallery of Art says to use headphones when listening to mobile devices in the galleries, and asks that there be no phone calls.',
    source: {
      title: 'Guidelines and policies',
      publisher: 'National Gallery of Art',
      url: 'https://www.nga.gov/visit/guidelines-and-policies',
      asOf: '2026-11-13',
    },
  },
  {
    id: 'nga-no-food-in-galleries',
    title: 'No snacks next to the art',
    category: 'museum',
    scenario:
      'The National Gallery of Art wants food and drinks in its cafes, not in spaces that contain art. Water bottles are allowed if they stay closed in those rooms. Outside food has to stay sealed in a bag and may only be eaten outside or in the Sculpture Garden, with medical exceptions.',
    outcome:
      'The National Gallery of Art says to enjoy food and drinks in its cafes, not the galleries, to keep water bottles closed, and that there is no food or drinks in any space containing art. Outside food must remain in a sealed container in a bag and may only be consumed outside or in the outdoor Sculpture Garden, with listed medical exceptions.',
    source: {
      title: 'Guidelines and policies',
      publisher: 'National Gallery of Art',
      url: 'https://www.nga.gov/visit/guidelines-and-policies',
      asOf: '2026-11-13',
    },
  },
  {
    id: 'wmata-no-eating',
    title: 'No eating on Metro',
    category: 'transit',
    scenario:
      'On the Washington, D.C. Metro system, eating and drinking is not just frowned on. WMATA says it is unlawful to eat or drink in the system, and that Metro Transit Police can cite you for it. The same page also says smoking in the system is unlawful.',
    outcome:
      'WMATA\'s Metro manners page, updated May 19, 2026, says it is unlawful to eat or drink in the Metro system, and that customers can be cited by Metro Transit Police for violations.',
    source: {
      title: 'Metro manners',
      publisher: 'Washington Metropolitan Area Transit Authority',
      url: 'https://www.wmata.com/help/help-topics/trip-tools/being-nice-on-metro.html',
      asOf: '2026-05-19',
    },
  },
  {
    id: 'amtrak-one-seat',
    title: 'One seat in the Quiet Car',
    category: 'transit',
    scenario:
      'Amtrak asks Quiet Car passengers to occupy only one seat per person, and not to use the next seat for bags. If you board and the only seats left are in the Quiet Car, you still have to follow the quiet rules. On most of those trains, you cannot reserve that seat ahead of time.',
    outcome:
      'Amtrak says passengers are asked to occupy only one seat per person and not to use adjacent seat space for personal belongings, and that passengers who find that seats are only available in the Quiet Car must follow the Quiet Car guidelines. Except on Acela, Quiet Car seating cannot be reserved.',
    source: {
      title: 'Quiet Car',
      publisher: 'Amtrak',
      url: 'https://www.amtrak.com/quiet-car',
      asOf: '2026-11-13',
    },
  },
  {
    id: 'nga-kids-accompanied',
    title: 'Kids 12 and under stay with an adult',
    category: 'museum',
    scenario:
      'At the National Gallery of Art, children 12 and under must be with an adult at all times. Groups need one adult for every 10 children. Piggyback and shoulder rides are not allowed. Soft front baby carriers are fine. Backpack-style baby carriers are not.',
    outcome:
      'The National Gallery of Art says children 12 and under must be accompanied by an adult at all times, that groups must be accompanied by one adult per 10 children, that piggyback or shoulder rides are not allowed, that soft front baby carriers are allowed, and that backpack-style baby carriers are not permitted.',
    source: {
      title: 'Guidelines and policies',
      publisher: 'National Gallery of Art',
      url: 'https://www.nga.gov/visit/guidelines-and-policies',
      asOf: '2026-11-13',
    },
  },
  {
    id: 'yellowstone-no-feeding',
    title: 'Do not feed the squirrels',
    category: 'park',
    scenario:
      'Yellowstone says never feed wildlife, even birds and squirrels. Animals that learn to expect human food can get aggressive, and the park says they may then have to be killed. Those animals can also carry diseases. The rule is about chips and crumbs, not only about steak and sandwiches.',
    outcome:
      'Yellowstone National Park says never to feed wildlife, even birds and squirrels, because animals that become dependent on human food may become aggressive toward people and have to be killed, and because animals also carry diseases that can be transmitted to people.',
    source: {
      title: 'Safety',
      publisher: 'Yellowstone National Park, National Park Service',
      url: 'https://www.nps.gov/yell/planyourvisit/safety.htm',
      asOf: '2026-07-28',
    },
  },
];

export function getPromptById(id: string): Prompt {
  const prompt = PROMPTS.find((item) => item.id === id);
  if (!prompt) {
    throw new Error(`Unknown prompt: ${id}`);
  }
  return prompt;
}

export function getPromptByIndex(index: number): Prompt {
  const prompt = PROMPTS[index];
  if (!prompt) {
    throw new Error(`Prompt index out of range: ${index}`);
  }
  return prompt;
}
