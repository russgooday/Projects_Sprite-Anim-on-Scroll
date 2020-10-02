## Sprite animation on scroll
---
Sprite animation driven by the page's vertical scroll. Works on an elements background image.

Example usage

JS
```
spritePlayOnScroll(
  // element with background image
  document.querySelector('#sprite-anim'),
  {
    // sprite image dimensions
    width: 3200,
    height: 640,
    // sprite columns and rows
    frameCountX: 10,
    frameCountY: 4
  },
  30 // milliseconds between frames
)
```

CSS
```
#sprite-anim {
  width: 320px; // 3200 / 10
  height: 160px; // 640 / 4
  background: #000 url('../images/sprite.jpg') no-repeat 0px 0px;
}
```
