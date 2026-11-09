/**
 * WorldScape — the painterly world, hand-built in SVG.
 *
 * The illustrated WithIn universe rendered entirely in code: a golden-hour
 * sky over a crystalline city — cumulus banks catching warm light, castle
 * spires rising from a ridge on the land, islands drifting in the heights,
 * dark foliage framing the world, glowing blossoms and beams of sun.
 *
 * Painterly, not vector: every organic mass passes through a
 * turbulence-displacement filter (#ws-roughen), so flat geometry becomes
 * textured, breathing matter. No raster assets, no fabricated imagery.
 *
 * A page can retint the world per-world with `[data-scene="…"]` (see
 * globals.css) without touching this file.
 *
 * Pure SVG/CSS. No JS. Respects prefers-reduced-motion.
 */

const WorldScape = () => {
  return (
    <div className="worldscape" aria-hidden data-worldscape>
      <svg
        className="worldscape__svg"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMax slice"
        role="presentation"
        focusable="false"
      >
        <defs>
          {/* ── Sky — indigo zenith falling into warm gold ── */}
          <linearGradient id="ws-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4b4187" />
            <stop offset="0.22" stopColor="#6f63a8" />
            <stop offset="0.45" stopColor="#9c8dba" />
            <stop offset="0.68" stopColor="#daa98e" />
            <stop offset="0.85" stopColor="#eccaa4" />
            <stop offset="1" stopColor="#f6e0bd" />
          </linearGradient>
          <radialGradient id="ws-sun" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff6d8" stopOpacity="0.85" />
            <stop offset="0.32" stopColor="#ffe7b0" stopOpacity="0.42" />
            <stop offset="1" stopColor="#f4c98c" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ws-haze" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffe6c6" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffe6c6" stopOpacity="0" />
          </radialGradient>

          {/* ── Matter gradients ── */}
          <linearGradient id="ws-rock" x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0" stopColor="#7a6cb4" />
            <stop offset="0.5" stopColor="#4b3f75" />
            <stop offset="1" stopColor="#2a224c" />
          </linearGradient>
          <linearGradient id="ws-rock-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8d80c0" />
            <stop offset="1" stopColor="#5d5094" />
          </linearGradient>
          <linearGradient id="ws-green" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#90bb90" />
            <stop offset="0.55" stopColor="#568567" />
            <stop offset="1" stopColor="#32504a" />
          </linearGradient>
          <linearGradient id="ws-green-rim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#cbd99d" stopOpacity="0.9" />
            <stop offset="1" stopColor="#90bb90" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ws-spire" x1="0" y1="0" x2="0.9" y2="0.72">
            <stop offset="0" stopColor="#675b96" />
            <stop offset="0.55" stopColor="#3e3369" />
            <stop offset="1" stopColor="#261e48" />
          </linearGradient>
          <linearGradient id="ws-spire-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9387c6" stopOpacity="0.72" />
            <stop offset="1" stopColor="#6d60a5" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="ws-fall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f2fbf7" stopOpacity="0.9" />
            <stop offset="0.65" stopColor="#dff2ec" stopOpacity="0.38" />
            <stop offset="1" stopColor="#d2e9e2" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ws-canopy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a4e3d" />
            <stop offset="1" stopColor="#142c21" />
          </linearGradient>
          <linearGradient id="ws-beam" x1="0" y1="0" x2="0.9" y2="1">
            <stop offset="0" stopColor="#fff0ca" stopOpacity="0.2" />
            <stop offset="1" stopColor="#fff0ca" stopOpacity="0" />
          </linearGradient>

          {/* ── Cloud paint — layered radial light ── */}
          <radialGradient id="ws-cloud" cx="0.5" cy="0.4" r="0.55">
            <stop offset="0" stopColor="#fdf7ec" stopOpacity="0.92" />
            <stop offset="0.55" stopColor="#f4e5da" stopOpacity="0.5" />
            <stop offset="1" stopColor="#e8d6e8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ws-cloud-gold" cx="0.5" cy="0.4" r="0.55">
            <stop offset="0" stopColor="#ffedc6" stopOpacity="0.92" />
            <stop offset="0.55" stopColor="#f8d8ae" stopOpacity="0.5" />
            <stop offset="1" stopColor="#efc9a4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ws-cloud-lilac" cx="0.5" cy="0.4" r="0.55">
            <stop offset="0" stopColor="#c9bde4" stopOpacity="0.8" />
            <stop offset="0.6" stopColor="#ac9ed4" stopOpacity="0.4" />
            <stop offset="1" stopColor="#9b8cca" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ws-cloud-shadow" cx="0.5" cy="0.42" r="0.55">
            <stop offset="0" stopColor="#7b6cab" stopOpacity="0.6" />
            <stop offset="1" stopColor="#7b6cab" stopOpacity="0" />
          </radialGradient>

          {/* ── The painter's hand — turbulence roughens every edge ── */}
          <filter id="ws-roughen" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.016" numOctaves="3" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="26" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="ws-roughen-soft" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.009 0.013" numOctaves="3" seed="13" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="42" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="ws-roughen-fine" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.025" numOctaves="3" seed="21" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="ws-blur-30" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="30" />
          </filter>
          <filter id="ws-blur-12" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <filter id="ws-blur-6" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="ws-blur-2" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="ws-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        {/* ═══════════ SKY ═══════════ */}
        <rect x="0" y="0" width="1600" height="1000" fill="url(#ws-sky)" />

        {/* faint sparkle field high in the indigo */}
        <g fill="#ffffff" className="ws-stars">
          <circle cx="210" cy="120" r="1.5" opacity="0.7" />
          <circle cx="405" cy="88" r="1.1" opacity="0.5" />
          <circle cx="640" cy="128" r="1.3" opacity="0.55" />
          <circle cx="890" cy="76" r="1.2" opacity="0.6" />
          <circle cx="1120" cy="62" r="1.5" opacity="0.5" />
          <circle cx="1330" cy="98" r="1.1" opacity="0.5" />
          <circle cx="1490" cy="160" r="1.3" opacity="0.4" />
          <circle cx="128" cy="266" r="1.1" opacity="0.35" />
          <circle cx="1420" cy="236" r="1.1" opacity="0.4" />
          <circle cx="530" cy="210" r="1" opacity="0.4" />
          <circle cx="968" cy="228" r="1" opacity="0.45" />
        </g>

        {/* ═══════════ THE SUN — low among the clouds ═══════════ */}
        <circle cx="1218" cy="336" r="360" fill="url(#ws-sun)" className="ws-sun" />
        <ellipse cx="1218" cy="336" rx="120" ry="90" fill="#ffe9bd" opacity="0.5" filter="url(#ws-blur-30)" />
        <ellipse cx="1218" cy="336" rx="52" ry="42" fill="#fff8e2" opacity="0.8" filter="url(#ws-blur-2)" />

        {/* horizontal light streaks — the painter's sky bands */}
        <g opacity="0.5">
          <rect x="0" y="240" width="1600" height="86" fill="#f3ddb8" opacity="0.07" />
          <rect x="0" y="350" width="1600" height="106" fill="#ffd9a4" opacity="0.08" />
          <rect x="0" y="474" width="1600" height="86" fill="#ffe9c8" opacity="0.06" />
        </g>

        {/* ═══════════ CUMULUS — irregular lobed banks, roughened edges ═══════════ */}
        <g className="ws-clouds">
          {/* high cool banks */}
          <g className="ws-drift-slower">
            <g filter="url(#ws-roughen)">
              <ellipse cx="230" cy="196" rx="250" ry="66" fill="url(#ws-cloud-lilac)" opacity="0.9" />
              <ellipse cx="340" cy="176" rx="140" ry="42" fill="url(#ws-cloud)" opacity="0.75" />
              <ellipse cx="470" cy="214" rx="180" ry="44" fill="url(#ws-cloud-lilac)" opacity="0.7" />
              <ellipse cx="120" cy="250" rx="170" ry="40" fill="url(#ws-cloud-lilac)" opacity="0.6" />
              <ellipse cx="105" cy="222" rx="90" ry="26" fill="url(#ws-cloud-shadow)" opacity="0.4" />
              <ellipse cx="415" cy="252" rx="140" ry="24" fill="url(#ws-cloud-shadow)" opacity="0.35" />

              <ellipse cx="800" cy="150" rx="240" ry="56" fill="url(#ws-cloud-lilac)" opacity="0.85" />
              <ellipse cx="920" cy="176" rx="150" ry="38" fill="url(#ws-cloud)" opacity="0.7" />
              <ellipse cx="880" cy="124" rx="120" ry="26" fill="url(#ws-cloud-lilac)" opacity="0.6" />
            </g>

            <g filter="url(#ws-roughen-soft)">
              <ellipse cx="1440" cy="188" rx="240" ry="60" fill="url(#ws-cloud)" opacity="0.9" />
              <ellipse cx="1310" cy="206" rx="150" ry="38" fill="url(#ws-cloud-lilac)" opacity="0.65" />
              <ellipse cx="1550" cy="142" rx="150" ry="36" fill="url(#ws-cloud-lilac)" opacity="0.55" />
              <ellipse cx="1380" cy="212" rx="170" ry="22" fill="url(#ws-cloud-shadow)" opacity="0.4" />
            </g>
          </g>

          {/* mid bright bank — crosses the sun, lit from within */}
          <g className="ws-drift">
            <g filter="url(#ws-roughen)">
              <ellipse cx="620" cy="384" rx="260" ry="56" fill="url(#ws-cloud)" opacity="0.9" />
              <ellipse cx="760" cy="360" rx="150" ry="40" fill="url(#ws-cloud-lilac)" opacity="0.7" />
              <ellipse cx="520" cy="364" rx="140" ry="34" fill="url(#ws-cloud-lilac)" opacity="0.72" />
              <ellipse cx="500" cy="398" rx="200" ry="24" fill="url(#ws-cloud-shadow)" opacity="0.45" />
              <ellipse cx="690" cy="404" rx="170" ry="22" fill="url(#ws-cloud-shadow)" opacity="0.4" />

              <ellipse cx="1000" cy="336" rx="180" ry="46" fill="url(#ws-cloud-gold)" opacity="0.9" />
              <ellipse cx="1090" cy="356" rx="120" ry="30" fill="url(#ws-cloud)" opacity="0.8" />
            </g>
            <g filter="url(#ws-roughen-soft)">
              <ellipse cx="1180" cy="322" rx="170" ry="42" fill="url(#ws-cloud-gold)" opacity="0.9" />
              <ellipse cx="1110" cy="348" rx="120" ry="28" fill="url(#ws-cloud)" opacity="0.75" />
              <ellipse cx="1160" cy="352" rx="150" ry="18" fill="url(#ws-cloud-shadow)" opacity="0.45" />
              <ellipse cx="1470" cy="336" rx="190" ry="40" fill="url(#ws-cloud-gold)" opacity="0.9" />
              <ellipse cx="1380" cy="368" rx="140" ry="30" fill="url(#ws-cloud)" opacity="0.7" />
              <ellipse cx="1450" cy="374" rx="160" ry="18" fill="url(#ws-cloud-shadow)" opacity="0.4" />
            </g>
          </g>

          {/* low warm cloud sea near the horizon */}
          <g className="ws-drift-slow">
            <g filter="url(#ws-roughen-soft)">
              <ellipse cx="260" cy="678" rx="360" ry="88" fill="url(#ws-cloud)" opacity="0.9" />
              <ellipse cx="160" cy="640" rx="220" ry="54" fill="url(#ws-cloud-lilac)" opacity="0.55" />
              <ellipse cx="420" cy="724" rx="280" ry="28" fill="url(#ws-cloud-shadow)" opacity="0.35" />
              <ellipse cx="700" cy="690" rx="380" ry="84" fill="url(#ws-cloud-gold)" opacity="0.85" />
              <ellipse cx="880" cy="742" rx="300" ry="26" fill="url(#ws-cloud-shadow)" opacity="0.3" />
              <ellipse cx="1240" cy="684" rx="400" ry="86" fill="url(#ws-cloud-gold)" opacity="0.9" />
              <ellipse cx="1540" cy="700" rx="260" ry="76" fill="url(#ws-cloud)" opacity="0.8" />
              <ellipse cx="1080" cy="736" rx="320" ry="26" fill="url(#ws-cloud-shadow)" opacity="0.32" />
            </g>
          </g>
        </g>

        {/* ═══════════ FAR RIDGE — thin spires dissolving into the haze ═══════════ */}
        <g opacity="0.42" filter="url(#ws-blur-6)" className="ws-far">
          <path
            d="M852 700 L852 480 Q858 452 872 438 L884 398 L892 372 L898 398 L910 438 Q924 452 930 480 L930 700 Z"
            fill="url(#ws-spire-far)"
          />
          <path
            d="M1052 700 L1052 512 Q1058 488 1070 476 L1078 448 L1084 476 Q1094 488 1100 512 L1100 700 Z"
            fill="url(#ws-spire-far)"
          />
          <path d="M940 700 L940 560 Q944 540 956 530 L970 520 L984 530 Q996 540 1000 560 L1000 700 Z" fill="url(#ws-spire-far)" />
          <path d="M1130 700 L1130 560 L1150 560 L1150 700 Z" fill="url(#ws-spire-far)" />
        </g>

        {/* ═══════════ THE CITADEL RIDGE — towers rising from the land ═══════════ */}
        <g className="ws-city" opacity="0.97">
          {/* the land — a ridge rising from the bottom edge, no floating slab */}
          <path
            d="M40 1000 Q110 910 180 840 Q234 784 300 756 Q366 724 440 714 Q530 700 630 704 Q744 700 824 716 Q872 730 908 756 Q932 790 936 836 Q934 900 918 960 Q908 984 900 1000 Z"
            fill="#333055"
          />
          <path
            d="M40 1000 Q110 910 180 840 Q234 784 300 756 Q366 724 440 714 Q530 700 630 704 Q744 700 824 716 Q872 730 908 756 L930 800 Q900 786 850 776 Q740 754 600 756 Q450 758 340 780 Q240 804 160 880 Q90 950 70 1000 Z"
            fill="url(#ws-rock)"
          />
          {/* meadow brow along the ridge */}
          <g filter="url(#ws-roughen-fine)">
            <path
              d="M300 756 Q366 724 440 714 Q530 700 630 704 Q744 700 824 716 L818 738 Q700 714 560 720 Q440 728 340 764 Z"
              fill="url(#ws-green)"
              opacity="0.8"
            />
            <path
              d="M330 750 Q400 726 500 718 Q600 710 720 716 Q800 722 840 732 Q760 706 600 712 Q460 718 330 750 Z"
              fill="#b7cc92"
              opacity="0.4"
            />
          </g>

          {/* towers — the crown of the ridge, varied heights, clustered */}
          <g filter="url(#ws-roughen-fine)">
            <g fill="url(#ws-spire)">
              <path d="M470 730 L470 560 Q472 532 484 512 L492 496 L504 472 L516 512 Q528 532 530 560 L530 730 Z" />
              <path d="M556 726 L556 500 Q558 470 572 448 L580 434 L588 448 Q602 470 604 500 L604 726 Z" />
              <path d="M660 722 L660 396 Q662 362 676 340 L684 326 L692 340 Q706 362 708 396 L708 722 Z" />
              <path d="M740 730 L740 528 Q742 498 756 478 L764 464 L772 478 Q786 498 788 528 L788 730 Z" />
              <path d="M830 742 L830 616 Q832 592 844 574 L850 562 L858 574 Q870 592 872 616 L872 742 Z" />
              <path d="M900 756 L900 586 Q902 558 916 538 L924 524 L932 538 Q946 558 948 586 L948 756 Z" />
              <path d="M398 748 L398 642 Q400 618 412 602 L418 592 L424 602 Q436 618 438 642 L438 748 Z" />
            </g>
            {/* central great spire — taller than the rest */}
            <path
              d="M652 722 L652 300 Q654 268 668 246 L674 234 L682 208 L690 234 L696 246 Q710 268 716 300 L716 722 Z"
              fill="url(#ws-spire)"
            />
            {/* sun rim on the right flanks */}
            <g fill="#c8bcec" opacity="0.4">
              <path d="M690 234 L696 246 Q710 268 716 300 L716 722 L708 722 L708 300 Q702 268 690 246 Z" />
              <path d="M588 448 Q602 470 604 500 L604 726 L596 726 L596 500 Q594 470 582 450 Z" />
              <path d="M932 538 Q946 558 948 586 L948 756 L940 756 L940 586 Q938 560 926 540 Z" />
            </g>
          </g>
          {/* lit windows */}
          <g fill="#ffd98f" className="ws-windows">
            <circle cx="504" cy="520" r="2.4" opacity="0.9" />
            <circle cx="516" cy="580" r="2.2" opacity="0.7" />
            <circle cx="582" cy="470" r="2.4" opacity="0.8" />
            <circle cx="592" cy="540" r="2.2" opacity="0.65" />
            <circle cx="682" cy="332" r="2.6" opacity="0.9" />
            <circle cx="696" cy="404" r="2.4" opacity="0.75" />
            <circle cx="668" cy="470" r="2.4" opacity="0.7" />
            <circle cx="700" cy="540" r="2.4" opacity="0.6" />
            <circle cx="676" cy="610" r="2.2" opacity="0.6" />
            <circle cx="764" cy="500" r="2.4" opacity="0.75" />
            <circle cx="776" cy="560" r="2.2" opacity="0.6" />
            <circle cx="852" cy="600" r="2.2" opacity="0.65" />
            <circle cx="924" cy="548" r="2.4" opacity="0.7" />
            <circle cx="936" cy="610" r="2.2" opacity="0.55" />
            <circle cx="418" cy="620" r="2" opacity="0.6" />
          </g>
          {/* small fan of windows around the great spire crown */}
          <g fill="#ffe9b8" opacity="0.55" filter="url(#ws-blur-2)">
            <circle cx="684" cy="252" r="5" />
            <circle cx="656" cy="286" r="4" />
            <circle cx="712" cy="292" r="4" />
          </g>
        </g>

        {/* ═══════════ FLOATING ISLANDS — small, varied, high ═══════════ */}
        {/* — hero island, upper left: a drifting crooked rock — */}
        <g className="ws-island-a">
          <g filter="url(#ws-roughen-fine)">
            {/* meadow top, rim-lit */}
            <ellipse cx="348" cy="240" rx="80" ry="20" fill="url(#ws-green)" />
            <ellipse cx="344" cy="235" rx="70" ry="12" fill="#b7cc92" opacity="0.9" />
            {/* rock body, asymmetric + jagged bottom */}
            <path
              d="M278 246 Q300 232 330 228 Q362 224 392 232 Q418 240 436 252 Q428 282 398 296 Q358 312 322 302 Q290 292 272 266 Q272 254 278 246 Z"
              fill="url(#ws-rock)"
            />
            <path
              d="M292 292 Q312 316 334 324 Q354 330 374 322 Q350 340 326 334 Q306 328 292 292 Z"
              fill="#231d48"
              opacity="0.9"
            />
            <path d="M344 322 Q352 344 364 356 Q364 338 372 326 Z" fill="#1c1740" opacity="0.85" />
            <path d="M404 282 Q420 292 430 306 Q418 302 406 292 Z" fill="#1c1740" opacity="0.8" />
          </g>
          {/* rim light along the top lip */}
          <path
            d="M286 242 Q322 226 372 230"
            stroke="#edf4cb"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
            filter="url(#ws-blur-2)"
          />
          {/* a single tiny crown of blocks — a watchpost */}
          <g fill="url(#ws-spire)">
            <path d="M330 226 L330 196 Q331 188 336 182 L339 172 L343 182 Q348 188 349 196 L349 226 Z" />
          </g>
          <g fill="#ffdf9e">
            <circle cx="339" cy="190" r="1.5" opacity="0.9" />
          </g>
          {/* waterfall — falling light */}
          <path
            d="M408 254 Q414 300 428 338 Q436 360 444 374"
            stroke="url(#ws-fall)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            opacity="0.62"
            filter="url(#ws-blur-2)"
            className="ws-fall"
          />
          <ellipse cx="426" cy="380" rx="20" ry="5.5" fill="#eef8f4" opacity="0.4" filter="url(#ws-blur-6)" />
        </g>

        {/* — mid island, right: a quiet homestead block — */}
        <g className="ws-island-b">
          <g filter="url(#ws-roughen-fine)">
            <ellipse cx="1428" cy="404" rx="64" ry="16" fill="url(#ws-green)" />
            <ellipse cx="1423" cy="399" rx="56" ry="9" fill="#b7cc92" opacity="0.9" />
            <path
              d="M1374 408 Q1392 398 1420 394 Q1454 390 1478 402 Q1470 426 1444 436 Q1412 448 1386 436 Q1374 424 1374 408 Z"
              fill="url(#ws-rock)"
            />
            <path d="M1396 432 Q1406 446 1420 452 Q1426 440 1434 432 Z" fill="#1c1740" opacity="0.85" />
            <path
              d="M1380 404 Q1406 390 1440 394"
              stroke="#edf4cb"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.45"
            />
          </g>
          {/* little block houses */}
          <g fill="url(#ws-spire)">
            <path d="M1408 396 L1408 368 L1416 368 L1416 362 L1424 356 L1432 362 L1432 368 L1440 368 L1440 396 Z" />
            <path d="M1448 398 L1448 378 L1464 378 L1464 398 Z" />
            <path d="M1470 400 L1470 384 Q1470 380 1474 378 L1478 373 L1482 378 Q1486 380 1486 384 L1486 400 Z" />
          </g>
          <g fill="#ffdf9e">
            <circle cx="1422" cy="372" r="1.4" opacity="0.9" />
            <circle cx="1456" cy="388" r="1.2" opacity="0.8" />
          </g>
          <path
            d="M1470 410 Q1472 448 1482 482"
            stroke="url(#ws-fall)"
            strokeWidth="5.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
            className="ws-fall-late"
          />
        </g>

        {/* — high islets, tiny and soft — */}
        <g className="ws-islet" opacity="0.85">
          <g filter="url(#ws-blur-2)">
            <ellipse cx="712" cy="196" rx="26" ry="8" fill="url(#ws-rock-far)" />
            <ellipse cx="710" cy="192" rx="20" ry="4.5" fill="#8fbb90" />
            <ellipse cx="980" cy="250" rx="20" ry="6.5" fill="url(#ws-rock-far)" />
            <ellipse cx="978" cy="247" rx="15" ry="3.5" fill="#8fbb90" />
            <ellipse cx="70" cy="356" rx="30" ry="8" fill="url(#ws-rock-far)" />
            <ellipse cx="68" cy="353" rx="22" ry="4" fill="#8fbb90" />
          </g>
        </g>

        {/* ═══════════ RIGHT FOREGROUND CAPE — low, dark, quiet ═══════════ */}
        <g className="ws-ground">
          <g filter="url(#ws-roughen)">
            <path
              d="M1600 1000 L1600 800 Q1530 788 1478 810 Q1438 828 1450 868 Q1434 900 1466 924 Q1514 960 1600 972 Z"
              fill="#22382c"
            />
            <path d="M1600 800 Q1530 788 1478 810 Q1502 796 1545 792 Q1575 792 1600 798 Z" fill="#a9c48f" opacity="0.45" />
          </g>
        </g>

        {/* ═══════════ CANOPY — framing foliage ═══════════ */}
        <g className="ws-canopy-g">
          {/* upper-left canopy */}
          <g filter="url(#ws-roughen-fine)">
            <path
              d="M0 0 L340 0 Q280 26 220 32 Q148 44 100 86 Q46 116 0 106 Z"
              fill="url(#ws-canopy)"
            />
            <path
              d="M0 52 Q74 60 142 88 Q90 98 42 128 Q18 142 0 140 Z"
              fill="url(#ws-canopy)"
              opacity="0.85"
            />
            <ellipse cx="190" cy="50" rx="86" ry="17" fill="#2c5343" opacity="0.85" filter="url(#ws-blur-6)" />
            <ellipse cx="312" cy="16" rx="116" ry="15" fill="#2c5343" opacity="0.75" filter="url(#ws-blur-6)" />
          </g>
          {/* upper-right canopy */}
          <g filter="url(#ws-roughen-fine)">
            <path
              d="M1600 0 L1290 0 Q1346 28 1412 38 Q1490 50 1532 92 Q1570 118 1600 114 Z"
              fill="url(#ws-canopy)"
            />
            <ellipse cx="1370" cy="34" rx="106" ry="17" fill="#2c5343" opacity="0.8" filter="url(#ws-blur-6)" />
          </g>
          {/* framing fronds */}
          <g fill="#1d382c" className="ws-fronds">
            <path d="M-12 392 Q84 330 142 232 Q98 292 94 358 Q58 398 -12 412 Z" filter="url(#ws-roughen-fine)" />
            <path d="M1630 336 Q1524 292 1472 200 Q1522 262 1532 336 Q1562 372 1630 384 Z" filter="url(#ws-roughen-fine)" />
          </g>
          {/* glowing blossoms — soft, tucked into the fronds */}
          <g filter="url(#ws-blur-2)" className="ws-blossoms">
            <circle cx="80" cy="398" r="5.5" fill="#bd8fe0" opacity="0.8" />
            <circle cx="80" cy="398" r="2" fill="#efdcfc" />
            <circle cx="100" cy="272" r="4.5" fill="#d4a7e8" opacity="0.7" />
            <circle cx="100" cy="272" r="1.6" fill="#f4e3fc" />
            <circle cx="1496" cy="248" r="5.5" fill="#d4a7e8" opacity="0.75" />
            <circle cx="1496" cy="248" r="2" fill="#f4e3fc" />
          </g>
        </g>

        {/* ═══════════ LIGHT ═══════════ */}
        {/* diagonal beams falling from the sun, low and left */}
        <g className="ws-beams">
          <path d="M1150 320 L780 920 L920 960 L1230 490 Z" fill="url(#ws-beam)" opacity="0.7" />
          <path d="M1270 340 L1000 900 L1110 940 L1330 500 Z" fill="url(#ws-beam)" opacity="0.5" />
        </g>
        {/* warm haze at the horizon */}
        <ellipse cx="780" cy="650" rx="860" ry="150" fill="url(#ws-haze)" opacity="0.55" filter="url(#ws-blur-30)" />
        {/* ribbons of mist drifting across the base */}
        <g className="ws-mist" opacity="0.4">
          <g filter="url(#ws-roughen-soft)">
            <ellipse cx="460" cy="956" rx="620" ry="70" fill="url(#ws-cloud)" opacity="0.8" />
            <ellipse cx="1290" cy="966" rx="580" ry="60" fill="url(#ws-cloud-gold)" opacity="0.85" />
          </g>
        </g>
      </svg>

      {/* CSS-level overlays: vignette + world tint hooks */}
      <div className="worldscape__vignette" aria-hidden />
      <div className="worldscape__tint" aria-hidden />
    </div>
  );
};

export default WorldScape;
