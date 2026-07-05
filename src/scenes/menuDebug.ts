import {GameState} from '../components/GameStateManager';
import {k, KCtx} from '../kaplay';
import {gsm} from '../main';
import {changeScene} from '../misc/changeScene';
import {sceneLevel_1_1} from './level-1-1';

const CHOOSE_LEVEL_LABEL_TEXT_SIZE = 8;
function addTopLevelMenuLabel(
  //
  k: KCtx,
  label: string,
  x: number,
  y: number,
  onClick: () => void,
) {
  const lbl = k.add([
    k.layer('menu'),
    k.text(label, {size: CHOOSE_LEVEL_LABEL_TEXT_SIZE, font: 'pixel'}),
    k.pos(x, y),
    k.anchor('center'),
    k.color('#ffffcc'),
    k.opacity(1),
    k.area(),
    k.fixed(),
  ]);

  lbl.onHover(() => {
    lbl.opacity = 0.6;
  });
  lbl.onHoverEnd(() => {
    lbl.opacity = 1;
  });
  lbl.onClick(onClick);
}

function addChooseLevelLabel(
  //
  k: KCtx,
  label: string,
  x: number,
  y: number,
  maxWidth: number,
  onClick: () => void,
) {
  const lbl = k.add([
    k.layer('menu'),
    k.text(label, {size: CHOOSE_LEVEL_LABEL_TEXT_SIZE, font: 'pixel', width: maxWidth}),
    k.pos(x, y),
    k.anchor('left'),
    k.color('white'),
    k.opacity(1),
    k.area(),
    k.fixed(),
  ]);

  lbl.onHover(() => {
    lbl.opacity = 0.6;
  });
  lbl.onHoverEnd(() => {
    lbl.opacity = 1;
  });
  lbl.onClick(onClick);
}

export const sceneMenuDebug = (k: KCtx) => {
  // Title
  k.add([
    k.layer('menu'),
    k.text('DEBUG MENU', {size: 10, font: 'pixel'}),
    k.pos(k.width() / 2, 20),
    k.anchor('center'),
    k.fixed(),
    k.color('yellow'),
  ]);

  // Top level menu
  {
    const LABEL_GAP = 24;
    const labelY = 40;
    const cx = k.width() / 2;
    addTopLevelMenuLabel(k, '< Back', cx - LABEL_GAP / 2 - 20, labelY, () => {
      changeScene(k, 'menu', {isGameLevel: false}).then();
    });
    addTopLevelMenuLabel(k, 'Level 1', cx + LABEL_GAP / 2 + 20, labelY, () => {
      //
    });
  }

  // Game levels menu
  const colCount = 2;
  const presetColWidth = k.width() / colCount;
  const rowStartY = 60;
  const rowGap = CHOOSE_LEVEL_LABEL_TEXT_SIZE + 12;
  const itemsPerCol = Math.floor((k.height() - rowStartY) / rowGap);

  LEVEL_STATES.forEach((preset, i) => {
    const col = Math.floor(i / itemsPerCol);
    const row = i % itemsPerCol;
    const x = presetColWidth * col + 10;
    const y = rowStartY + row * rowGap;
    addChooseLevelLabel(k, preset.label, x, y, presetColWidth, () => {
      handleGameStateChange(JSON.parse(preset.state) as GameState['persistent']);
    });
  });

  function handleGameStateChange(newState: GameState['persistent']) {
    // Apply new game state
    gsm.update({
      persistent: {
        ...newState,
        settings: gsm.state.persistent.settings,
      },
    });

    // Go to game level
    changeScene(k, gsm.state.persistent.currentLevel || sceneLevel_1_1.id, {
      isGameLevel: true,
      spawnAtExitIndex: gsm.state.persistent.spawnAtExitIndex,
    }).then();
  }
};

const LEVEL_STATES: Array<{label: string; state: string}> = [
  {
    label: 'Level 1-2',
    state:
      '{"currentLevel":"level-1-2","player":{"deaths":1,"hasLuckyCharm":true,"inventory":["home-kitchen-chair-left","home-kitchen-table"]},"oldBobr":{"isIntroSaid":true,"isRespawnInfoSaid":true},"level1":{"isBoarDead":false},"spawnAtExitIndex":0}',
  },
  {
    label: 'Level 1-3 (boar alive)',
    state:
      '{"currentLevel":"level-1-3","player":{"deaths":1,"hasLuckyCharm":true,"inventory":["home-kitchen-chair-left","home-kitchen-table","home-kitchen-chair-right"]},"oldBobr":{"isIntroSaid":true,"isRespawnInfoSaid":true},"level1":{"isBoarDead":false},"spawnAtExitIndex":0}',
  },
  {
    label: 'Level 1-3 (boar dead)',
    state:
      '{"currentLevel":"level-1-3","player":{"deaths":1,"hasLuckyCharm":true,"inventory":["home-kitchen-chair-left","home-kitchen-table","home-kitchen-chair-right","home-stove","home-bed"]},"oldBobr":{"isIntroSaid":true,"isRespawnInfoSaid":true},"level1":{"isBoarDead":true},"spawnAtExitIndex":0}',
  },
  {
    label: 'Level 1-2e (cutscene)',
    state:
      '{"currentLevel":"level-1-2e","player":{"deaths":1,"hasLuckyCharm":true,"inventory":["home-kitchen-chair-left","home-kitchen-table","home-kitchen-chair-right","home-stove","home-bed"]},"oldBobr":{"isIntroSaid":true,"isRespawnInfoSaid":true},"level1":{"isBoarDead":true,"isMissBobrCutsceneShown":false},"spawnAtExitIndex":1}',
  },
  {
    label: 'Level 1-1 (all items)',
    state:
      '{"currentLevel":"level-1-1","player":{"deaths":1,"hasLuckyCharm":true,"inventory":["home-kitchen-chair-left","home-kitchen-table","home-kitchen-chair-right","home-stove","home-bed"]},"oldBobr":{"isIntroSaid":true,"isRespawnInfoSaid":true},"level1":{"isBoarDead":true,"isMissBobrCutsceneShown":true},"spawnAtExitIndex":null}',
  },
];
