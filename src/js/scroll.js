(function (win, doc) {

  // Sprite model

  /**
   * Base sprite object creator
   * @param {Object} sprite properties and dimensions
   * @returns {Object} base sprite object
   */
  function sprite ({ columns, rows, ...sprite }) {
    return {
      ...sprite,
      currFrame: 0,
      frames: [...Array(columns * rows)],
      column: sprite.width / columns,
      row: sprite.height / rows
    }
  }

  /**
   * Pre calculate each frame's background x and y position in sequence
   * @param {Object}
   * @returns {Object} sprite clone appended with frames array
   */
  function preCalcAllFramePositions ({ frames = [], ...sprite }) {

    for (let i = 0, x = 0, y = 0; i < frames.length; i++) {
      frames[i] = { x, y }
      x = (x - sprite.column) % sprite.width
      if (x === 0) y -= sprite.row
    }
    return { ...sprite, frames }
  }

  // Sprite methods @return amended sprite clone

  const nextFrame = ({ currFrame, frames, ...sprite }) => (
    { ...sprite, frames, currFrame: (currFrame + 1) % frames.length }
  )

  const prevFrame = ({ currFrame, frames, ...sprite }) => (
    { ...sprite, frames, currFrame: (currFrame === 0) ? frames.length - 1 : currFrame - 1 }
  )

  const setScrollY = sprite => ({ ...sprite, scrollY: window.pageYOffset })


  // Sprite methods @return sprite values

  const getFrame = ({ frames, currFrame }) => frames[currFrame]


  /* Helpers */

  const pipe = (...funcs) => arg => funcs.reduce((obj, func) => func(obj), arg)

  // calculate if element is vertically in view
  const elementInViewY = ((win, docElement) => (element, height = 0) => {

    const { top, bottom } = element.getBoundingClientRect()
    return top >= -height && bottom <= (win.innerHeight || docElement.clientHeight) + height

  })(window, document.documentElement)

  /**
   * Throttles each event call to handler e.g scroll event
   * @param {Function} event handler
   * @param {Number} wait - milliseconds between each event handler call
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

  // Handlers

  /**
   * @param {Element} target - element with background to animate
   * @param {Object} spriteProps - sprite details e.g. width, height, frameCountX and frameCountY
   */
  function getScrollHandler (target, spriteProps) {

    let spriteElement = pipe(
      sprite,
      preCalcAllFramePositions,
      setScrollY
    )({ ...spriteProps, target })

    // return handler
    return function (event) {

      spriteElement = setScrollY((window.pageYOffset > spriteElement.scrollY) ? nextFrame(spriteElement) : prevFrame(spriteElement))

      if (!elementInViewY(target, spriteElement.row)) return

      window.requestAnimationFrame(() => {
        target.style.backgroundPositionX = `${getFrame(spriteElement).x}px`
        target.style.backgroundPositionY = `${getFrame(spriteElement).y}px`
      })
    }
  }

  // Main user functions

  function spritePlayOnScroll (element, spriteProps, wait = 30) {
    win.addEventListener(
      'scroll',
      throttle(
        getScrollHandler(
          element,
          spriteProps
        ),
        wait
      )
    )
  }

  // append user function to window
  win.spritePlayOnScroll = spritePlayOnScroll
}(window, window.document))
