#!/usr/bin/env node

import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import gifFrames from 'gif-frames';
import {Jimp} from 'jimp';
import * as fs from 'fs';
import * as glob from 'glob';

async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (err) => reject(err));
  });
}

async function extractFrames(gifPath) {
  const frameData = await gifFrames({
    url: gifPath,
    frames: 'all',
    outputType: 'png',
    cumulative: false,
  });

  const frames = [];
  for (const frame of frameData) {
    const imgStream = frame.getImage();
    const buffer = await streamToBuffer(imgStream);
    const image = await Jimp.read(buffer);
    frames.push(image);
  }
  return frames;
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
    const rowWidth = frames.reduce((sum, img) => sum + img.bitmap.width, 0);
    const rowHeight = frames.reduce((max, img) => Math.max(max, img.bitmap.height), 0);
    sheetWidth = Math.max(sheetWidth, rowWidth);
    sheetHeight += rowHeight;
    rowHeights.push(rowHeight);
  }

  const sheet = new Jimp({width: sheetWidth, height: sheetHeight, color: 0x00000000});

  let yOffset = 0;
  for (let r = 0; r < rows.length; r++) {
    const frames = rows[r];
    let xOffset = 0;
    for (const img of frames) {
      sheet.composite(img, xOffset, yOffset);
      xOffset += img.bitmap.width;
    }
    yOffset += rowHeights[r];
  }

  await sheet.write(outputPath);
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
