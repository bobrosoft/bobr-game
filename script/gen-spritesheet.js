#!/usr/bin/env node

import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {parseGIF, decompressFrames} from 'gifuct-js';
import sharp from 'sharp';
import * as fs from 'fs';
import * as glob from 'glob';

async function extractFrames(gifPath) {
  const gifData = fs.readFileSync(gifPath);
  const gif = parseGIF(gifData);
  const frames = decompressFrames(gif, true);

  const pngFrames = [];
  for (const frame of frames) {
    const {width, height} = frame.dims;
    const {patch} = frame;

    // Convert RGBA Uint8ClampedArray to PNG buffer using sharp
    const buffer = await sharp(Buffer.from(patch), {
      raw: {
        width,
        height,
        channels: 4
      }
    })
      .png()
      .toBuffer();

    pngFrames.push({buffer, width, height});
  }
  return pngFrames;
}

async function generateSpriteSheet(inputGifs, outputPath) {
  const rows = [];
  for (const gif of inputGifs) {
    if (!fs.existsSync(gif)) {
      console.error(`File not found: ${gif}`);
      process.exit(1);
    }
    const frames = await extractFrames(gif);
    rows.push(frames);
  }

  let sheetWidth = 0;
  let sheetHeight = 0;
  const rowHeights = [];

  for (const frames of rows) {
    const rowWidth = frames.reduce((sum, img) => sum + img.width, 0);
    const rowHeight = frames.reduce((max, img) => Math.max(max, img.height), 0);
    sheetWidth = Math.max(sheetWidth, rowWidth);
    sheetHeight += rowHeight;
    rowHeights.push(rowHeight);
  }

  // Prepare composite input for sharp
  const compositeInputs = [];
  let yOffset = 0;

  for (let r = 0; r < rows.length; r++) {
    const frames = rows[r];
    let xOffset = 0;
    for (const img of frames) {
      compositeInputs.push({
        input: img.buffer,
        top: yOffset,
        left: xOffset,
      });
      xOffset += img.width;
    }
    yOffset += rowHeights[r];
  }

  // Create a transparent background and composite all frames
  await sharp({
    create: {
      width: sheetWidth,
      height: sheetHeight,
      channels: 4,
      background: {r: 0, g: 0, b: 0, alpha: 0}
    }
  })
    .composite(compositeInputs)
    .gif()
    .toFile(outputPath);

  console.log(`Sprite sheet generated at ${outputPath}`);
}

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 -o [output] <patterns...>')
  .option('o', {
    alias: 'output',
    describe: 'Output sprite sheet image path',
    demandOption: true,
    type: 'string',
  })
  .demandCommand(1, 'At least one input pattern must be specified')
  .example('$0 -o spritesheet.gif "gifs/*.gif" "more-gifs/*.gif"')
  .help()
  .parse();

const outputPath = argv.output;
const patterns = argv._;

// Expand wildcards (globs) into actual file paths
const inputGifs = patterns
  .flatMap(pattern => glob.sync(pattern))
  .filter((value, index, self) => self.indexOf(value) === index);

if (inputGifs.length === 0) {
  console.error('No files matched the given patterns.');
  process.exit(1);
}

(async () => {
  try {
    await generateSpriteSheet(inputGifs, outputPath);
  } catch (err) {
    console.error('Error generating sprite sheet:', err);
    process.exit(1);
  }
})();
