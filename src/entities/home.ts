import {t} from 'i18next';
import {GameObj, Vec2} from 'kaplay';
import {interactable} from '../components/InteractableComp';
import {showDialogSeries} from '../components/showDialog';
import {KCtx} from '../kaplay';
import {bgMusicManager, gsm} from '../main';
import {defaultFriction} from '../misc/defaults';
import {GameEntity} from './generic/entity';
import {ITEM_ID} from './generic/item-id';

enum State {
  INSIDE = 'INSIDE',
  OUTSIDE = 'OUTSIDE',
}

interface Config {
  isEveningTime: boolean;
}

export const HomeEntity: GameEntity<Config> = {
  async loadResources(k: KCtx): Promise<any> {
    // Define music
    bgMusicManager.loadMusic('home', 'music/home.mp3');

    return Promise.all([
      k.loadSprite('home-outside', 'sprites/home/home-outside.png'),
      k.loadSprite('home-inside', 'sprites/home/home-inside.png'),
      k.loadSprite('home-fence', 'sprites/home/home-fence.png'),
      k.loadSprite('home-kitchen-table', 'sprites/home/home-kitchen-table.png'),
      k.loadSprite('home-kitchen-chair-left', 'sprites/home/home-kitchen-chair-left.png'),
      k.loadSprite('home-kitchen-chair-right', 'sprites/home/home-kitchen-chair-right.png'),
      k.loadSprite('home-bed', 'sprites/home/home-bed.png'),
      k.loadSprite('home-stove', 'sprites/home/home-stove.gif', {
        sliceX: 6,
        sliceY: 2,
        anims: {
          idle: {from: 0, to: 0},
          burn: {from: 6, to: 11, loop: true},
        },
      }),
    ]);
  },

  spawn(k: KCtx, posXY: Vec2, config?: Partial<Config>): GameObj {
    const C: Config = {
      isEveningTime: false,
      ...config,
    };

    let isInitialStateSwitch = true;

    const container = k.add([
      'home-container',
      k.pos(posXY),
      k.anchor('botleft'),
      k.offscreen({hide: true, pause: true, unpause: true, distance: 300}),
      k.state(State.OUTSIDE, [State.INSIDE, State.OUTSIDE]),
    ]);

    // Add fence
    container.add([
      //
      k.sprite('home-fence'),
      k.pos(206, 0),
      k.anchor('botleft'),
    ]);

    // Add home inside
    const inside = container.add([
      //
      'home-outside',
      k.sprite('home-inside'),
      k.anchor('botleft'),
    ]);

    /// Add furniture to first floor
    const kitchenChairLeft = container.add([
      //
      'home-kitchen-chair-left',
      k.sprite('home-kitchen-chair-left'),
      k.anchor('bot'),
      k.pos(64, 0),
      k.area(),
      interactable(async player => {
        await showDialogSeries(k, player, player, [t(k.choose(['home.kitchenChairRepeat1']))]);
      }),
    ]);
    kitchenChairLeft.hidden = true;

    const kitchenTable = container.add([
      //
      'home-kitchen-table',
      k.sprite('home-kitchen-table'),
      k.anchor('bot'),
      k.pos(92, 0),
      k.area(),
      k.z(1),
      interactable(async player => {
        await showDialogSeries(k, player, player, [
          t(k.choose(['home.kitchenTableRepeat1', 'home.kitchenTableRepeat2', 'home.kitchenTableRepeat3'])),
        ]);
      }),
    ]);
    kitchenTable.hidden = true;

    const kitchenChairRight = container.add([
      //
      'home-kitchen-chair-right',
      k.sprite('home-kitchen-chair-right'),
      k.anchor('bot'),
      k.pos(120, 0),
      k.area(),
      interactable(async player => {
        await showDialogSeries(k, player, player, [t(k.choose(['home.kitchenChairRepeat1']))]);
      }),
    ]);
    kitchenChairRight.hidden = true;

    const stove = container.add([
      //
      'home-stove',
      k.sprite('home-stove'),
      k.anchor('bot'),
      k.pos(160, 0),
      k.area(),
    ]);
    stove.hidden = true;

    /// Add furniture to second floor
    const bed = container.add([
      //
      'home-bed',
      k.sprite('home-bed', {flipX: true}),
      k.anchor('bot'),
      k.pos(129, -65),
      k.area(),
      interactable(async player => {
        await showDialogSeries(k, player, player, [t(k.choose(['home.bedRepeat1']))]);
      }),
    ]);
    bed.hidden = true;

    // Add home outside
    const outside = container.add([
      //
      'home-outside',
      k.sprite('home-outside'),
      k.anchor('botleft'),
      k.animate({relative: true}),
      k.z(2),
    ]);

    addCollisionWalls(k, container);

    function updateFurnitureVisibility() {
      const hasTable = gsm.getIsPlayerHasItem(ITEM_ID.HOME_KITCHEN_TABLE);
      const hasChairLeft = gsm.getIsPlayerHasItem(ITEM_ID.HOME_KITCHEN_CHAIR_LEFT);
      const hasChairRight = gsm.getIsPlayerHasItem(ITEM_ID.HOME_KITCHEN_CHAIR_RIGHT);
      const hasBed = gsm.getIsPlayerHasItem(ITEM_ID.HOME_BED);
      const hasStove = gsm.getIsPlayerHasItem(ITEM_ID.HOME_STOVE);

      kitchenTable.hidden = !hasTable;
      kitchenChairLeft.hidden = !hasChairLeft;
      kitchenChairRight.hidden = !hasChairRight;
      bed.hidden = !hasBed;

      if (hasStove) {
        stove.hidden = false;
        stove.play('burn');
      } else {
        stove.hidden = true;
        stove.play('idle');
      }
    }

    container.onStateEnter(State.OUTSIDE, () => {
      if (isInitialStateSwitch) {
        isInitialStateSwitch = false;
        return; // skip animation on initial state set
      }

      outside.unanimateAll();
      outside.animation.seek(0);
      outside.animate('opacity', [0, 1], {duration: 1, loops: 1});

      bgMusicManager.playMusic('start-location');
    });

    container.onStateEnter(State.INSIDE, () => {
      gsm.moveTempItemsToPersistentInventory(); // to save furniture items if player returned home
      updateFurnitureVisibility();

      outside.unanimateAll();
      outside.animation.seek(0);
      outside.animate('opacity', [1, 0], {duration: 1, loops: 1});

      // Play music if player has any items in inventory
      if (gsm.state.persistent.player.inventory.length > 0) {
        bgMusicManager.playMusic('home');
      }
    });

    // 180, 25x38
    // Add entrance collision detection
    const entrance = container.add([
      'home-entrance',
      k.rect(20, 38, {fill: false}),
      k.pos(125, 0),
      k.anchor('botleft'),
      k.area(),
    ]);
    entrance.onCollide('player', () => {
      if (container.state !== State.INSIDE) {
        container.enterState(State.INSIDE);
      }
    });

    // Add exit collision detection
    const exit = container.add([
      'home-exit',
      k.rect(20, 38, {fill: false}),
      k.pos(214, 0),
      k.anchor('botleft'),
      k.area(),
    ]);
    exit.onCollide('player', () => {
      if (container.state !== State.OUTSIDE) {
        container.enterState(State.OUTSIDE);
      }
    });

    updateFurnitureVisibility();

    return container;
  },
};

