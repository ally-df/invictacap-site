/** "A Bullet That Thinks" — carried over verbatim from invictacap.co/insights. */

export type EssayBlock =
  | { type: "p"; text: string; drop?: boolean }
  | { type: "pull"; text: string }
  | { type: "figure"; caption: string; figure: "repricing" | "ledger" | "margin" | "mesh" };

export type EssaySection = { numeral: string; title: string; blocks: EssayBlock[] };

export const essay = {
  slug: "a-bullet-that-thinks",
  title: "A Bullet That Thinks",
  voxelTitle: ["A BULLET", "THAT THINKS"],
  dek: "Notes on drones, autonomy, and the coming architecture of deterrence.",
  byline: "Invicta / Research Notes / 2026",
  category: "Defense Technology",
  year: "2026",
  author: "Invicta Capital Partners",
  sections: [
    {
      numeral: "I.",
      title: "Repricing",
      blocks: [
        {
          type: "p",
          drop: true,
          text: "Military history is, among other things, a history of cost curves. Castles made offense expensive and conquest rare. Gunpowder ended the castle and enabled the nation state. The aircraft carrier turned power projection into a function of GDP. In each case the decisive weapon was scarce, and that scarcity is why military power has correlated so tightly with national wealth.",
        },
        {
          type: "figure",
          figure: "repricing",
          caption: "FIG.01  Four repricings. The decisive weapon reaches consumer electronics economics for the first time.",
        },
        {
          type: "p",
          text: "The decisive weapon of this century is a few hundred dollars of carbon fiber, a brushless motor, a battery from a commercial supply chain, and, increasingly, some intelligence. For the first time, the strategically decisive weapon has the unit economics of consumer electronics, and it sits on the one cost curve humanity actually knows how to bend downward, the price of computation. When the decisive weapon gets cheap, everything priced against the old scarcity has to be repriced: tanks, carriers, alliances, and ultimately the price of aggression itself. Repricings of this size come along about twice a century.",
        },
        { type: "pull", text: "They are not the sort of thing an investor should sit out." },
      ],
    },
    {
      numeral: "II.",
      title: "The Ledger",
      blocks: [
        {
          type: "p",
          text: "Start with the arithmetic, which is visible from Eastern Europe to the Red Sea. A first person view drone that costs a few hundred dollars destroys a tank that costs ten million. A loitering munition built for thirty thousand dollars draws an interceptor that costs a million or more to fire.",
        },
        {
          type: "figure",
          figure: "ledger",
          caption: "FIG.02  The exchange ratio. Attacker cost in gold, defender cost in gray. The asymmetry runs one way and compounds with volume.",
        },
        {
          type: "p",
          text: "Ukraine, a mid sized economy at war, went from nearly nothing to producing drones by the millions, and unmanned systems now account for a vast majority of battlefield casualties there. Meanwhile global defense spending runs around $2.9 trillion and is growing at a rate not seen since the cold war.",
        },
        {
          type: "p",
          text: "The deeper point is that there are no diminishing returns to more and better drones. A tenth aircraft carrier adds little to the ninth. The ten thousandth drone is worth about as much as the first, because attritable systems are consumed, and consumption is the strategy. The business model has shifted. For seventy years the West bought exquisite quality instead of quantity, because quantity was priced in human lives. Autonomy takes the human out of the numerator, quantity gets repriced in capital, and capital scales. An arms race with no diminishing returns does not wind down, it compounds. The drone share of defense budgets has, we believe, only one direction to travel for the rest of our careers.",
        },
      ],
    },
    {
      numeral: "III.",
      title: "The Bottleneck",
      blocks: [
        {
          type: "p",
          text: "Today's FPV drone still carries a hidden weak link, the radio signal back to a human pilot. It can be jammed, spoofed, and severed. It is also a throughput constraint, since one trained operator flies one drone, and operators are scarce or at least limited. Autonomy relaxes each of these constraints. A drone that finds, discriminates, and guides itself cannot be jammed into blindness, because there is nothing left to jam. And a single human intention can be executed by a hundred UAS units rather than one. It is far more than an incremental improvement. It is closer to the jump from musket to machine gun, a human limited process becoming an industrial one.",
        },
        {
          type: "p",
          text: "What is actually being built, across a hundred programs in a dozen countries, is a bullet that thinks. It perceives, it decides within limits humans set, it costs little, and it comes off commercial production lines. Against that object, the great platforms of the industrial age start to look like stranded assets. A tank does not fare well against a five hundred dollar adversary. In fact a tank should be thought of as a liability when these conditions are met. One need only look to Iran and their application of Moneyball tactics to fully grasp our view on drones.",
        },
        {
          type: "p",
          text: "So the investment implication follows directly: airframes will commoditize the way consumer hardware always has, and autonomy software will concentrate value the way operating systems did. The margins live in the software.",
        },
        {
          type: "figure",
          figure: "margin",
          caption: "FIG.03  Where the margin lives. Airframes commoditize like consumer hardware; autonomy software concentrates value like operating systems.",
        },
      ],
    },
    {
      numeral: "IV.",
      title: "The Flat Arsenal",
      blocks: [
        {
          type: "p",
          text: "The industrial age arsenal was a pyramid: a handful of primes at the top, ten thousand bespoke subcontractors underneath, decades long programs, cost plus economics, and scarcity as the business model. The emerging arsenal is a mesh with three load bearing layers. 1.) Space is the sensing and communications canopy. 2.) Cyber is the contested nervous system. 3.) Drones are the effectors.",
        },
        {
          type: "figure",
          figure: "mesh",
          caption: "FIG.04  From the pyramid to the mesh. Three load bearing layers, fed by compute, energy, and magnets.",
        },
        {
          type: "p",
          text: "Flat supply chains behave the way they have behaved in every industry software has restructured: iteration in weeks, marginal costs that fall with volume, and new entrants that reach strategic relevance in years rather than generations, with the strongest of them now valued in the tens of billions. Note also what feeds the mesh. Autonomy runs on compute, compute runs on energy, and everything that moves runs on magnets, so the defense transition is an industrial transition too, a re shoring of the physical inputs of autonomy. This is why our aperture is wider than airframes. The picks and shovels of deterrence are as investable as the deterrent itself.",
        },
      ],
    },
    {
      numeral: "V.",
      title: "Position",
      blocks: [
        {
          type: "p",
          text: "We have now closed our second investment in defense technology, and we doubt it will be our last. The case compresses well. The repricing of force is the largest reallocation of government capital in two generations, and it has barely begun. Value will concentrate in autonomy software, in the three layers of the flat arsenal, and in the physical inputs beneath them. The winners will pair a startup's cohesion with a factory's scale. And the moral arc of the thesis bends, we believe, toward fewer wars, because the entire point of a deterrent that works is that it is never used.",
        },
        {
          type: "p",
          text: "Capital deployed into weapons does need a justification beyond return, and ours is the old one: si vis pacem, para bellum. The free world's peace has always been underwritten by its arsenal. That arsenal is changing form, from scarce steel to abundant silicon, from the few and exquisite to the many and cheap. We would rather the democracies own that transition than watch it owned.",
        },
        { type: "pull", text: "The sky is getting cheaper. Watched well, it is how the ground stays quiet." },
      ],
    },
  ] as EssaySection[],
  sources: [
    {
      n: 1,
      org: "Stockholm International Peace Research Institute",
      title: "Trends in World Military Expenditure, 2025",
      href: "https://www.sipri.org/publications/2026/sipri-fact-sheets/trends-world-military-expenditure-2025",
      note: "(April 2026). World military expenditure reached $2,887 billion in 2025, an eleventh consecutive year of growth.",
    },
    {
      n: 2,
      org: "Council on Foreign Relations",
      title: "How Ukraine's Drone Innovation Reversed Russia's Momentum",
      href: "https://www.cfr.org/articles/how-ukraines-drone-innovation-reversed-russias-momentum",
      note: "(June 2026). Ukraine produced an estimated four million robotic and autonomous systems in 2025, with drones generating 75 to 85 percent of frontline casualties.",
    },
    {
      n: 3,
      org: "Just Security",
      title: "How Ukraine Became a Drone Superpower",
      href: "https://www.justsecurity.org/138164/ukraine-drone-superpower/",
      note: "(June 2026). On interceptor economics: a $2,500 interceptor drone performs work otherwise assigned to missiles costing $3 million or more per shot.",
    },
  ],
  disclaimer:
    "This essay reflects the views of Invicta Capital Partners LLC, is provided for informational purposes only, and does not constitute an offer to sell or a solicitation of an offer to buy any security. Figures cited are drawn from public reporting and are approximate, illustrative, and subject to revision. Private investments are speculative and involve a high degree of risk.",
} as const;
