# Markdown Preview Wheel Zoom

**Ctrl + mouse wheel zooms VS Code's built-in Markdown preview**, independently of the window zoom.

VS Code's `Ctrl +` / `Ctrl -` scale the whole window, and `markdown.preview.fontSize` is a static setting. This extension adds the one thing a browser has and the preview does not: hold Ctrl, scroll, and the preview grows or shrinks on the spot.

- Works in the standard preview (`Ctrl+Shift+V`, `Ctrl+K V`), so everything else that extends it (wikilinks from Foam, Mermaid, GitHub styles, ...) keeps working.
- Trackpad pinch works too (it arrives as Ctrl + wheel).
- A small badge in the corner shows the current level for a moment. Click it to reset to 100 %.
- The level is remembered between sessions.
- Range 50 % – 300 %, steps of 10 %.

No settings, no commands, no keybindings. The extension only contributes a script to the preview through the official `markdown.previewScripts` API, so it runs no code in the extension host.

## How it works

The script sets CSS `zoom` on the preview body and counter-zooms its own badge. Scroll position is kept proportional when the layout rescales. Scroll sync between editor and preview still works; it may be off by a line or two at high zoom levels.

## Icon

Source: `media/icon.svg` (paths only, no fonts). Export it at 256×256 to `media/icon.png`, for example with Inkscape or [sharp](https://sharp.pixelplumbing.com/):

```js
require('sharp')('media/icon.svg', { density: 384 }).resize(256, 256).png().toFile('media/icon.png');
```

## Related

- VS Code feature request: [Support Ctrl+scroll wheel zoom for text in the Markdown preview #332888](https://github.com/microsoft/vscode/issues/332888)

## License

MIT
