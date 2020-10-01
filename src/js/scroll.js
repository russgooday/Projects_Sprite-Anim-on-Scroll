

document.addEventListener('DOMContentLoaded', function (event) {

  function elementInViewY (element, height = 0) {
    const view = element.getBoundingClientRect()
    return (
      view.top >= -height && view.bottom <= (window.innerHeight || document.documentElement.clientHeight) + height
    )
  }

  /**
   * Throttles each event call to handler e.g scroll event
   * @param {Function} event handler
   * @param {Number} wait - milliseconds between each event call
   */
  function throttle (handler, wait = 60) {
    let timer = null

    return function (event) {
      if (timer !== null) return

      timer = setTimeout(() => {
        clearTimeout(timer)
        timer = null

        handler.call(event.target, event)
      }, wait)
    }
  }

  /**
   * Pre calculate each frame's x and y coordinates
   * @param {Object}
   * @returns {Array} All x and y coordinates in sequence
   */
  function preCalcAllFramePositions ({
    width,
    height,
    offsetX,
    offsetY,
    frameCount
  }) {
    const positions = []

    for (let i = 0, x = 0, y = 0; i < frameCount; i++) {
      positions[i] = { x, y }
      x = (x - offsetX) % width
      if (x === 0) y = (y - offsetY) % height
    }
    return positions
  }

  /**
   * Sprite Factory function
   * @param {Object} sprite's basic properties
   * @returns {Object}
   */
  function makeSprite ({ width, height, frameCountX, frameCountY }) {
    let currFrame = 0

    const sprite = {
      width,
      height,
      offsetX: width / frameCountX,
      offsetY: height / frameCountY,
      frameCount: frameCountX * frameCountY,

      nextFrame: () => {
        currFrame = (currFrame + 1) % sprite.frameCount
        return sprite.frames[currFrame]
      },

      prevFrame: () => {
        currFrame = (currFrame === 0) ? sprite.frameCount - 1 : currFrame - 1
        return sprite.frames[currFrame]
      }
    }

    sprite.frames = preCalcAllFramePositions(sprite)
    return sprite
  }

  /**
   * @param {Element} target - element with background to animate
   * @param {Object} spriteProps - sprite details e.g. width, height, frameCountX and frameCountY
   */
  function getScrollHandler (target, spriteProps) {
    const docElement = document.documentElement
    const sprite = makeSprite(spriteProps)
    let prevScroll = docElement.scrollTop

    // return handler
    return function (event) {
      const currScroll = docElement.scrollTop
      const frame = (currScroll > prevScroll) ? sprite.nextFrame() : sprite.prevFrame()
      prevScroll = currScroll

      if (!elementInViewY(target, sprite.offsetY)) return // if element is not coming into view return

      window.requestAnimationFrame(() => {
        target.style.backgroundPositionX = `${frame.x}px`
        target.style.backgroundPositionY = `${frame.y}px`
      })
    }
  }

  window.addEventListener(
    'scroll',
    throttle(
      getScrollHandler(document.querySelector('#logo'), {
        width: 3200,
        height: 640,
        frameCountX: 10,
        frameCountY: 4
      })
      , 30
    )
  )
})
