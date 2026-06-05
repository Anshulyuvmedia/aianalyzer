const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const DENSITIES = [
  { name: 'mdpi', size: 24 },
  { name: 'hdpi', size: 36 },
  { name: 'xhdpi', size: 48 },
  { name: 'xxhdpi', size: 72 },
  { name: 'xxxhdpi', size: 96 },
];

const BASE_DIR = path.resolve(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++)
      crc = (crc & 1) ? ((crc >>> 1) ^ 0xEDB88320) : (crc >>> 1);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeB = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeB, data]);
  const crcB = Buffer.alloc(4);
  crcB.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeB, data, crcB]);
}

function bellWidth(y) {
  if (y >= -0.39 && y <= -0.09) {
    const r2 = 0.30 * 0.30 - (y + 0.09) * (y + 0.09);
    return r2 > 0 ? Math.sqrt(r2) : 0;
  }
  if (y > -0.09 && y <= 0.08) {
    const t = (y + 0.09) / 0.17;
    const s = 0.5 - 0.5 * Math.cos(t * Math.PI);
    return 0.30 - s * 0.08;
  }
  if (y > 0.08 && y <= 0.16) {
    const t = (y - 0.08) / 0.08;
    const s = 0.5 - 0.5 * Math.cos(t * Math.PI);
    return 0.22 + s * 0.05;
  }
  if (y > 0.16 && y <= 0.23) {
    const t = (y - 0.16) / 0.07;
    const s = 0.5 - 0.5 * Math.cos(t * Math.PI);
    return 0.27 * (1 - s);
  }
  return 0;
}

function inBell(nx, ny) {
  const hw = bellWidth(ny);
  if (hw > 0 && Math.abs(nx) <= hw) return true;
  if (ny >= 0.22 && ny <= 0.26 && Math.abs(nx) <= 0.010) return true;
  const cd = Math.sqrt(nx * nx + (ny - 0.30) * (ny - 0.30));
  if (cd <= 0.040) return true;
  return false;
}

function makePNG(size, inShape) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const raw = Buffer.alloc(size * (1 + size * 4));
  const SAMPLES = 4;

  for (let y = 0; y < size; y++) {
    const rowOff = y * (1 + size * 4);
    raw[rowOff] = 0;
    for (let x = 0; x < size; x++) {
      let count = 0;
      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const px = (x + (sx + 0.5) / SAMPLES) / size - 0.5;
          const py = (y + (sy + 0.5) / SAMPLES) / size - 0.5;
          if (inShape(px, py)) count++;
        }
      }
      const alpha = Math.round((count / (SAMPLES * SAMPLES)) * 255);
      const off = rowOff + 1 + x * 4;
      raw[off] = 255;
      raw[off + 1] = 255;
      raw[off + 2] = 255;
      raw[off + 3] = alpha;
    }
  }

  const compressed = zlib.deflateSync(raw);
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

let errors = [];
for (const d of DENSITIES) {
  try {
    const png = makePNG(d.size, inBell);
    const outDir = path.join(BASE_DIR, `drawable-${d.name}`);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'notification_icon.png');
    fs.writeFileSync(outPath, png);
    console.log(`Created ${outPath} (${d.size}x${d.size})`);
  } catch (e) {
    errors.push(`drawable-${d.name}: ${e.message}`);
  }
}

if (errors.length > 0) {
  console.error('ERRORS:', errors.join('; '));
  process.exit(1);
}
