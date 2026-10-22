import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Let's create an SVG with multiple sparkle stars, crosses, and glowing dots
function createSparkleStar(cx, cy, r, color = '#ffffff', haloColor = '#ffeef5', angle = 0, opacity = 1.0) {
  const rx = r;
  const ry = r * 1.15; // slightly taller for elegance
  const innerR = r * 0.45;
  const coreR = Math.max(2, r * 0.18);

  // We can add rotation if angle != 0
  const transform = angle !== 0 ? `transform="rotate(${angle} ${cx} ${cy})"` : '';

  return `
    <!-- Star at (${cx}, ${cy}) radius ${r} -->
    <g opacity="${opacity}" ${transform}>
      <!-- Soft outer halo -->
      <circle cx="${cx}" cy="${cy}" r="${r * 0.75}" fill="${haloColor}" opacity="0.35" filter="url(#halo-blur)" />
      <!-- Mid glow -->
      <circle cx="${cx}" cy="${cy}" r="${r * 0.45}" fill="#ffffff" opacity="0.6" filter="url(#soft-blur)" />
      <!-- 4-point pinched star outer -->
      <path d="M ${cx} ${cy - ry} Q ${cx} ${cy} ${cx + rx} ${cy} Q ${cx} ${cy} ${cx} ${cy + ry} Q ${cx} ${cy} ${cx - rx} ${cy} Z"
            fill="${color}" opacity="0.85" filter="url(#star-glow)" />
      <!-- 4-point pinched star inner white core -->
      <path d="M ${cx} ${cy - ry * 0.7} Q ${cx} ${cy} ${cx + rx * 0.7} ${cy} Q ${cx} ${cy} ${cx} ${cy + ry * 0.7} Q ${cx} ${cy} ${cx - rx * 0.7} ${cy} Z"
            fill="#ffffff" opacity="0.95" />
      <!-- Tiny 45-degree diagonal rays (8-point shimmer) -->
      <path d="M ${cx} ${cy - innerR * 0.55} Q ${cx} ${cy} ${cx + innerR * 0.55} ${cy} Q ${cx} ${cy} ${cx} ${cy + innerR * 0.55} Q ${cx} ${cy} ${cx - innerR * 0.55} ${cy} Z"
            fill="#ffffff" opacity="0.8" transform="rotate(45 ${cx} ${cy})" />
      <!-- Pure white intense core pin-point -->
      <circle cx="${cx}" cy="${cy}" r="${coreR}" fill="#ffffff" />
    </g>
  `;
}

function createDot(cx, cy, r, color = '#ffffff', opacity = 0.8) {
  return `
    <g opacity="${opacity}">
      <circle cx="${cx}" cy="${cy}" r="${r * 1.5}" fill="${color}" opacity="0.4" filter="url(#soft-blur)" />
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="0.95" />
      <circle cx="${cx}" cy="${cy}" r="${Math.max(1, r * 0.5)}" fill="#ffffff" />
    </g>
  `;
}

