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

(function (win, doc) {
  const elementInViewY = (innerHeight => (element, height = 0) => {
    const view = element.getBoundingClientRect()
    return view.top >= -height && view.bottom <= (innerHeight) + height
  })(win.innerHeight || doc.documentElement.clientHeight)

  /**
     * Pre calculate each frame's x and y coordinates
     * @param {Object}
     * @returns {Object} with frames' x and y coordinates in sequence
     */
  const preCalcAllFramePositions = ({ frames, ...sprite }) => ({
    ...sprite,
    frames: [...frames].reduce(
      ([x, y]) => {
        x = (x - sprite.frameWidth) % sprite.width
        return [x, (x === 0) ? y - sprite.frameHeight : y]
      }, [0, 0]
    )
  })

  const nextFrame = ({ currFrame, framesCount, ...sprite }) => (
    { ...sprite, currFrame: (currFrame + 1) % framesCount }
  )

  const prevFrame = ({ currFrame, framesCount, ...sprite }) => (
    { ...sprite, currFrame: (currFrame === 0) ? framesCount - 1 : currFrame - 1 }
  )

  /**
     * Sprite Factory function
     * @param {Object} sprite's properties
     * @returns {Object}
     */
  function makeSprite (spriteProps) {
    let currFrame = 0

    const sprite = Object.assign(
      {},
      spriteProps,
      {
        frames: preCalcAllFramePositions(spriteProps),

        nextFrame: () => {
          currFrame = (currFrame + 1) % sprite.framesCount
          return sprite.frames[currFrame]
        },

        prevFrame: () => {
          currFrame = (currFrame === 0) ? sprite.framesCount - 1 : currFrame - 1
          return sprite.frames[currFrame]
        }
      }
    )

    return sprite
  }

  /**
     * @param {Element} target - element with background to animate
     * @param {Object} spriteProps - sprite details e.g. width, height, frameCountX and frameCountY
     */
  function getScrollHandler (target, spriteProps) {
    const docElement = doc.documentElement
    const sprite = makeSprite(spriteProps)
    let prevScroll = docElement.scrollTop

    // return handler
    return function (event) {
      const currScroll = docElement.scrollTop
      const frame = (currScroll > prevScroll) ? sprite.nextFrame() : sprite.prevFrame()
      prevScroll = currScroll

      if (!elementInViewY(target, sprite.frameHeight)) return // if element is not coming into view return

      win.requestAnimationFrame(() => {
        target.style.backgroundPositionX = `${frame.x}px`
        target.style.backgroundPositionY = `${frame.y}px`
      })
    }
  }

  function spritePlayOnScroll (
    element,
    {
      width = 0,
      height = 0,
      frameCountX = 0,
      frameCountY = 0
    },
    wait = 30
  ) {
    win.addEventListener(
      'scroll',
      throttle(
        getScrollHandler(
          element,
          {
            spriteWidth: width,
            spriteHeight: height,
            frameWidth: width / frameCountX,
            frameHeight: height / frameCountY,
            framesCount: frameCountX * frameCountY
          }
        ),
        wait
      )
    )
  }

  win.spritePlayOnScroll = spritePlayOnScroll
}(window, window.document))
