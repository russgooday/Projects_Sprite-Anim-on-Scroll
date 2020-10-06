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
  function backgroundPositions ({ frames = [], ...sprite }) {

    for (let i = 0, x = 0, y = 0; i < frames.length; i++) {
      frames[i] = { x, y }
      x = (x - sprite.column) % sprite.width
      if (x === 0) y -= sprite.row
    }
    return { ...sprite, frames }
  }

  // Sprite methods @return amended sprite clone

  const nextFrame = (sprite) => {
    const { currFrame, frames: { length } } = sprite
    return { ...sprite, currFrame: (currFrame + 1) % length }
  }

  const prevFrame = (sprite) => {
    const { currFrame, frames: { length } } = sprite
    return { ...sprite, currFrame: (currFrame === 0) ? length - 1 : currFrame - 1 }
  }

  const setScrollY = (scrollY, sprite) => ({ ...sprite, scrollY })

  // Sprite methods get and set sprite values

  const setBackgroundPosition = ({ target: { style }, currFrame, frames }) => {
    const { x, y } = frames[currFrame]
    style.backgroundPosition = `${x}px ${y}px`
  }

  /* Helpers */

  const pipe = (...funcs) => arg => funcs.reduce((obj, func) => func(obj), arg)

  // calculate if element is vertically in view
  const elementInViewY = ((win, docElement) => ({ target, row }) => {

    const { top, bottom } = target.getBoundingClientRect()
    return top >= -row && bottom <= (win.innerHeight || docElement.clientHeight) + row

  })(window, document.documentElement)

  /**
   * Throttles each event call to handler e.g scroll event
   * @param {Function} event handler
   * @param {Number} wait - milliseconds between each event handler call
   */
  function throttle (handler, wait = 30) {
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
   * @param {Object} sprite element { target, width, height, columns, rows, {Array} frames }
   * @returns {Function} Handler
   */
  function getScrollHandler (spriteElement) {

    // return handler
    return (event) => {

      // update spriteElement
      spriteElement = setScrollY(
        win.pageYOffset,
        win.pageYOffset > spriteElement.scrollY
          ? nextFrame(spriteElement)
          : prevFrame(spriteElement)
      )

      if (!elementInViewY(spriteElement)) return

      win.requestAnimationFrame(() => (setBackgroundPosition(spriteElement)))
    }
  }

  // Main user functions

  function spritePlayOnScroll (target, spriteProps, wait = 30) {

    const setInitScrollY = setScrollY.bind(null, win.pageYOffset)

    win.addEventListener(
      'scroll',
      throttle(
        getScrollHandler(
          pipe(
            sprite,
            backgroundPositions,
            setInitScrollY
          )({ ...spriteProps, target })
        ),
        wait
      )
    )
  }

  // append user function to window
  win.spritePlayOnScroll = spritePlayOnScroll
}(window, window.document))
