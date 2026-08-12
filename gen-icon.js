/* ══════════════════════════════════════════════════
   Genera icon.png e icon.ico (pixel-art) sin dependencias
   ══════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Pixel map 12x12 (a small pixel calendar/clock)
const P = 12;
const art = [
  '..XXXXXXXX..',
  '.XXXXXXXXXX.',
  '.XKKKKKKKKX.',
  '.XKXXXXXXKX.',
  '.XKXKKXXKX', // placeholder replaced below
];
// Build a cleaner 12x12 calendar with 3 columns
const map = [
  '............',
  '..XXXXXXXX..',
  '.XPPPPPPPPX.',
  '.XPPPPPPPPX.',
  '.XPPPPPPPPX.',
  '.XPPXXXXPPX.',
  '.XPPXYYXPPX.', // highlight cell
  '.XPPXXXXPPX.',
  '.XPPXXXXPPX.',
  '.XPPPPPPPPX.',
  '..XXXXXXXX..',
  '............',
];

const colors = {
  'X': [90, 93, 218],      // índigo (nuevo) #5a5dda
  'P': [224, 84, 160],     // magenta #e054a0
  'Y': [0, 245, 212],      // cian #00f5d4
  '.': [29, 10, 46],       // fondo #1d0a2e (alpha 0 => transparente)
};

function crc32(buf) {
  let c, table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c;
    }
  }
  c = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xFF];
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(size) {
  // Scale map to size (size x size)
  const scale = size / P;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter none
    for (let x = 0; x < size; x++) {
      const mx = Math.floor(x / scale);
      const my = Math.floor(y / scale);
      const [r, g, b] = colors[map[my][mx]];
      const alpha = map[my][mx] === '.' ? 0 : 255;
      const off = y * (size * 4 + 1) + 1 + x * 4;
      raw[off] = r; raw[off + 1] = g; raw[off + 2] = b; raw[off + 3] = alpha;
    }
  }
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

const png = encodePNG(256);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), png);

// ── ICO (contiene PNG) ──
function buildIco() {
  const sizes = [16, 32, 48, 256];
  const images = sizes.map(s => encodePNG(s));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);      // reserved
  header.writeUInt16LE(1, 2);      // type icon
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  const totalImgBytes = images.reduce((a, i) => a + i.length, 0);
  let offset = 6 + images.length * 16;
  sizes.forEach((s, idx) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(s === 256 ? 0 : s, 0); // width
    e.writeUInt8(s === 256 ? 0 : s, 1); // height
    e.writeUInt8(0, 2); // colors
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // planes
    e.writeUInt16LE(32, 6); // bpp
    e.writeUInt32LE(images[idx].length, 8);
    e.writeUInt32LE(offset, 12);
    offset += images[idx].length;
    entries.push(e);
  });
  return Buffer.concat([header, ...entries, ...images]);
}

fs.writeFileSync(path.join(assetsDir, 'icon.ico'), buildIco());
console.log('Iconos generados: icon.png (256px) e icon.ico');