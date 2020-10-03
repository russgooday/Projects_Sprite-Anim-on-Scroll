(function (win, doc) {

  /* Helpers */
  const pipe = (...funcs) => arg => funcs.reduce((obj, func) => func(obj), arg)

  /**
   * Throttles each event call to handler e.g scroll event
   * @param {Function} event handler
   * @param {Number} wait - milliseconds between each event call
   */
  const throttle = (handler, wait = 30) => {
    let timer = null

    return (event) => {
      if (timer !== null) return

      timer = setTimeout(() => {
        clearTimeout(timer)
        timer = null

        handler.call(event.target, event)
      }, wait)
    }
  }

  const elementInViewY = ((win, docElement) => (element, height = 0) => {

    const { top, bottom } = element.getBoundingClientRect()

    return top >= -height && bottom <= (win.innerHeight || docElement.clientHeight) + height
  })((window.innerHeight && window) || document.documentElement)



  const makeSprite = (sprite) => ({ currFrame: 0, ...sprite })

  /**
   * Pre calculate each frame's x and y coordinates
   * @param {Object}
   * @returns {Object} with frames' x and y coordinates in sequence
   */
  const preCalcAllFramePositions = ({ framesCount = 0, ...sprite }) => {

    for (var i = 0, x = 0, y = 0, frames = []; i < framesCount; i++) {
      frames[i] = { x, y }
      x = (x - sprite.frameWidth) % sprite.width
      if (x === 0) y -= sprite.frameHeight
    }
    return { ...sprite, frames }
  }

  const nextFrame = ({ currFrame, frames, ...sprite }) =>
    ({ ...sprite, frames, currFrame: (currFrame + 1) % frames.length })

  const prevFrame = ({ currFrame, frames, ...sprite }) =>
    ({ ...sprite, frames, currFrame: (currFrame === 0) ? frames.length - 1 : currFrame - 1 })

  const setScrollY = sprite => ({ ...sprite, scrollY: window.pageYOffset })

  const getFrame = ({ frames, currFrame }) => frames[currFrame]

  /**
   * @param {Element} target - element with background to animate
   * @param {Object} spriteProps - sprite details e.g. width, height, frameCountX and frameCountY
   */
  function getScrollHandler (target, spriteProps) {

    let sprite = pipe(
      makeSprite,
      preCalcAllFramePositions,
      setScrollY
    )(spriteProps)

    // return handler
    return function (event) {

      sprite = setScrollY((window.pageYOffset > sprite.scrollY) ? nextFrame(sprite) : prevFrame(sprite))

      if (!elementInViewY(target, sprite.frameHeight)) return

      window.requestAnimationFrame(() => {
        target.style.backgroundPositionX = `${getFrame(sprite).x}px`
        target.style.backgroundPositionY = `${getFrame(sprite).y}px`
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
            width,
            height,
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
