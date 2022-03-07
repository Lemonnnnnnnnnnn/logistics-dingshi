
const scrollAction = { x: 'undefined', y: 'undefined' }
let scrollDirection


function scrollFunc () {
  if (typeof scrollAction.x === 'undefined') {
    scrollAction.x = window.pageXOffset;
    scrollAction.y = window.pageYOffset;
  }
  const diffY = scrollAction.y - window.pageYOffset;
  if (diffY < 0) {
    // Scroll down
    return 'down'
  } if (diffY > 0) {
    // Scroll up
    return 'up'
  }
  // First scroll event

  scrollAction.x = window.pageXOffset;
  scrollAction.y = window.pageYOffset;
}

export function startListenSign (onChange){
  window.onscroll = ()=>{
    const newDirection= scrollFunc();
    if (scrollDirection !== newDirection){
      // 页面向下滚动要做的事情
      scrollDirection = newDirection
      onChange(scrollDirection)
    }
  }
}


export function stopListenSign (){
  scrollAction.x = undefined
  scrollAction.y = undefined
  scrollDirection = undefined
  window.onscroll = null
}
