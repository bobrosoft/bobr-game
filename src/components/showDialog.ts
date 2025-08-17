import {GameObj} from 'kaplay';
import {PlayerComp} from '../entities/player';
import {KCtx} from '../kaplay';

/**
 * Show a dialog box above an NPC with a typewriter effect.
 * @param k
 * @param subj
 * @param text
 * @param cfg
 */
export function showDialog(k: KCtx, subj: GameObj, text: string, cfg?: {speed?: number}): GameObj {
  cfg = {
    speed: 0.05, // default typing speed
    ...cfg,
  };

  const width = k.width() / 2;
  const padding = 5; // padding around text
  let currentText = '';
  let charIndex = 0;
  let timer = 0;
  let isDone = false;

  // Create semi-transparent background
  const container = k.add([
    k.rect(width, 16, {radius: 4}),
    k.pos(calcPosition()), // above NPC
    k.color(0, 0, 0), // semi-transparent black
    // k.outline(2, k.rgb(255, 255, 255)), // white outline
    k.opacity(0.6),
    k.anchor('bot'),
    k.layer('hud'),
  ]);

  // Create a text box above NPC
  const textBox = container.add([
    k.pos(k.vec2(0, -padding)), // above NPC
    k.text('', {size: 8, width: width - padding * 2, font: 'pixel', lineSpacing: 2}), // empty at start
    k.anchor('bot'),
  ]);

  // Typewriter effect
  textBox.onUpdate(() => {
    container.height = textBox.height + padding * 2; // adjust height based on text

    // // Follow NPC if it moves
    container.pos = calcPosition();

    if (!isDone) {
      timer += k.dt();
      if (timer >= cfg.speed) {
        timer = 0;
        currentText += text[charIndex];
        textBox.text = currentText;
        charIndex++;
        if (charIndex >= text.length) {
          isDone = true;
        }
      }
    }
  });

  function calcPosition() {
    // Calculate position based on NPC's position
    return subj.pos.add(0, -subj.height);
  }

  return container;
}

/**
 * Show a series of dialog boxes with a typewriter effect, one after another.
 * @param k
 * @param subj
 * @param player
 * @param texts
 * @param cfg
 */
export function showDialogSeries(
  k: KCtx,
  subj: GameObj,
  player: PlayerComp,
  texts: string[],
  cfg?: {speed?: number},
): Promise<void> {
  return new Promise(resolve => {
    let currentIndex = 0;

    async function showNextDialog() {
      if (currentIndex < texts.length) {
        const dialog = showDialog(k, subj, texts[currentIndex], cfg);
        await player.waitForActionButton();
        dialog.destroy();
        currentIndex++;

        showNextDialog().then();
      } else {
        resolve();
      }
    }

    showNextDialog().then();
  });
}