function addCollisionWalls(k: KCtx, container: GameObj) {
  // Add necessary collision walls near entrance
  container.add([
    // to prevent jump on home entrance
    'obstacle',
    k.rect(14, 200, {fill: false}),
    k.pos(193, -42),
    k.anchor('botleft'),
    k.area(),
    k.body({isStatic: true}),
  ]);
  container.add([
    // to prevent just through home entrance
    'obstacle',
    k.rect(40, 12, {fill: false}),
    k.pos(156, -42),
    k.anchor('botleft'),
    k.area(),
    k.body({isStatic: true}),
  ]);

  // Add left wall
  container.add([
    //
    'obstacle',
    k.rect(10, 220, {fill: false}),
    k.pos(-10, 0),
    k.anchor('botleft'),
    k.area(),
    k.body({isStatic: true}),
  ]);

  // Add right wall polys
  container.add([
    'obstacle',
    k.polygon(
      [
        //
        k.vec2(178, -54),
        k.vec2(115, -193),
        k.vec2(125, -193),
        k.vec2(188, -54),
      ],
      {fill: false},
    ),
    k.pos(-5, 0),
    k.anchor('botleft'),
    k.area(),
    k.body({isStatic: true}),
  ]);
  container.add([
    'obstacle',
    k.polygon(
      [
        //
        k.vec2(115, -193),
        k.vec2(50, -221),
        k.vec2(50, -230),
        k.vec2(125, -193),
      ],
      {fill: false},
    ),
    k.pos(-5, 0),
    k.anchor('botleft'),
    k.area(),
    k.body({isStatic: true}),
  ]);
  container.add([
    'obstacle',
    k.polygon(
      [
        //
        k.vec2(50, -221),
        k.vec2(0, -221),
        k.vec2(0, -230),
        k.vec2(50, -230),
      ],
      {fill: false},
    ),
    k.pos(-5, 0),
    k.anchor('botleft'),
    k.area(),
    k.body({isStatic: true}),
  ]);

  // Add floor for second floor
  container.add([
    //
    'obstacle',
    k.rect(120, 7, {fill: false}),
    k.pos(57, -58),
    k.anchor('botleft'),
    k.area(defaultFriction),
    k.body({isStatic: true}),
  ]);

  // Add floor for third floor
  container.add([
    //
    'obstacle',
    k.rect(95, 7, {fill: false}),
    k.pos(0, -122),
    k.anchor('botleft'),
    k.area(defaultFriction),
    k.body({isStatic: true}),
  ]);
}
