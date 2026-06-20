import {t} from 'i18next';
import {GameObj, Vec2} from 'kaplay';
import {KCtx} from '../kaplay';
import {gsm} from '../main';
import {changeScene} from '../misc/changeScene';
import {Helpers} from '../misc/Helpers';
import {sceneLevel_1_1} from './level-1-1';

const BTN_WIDTH = 160;
const BTN_HEIGHT = 28;
const BTN_RADIUS = 8;
const BTN_TEXT_SIZE = 8;
const LAYOUT_GAP = 16;

type ButtonFactory = (parent: GameObj, relPos: Vec2) => void;

/** Creates a button factory to be placed into a layout. */
function buttonFactory(k: KCtx, label: string, color: string, onClick: () => void): ButtonFactory {
  return (parent, relPos) => {
    const btn = parent.add([
      k.rect(BTN_WIDTH, BTN_HEIGHT, {radius: BTN_RADIUS}),
      k.pos(relPos),
      k.anchor('center'),
      k.color(color),
      k.opacity(1),
      k.area(),
    ]);

    btn.add([
      //
      k.text(label, {size: BTN_TEXT_SIZE, font: 'pixel'}),
      k.anchor('center'),
      k.color('white'),
      k.pos(0, 1),
    ]);

    btn.onHover(() => {
      btn.opacity = 0.8;
    });

    btn.onHoverEnd(() => {
      btn.opacity = 1;
    });

    btn.onClick(() => {
      onClick();
    });
  };
}

/**
 * Creates a vertically stacking layout container centered at (cx, cy).
 * Call add() to queue elements, then build() to place them.
 */
function createLayout(k: KCtx, cx: number, cy: number) {
  const container = k.add([
    //
    k.pos(cx, cy),
    k.fixed(),
    k.layer('menu'),
  ]);
  const factories: ButtonFactory[] = [];

  return {
    /** Queues an element for placement in the layout. */
    add(factory: ButtonFactory) {
      factories.push(factory);
    },
    /** Centers all queued elements vertically around (cx, cy) and places them. */
    build() {
      const totalHeight = factories.length * BTN_HEIGHT + (factories.length - 1) * LAYOUT_GAP;
      let y = -totalHeight / 2 + BTN_HEIGHT / 2;

      for (const factory of factories) {
        factory(container, k.vec2(0, y));
        y += BTN_HEIGHT + LAYOUT_GAP;
      }
    },
  };
}

export const sceneMenu = (k: KCtx) => {
  const layout = createLayout(k, k.width() / 2, k.height() / 2);

  layout.add(
    buttonFactory(k, t('menu.play'), '#4a9e4a', () => {
      changeScene(k, gsm.state.persistent.currentLevel || sceneLevel_1_1.id, {
        isGameLevel: true,
        spawnAtExitIndex: gsm.state.persistent.spawnAtExitIndex,
      }).then();
    }),
  );

  layout.add(
    buttonFactory(k, t('menu.resetProgress'), '#8b3a3a', () => {
      gsm.reset();
    }),
  );

  layout.add((parent, relPos): void => {
    const label = parent.add([
      k.pos(relPos),
      k.anchor('center'),
      k.text('', {size: BTN_TEXT_SIZE, font: 'pixel'}), // text updated later
      k.color('white'),
      k.area(),
    ]);

    label.onClick(() => {
      gsm.update({
        persistent: {
          settings: {
            isDefaultShaderEnabled: !gsm.state.persistent.settings.isDefaultShaderEnabled,
          },
        },
      });

      updateLabelBasedOnState();
    });

    updateLabelBasedOnState();

    function updateLabelBasedOnState() {
      label.text =
        t('menu.defaultShader') +
        (gsm.state.persistent.settings.isDefaultShaderEnabled ? t('common.yes') : t('common.no'));
    }
  });

  layout.build();

  // Version label (bottom-right)
  k.add([
    k.layer('menu'),
    k.text('v' + __APP_VERSION__, {size: 4, font: 'pixel'}),
    k.pos(k.width() - 6, k.height() - 6),
    k.anchor('botright'),
    k.fixed(),
    k.opacity(0.5),
  ]);

  // Add keyboard control labels for non-touch devices
  if (!Helpers.isTouchDevice()) {
    // Attack control label (left side)
    k.add([
      k.layer('menu'),
      k.text(t('menu.attackControl'), {size: 8, font: 'pixel'}),
      k.pos(15, k.height() - 25),
      k.anchor('botleft'),
      k.fixed(),
    ]);

    // Jump control label (right side)
    k.add([
      k.layer('menu'),
      k.text(t('menu.jumpControl'), {size: 8, font: 'pixel'}),
      k.pos(k.width() - 15, k.height() - 25),
      k.anchor('botright'),
      k.fixed(),
    ]);
  }
};