async function main() {
  const inputPath = 'C:/Users/ingri/.gemini/antigravity/brain/1d4cf4c6-9825-495f-8b2b-6746624803b3/.user_uploaded/media_1792602138006_c2520145.jpg';
  const meta = await sharp(inputPath).metadata();
  const W = meta.width;
  const H = meta.height;
  console.log(`Input dimensions: ${W}x${H}`);

  // Build sparkle list based on the layout of box_with_snacks.jpg scaled to 1024x763
  // Open areas:
  // Top left: x: 40..250, y: 30..220
  // Top center: x: 300..750, y: 20..140
  // Top right: x: 750..980, y: 30..200
  // Left side: x: 40..170, y: 280..620
  // Right side: x: 840..980, y: 260..600
  // Subtle accents: on 3D logo, on card, on Twix

  const stars = [
    // --- TOP RIGHT CONSTELLATION ---
    { cx: 935, cy: 75, r: 28, color: '#ffffff', halo: '#ffeef5', angle: 3, op: 0.95 },
    { cx: 875, cy: 110, r: 16, color: '#fff9e6', halo: '#ffd670', angle: -5, op: 0.85 },
    { cx: 965, cy: 135, r: 12, color: '#f0fbff', halo: '#70d6bc', angle: 8, op: 0.75 },
    { cx: 820, cy: 60, r: 14, color: '#ffffff', halo: '#ff70a6', angle: 0, op: 0.8 },
    { cx: 895, cy: 45, r: 9, color: '#ffffff', halo: '#ffeef5', angle: 12, op: 0.7 },

    // --- TOP CENTER / ABOVE LID ---
    { cx: 520, cy: 40, r: 20, color: '#ffffff', halo: '#ffeef5', angle: -2, op: 0.9 },
    { cx: 380, cy: 35, r: 17, color: '#fffdf0', halo: '#ffd670', angle: 5, op: 0.85 },
    { cx: 645, cy: 30, r: 15, color: '#f0fbff', halo: '#70d6bc', angle: -8, op: 0.8 },
    { cx: 450, cy: 55, r: 11, color: '#ffffff', halo: '#ff70a6', angle: 15, op: 0.7 },
    { cx: 720, cy: 50, r: 10, color: '#ffffff', halo: '#ffeef5', angle: 4, op: 0.75 },

    // --- TOP LEFT CONSTELLATION ---
    { cx: 210, cy: 85, r: 24, color: '#ffffff', halo: '#ffeef5', angle: -4, op: 0.95 },
    { cx: 130, cy: 65, r: 15, color: '#fffbe6', halo: '#ffd670', angle: 6, op: 0.8 },
    { cx: 95, cy: 125, r: 18, color: '#f0fbff', halo: '#70d6bc', angle: -10, op: 0.85 },
    { cx: 165, cy: 135, r: 11, color: '#ffffff', halo: '#ff70a6', angle: 7, op: 0.7 },
    { cx: 60, cy: 75, r: 10, color: '#ffffff', halo: '#ffeef5', angle: 0, op: 0.7 },

    // --- MID & LOWER LEFT ---
    { cx: 80, cy: 360, r: 22, color: '#ffffff', halo: '#ffeef5', angle: 5, op: 0.9 },
    { cx: 135, cy: 320, r: 12, color: '#fff9e6', halo: '#ffd670', angle: -6, op: 0.75 },
    { cx: 65, cy: 450, r: 16, color: '#f0fbff', halo: '#70d6bc', angle: 8, op: 0.85 },
    { cx: 115, cy: 510, r: 13, color: '#ffffff', halo: '#ff70a6', angle: -4, op: 0.8 },
    { cx: 70, cy: 580, r: 19, color: '#ffffff', halo: '#ffeef5', angle: 2, op: 0.85 },
    { cx: 130, cy: 620, r: 11, color: '#fffbe6', halo: '#ffd670', angle: 10, op: 0.7 },

    // --- MID & LOWER RIGHT ---
    { cx: 935, cy: 310, r: 17, color: '#ffffff', halo: '#ffeef5', angle: -6, op: 0.85 },
    { cx: 875, cy: 370, r: 13, color: '#f0fbff', halo: '#70d6bc', angle: 4, op: 0.8 },
    { cx: 945, cy: 440, r: 25, color: '#ffffff', halo: '#ffeef5', angle: 6, op: 0.95 },
    { cx: 885, cy: 490, r: 14, color: '#fff9e6', halo: '#ffd670', angle: -8, op: 0.75 },
    { cx: 925, cy: 550, r: 24, color: '#ffffff', halo: '#ffeef5', angle: 3, op: 0.9 },
    { cx: 860, cy: 600, r: 16, color: '#f0fbff', halo: '#70d6bc', angle: -5, op: 0.8 },
    { cx: 915, cy: 650, r: 12, color: '#ffffff', halo: '#ff70a6', angle: 12, op: 0.75 },

    // --- SUBTLE GLINTS ON BOX & PRODUCTS ---
    { cx: 508, cy: 755, r: 8, color: '#e0f8ff', halo: '#70d6bc', angle: 15, op: 0.85 }, // on "Club" letter
    { cx: 388, cy: 730, r: 7, color: '#e0f8ff', halo: '#70d6bc', angle: -10, op: 0.8 }, // on "Fudi" letter
    { cx: 775, cy: 630, r: 9, color: '#fff4cc', halo: '#ffd670', angle: 45, op: 0.85 }, // on Twix gold foil
    { cx: 238, cy: 555, r: 7, color: '#ffeef5', halo: '#ff70a6', angle: 20, op: 0.75 }  // on card corner
  ];

  const dots = [
    // Top right dots
    { cx: 915, cy: 95, r: 2.5, c: '#ffffff', op: 0.8 },
    { cx: 955, cy: 60, r: 3.5, c: '#ffd670', op: 0.85 },
    { cx: 975, cy: 95, r: 2.0, c: '#70d6bc', op: 0.75 },
    { cx: 855, cy: 85, r: 2.5, c: '#ff70a6', op: 0.7 },
    { cx: 890, cy: 135, r: 3.0, c: '#ffffff', op: 0.8 },
    { cx: 935, cy: 160, r: 2.0, c: '#ffd670', op: 0.75 },
    { cx: 835, cy: 120, r: 2.5, c: '#ffffff', op: 0.7 },

    // Top center dots
    { cx: 495, cy: 25, r: 2.5, c: '#ffd670', op: 0.8 },
    { cx: 545, cy: 60, r: 3.0, c: '#ffffff', op: 0.85 },
    { cx: 415, cy: 50, r: 2.0, c: '#70d6bc', op: 0.75 },
    { cx: 620, cy: 45, r: 2.5, c: '#ff70a6', op: 0.7 },
    { cx: 670, cy: 25, r: 2.0, c: '#ffffff', op: 0.8 },
    { cx: 580, cy: 30, r: 2.5, c: '#ffd670', op: 0.75 },

    // Top left dots
    { cx: 185, cy: 65, r: 3.0, c: '#ffffff', op: 0.85 },
    { cx: 235, cy: 115, r: 2.5, c: '#ffd670', op: 0.8 },
    { cx: 155, cy: 105, r: 2.0, c: '#70d6bc', op: 0.75 },
    { cx: 110, cy: 90, r: 2.5, c: '#ff70a6', op: 0.7 },
    { cx: 75, cy: 145, r: 3.0, c: '#ffffff', op: 0.8 },
    { cx: 140, cy: 160, r: 2.0, c: '#ffd670', op: 0.7 },

    // Mid & lower left dots
    { cx: 55, cy: 330, r: 2.5, c: '#ffffff', op: 0.75 },
    { cx: 105, cy: 385, r: 3.0, c: '#ffd670', op: 0.8 },
    { cx: 50, cy: 420, r: 2.0, c: '#70d6bc', op: 0.7 },
    { cx: 90, cy: 475, r: 2.5, c: '#ff70a6', op: 0.75 },
    { cx: 55, cy: 520, r: 2.5, c: '#ffffff', op: 0.75 },
    { cx: 95, cy: 555, r: 3.0, c: '#ffd670', op: 0.8 },
    { cx: 50, cy: 620, r: 2.0, c: '#70d6bc', op: 0.7 },
    { cx: 100, cy: 645, r: 2.5, c: '#ffffff', op: 0.8 },

    // Mid & lower right dots
    { cx: 960, cy: 330, r: 2.5, c: '#ffd670', op: 0.8 },
    { cx: 910, cy: 345, r: 2.0, c: '#ffffff', op: 0.75 },
    { cx: 860, cy: 415, r: 2.5, c: '#70d6bc', op: 0.75 },
    { cx: 965, cy: 415, r: 3.0, c: '#ff70a6', op: 0.8 },
    { cx: 915, cy: 470, r: 2.0, c: '#ffffff', op: 0.75 },
    { cx: 960, cy: 515, r: 2.5, c: '#ffd670', op: 0.8 },
    { cx: 895, cy: 575, r: 3.0, c: '#ffffff', op: 0.85 },
    { cx: 955, cy: 585, r: 2.0, c: '#70d6bc', op: 0.75 },
    { cx: 890, cy: 630, r: 2.5, c: '#ff70a6', op: 0.75 },
    { cx: 940, cy: 670, r: 2.0, c: '#ffffff', op: 0.8 }
  ];

  const svgContent = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Soft blur for glows -->
        <filter id="soft-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <!-- Wider halo blur -->
        <filter id="halo-blur" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <!-- Star ray glow -->
        <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Render all stars -->
      ${stars.map(s => createSparkleStar(s.cx, s.cy, s.r, s.color, s.halo, s.angle, s.op)).join('\n')}

      <!-- Render all sparkle dots -->
      ${dots.map(d => createDot(d.cx, d.cy, d.r, d.c, d.op)).join('\n')}
    </svg>
  `;

  const svgBuffer = Buffer.from(svgContent);

  // Composite the sparkles onto the uploaded seasonal photo
  const outputDir = 'C:/Users/ingri/.gemini/antigravity/brain/1d4cf4c6-9825-495f-8b2b-6746624803b3';
  const outputPath = path.join(outputDir, 'seasonal_box_with_sparkles.jpg');
  const publicOutputPath = 'public/imagenes/box_empresas_fin_de_ano.jpg';

  await sharp(inputPath)
    .composite([
      {
        input: svgBuffer,
        blend: 'over'
      }
    ])
    .jpeg({ quality: 95 })
    .toFile(outputPath);

  console.log(`Saved output to ${outputPath}`);

  // Also save to public/imagenes
  await sharp(inputPath)
    .composite([
      {
        input: svgBuffer,
        blend: 'over'
      }
    ])
    .jpeg({ quality: 95 })
    .toFile(publicOutputPath);

  console.log(`Saved output to ${publicOutputPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
