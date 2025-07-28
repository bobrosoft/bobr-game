import {k} from './kaplay';

k.add([
  k.text("Press BBB to burp"),
  k.anchor("center"),
  k.pos(k.width() / 2, k.height() / 2),
]);

// burp() on click / tap for our friends on mobile
k.onClick(() => k.burp());