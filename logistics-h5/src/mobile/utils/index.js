import { isFunction } from '@/utils/utils'

function getContainerDom (container) {
  let parent = isFunction(container) ? container() : container
  let child

  if (parent) {
    child = parent.nodeName === 'HTML' ? document.body : parent.firstChild
  } else {
    parent = document.body
    child = parent.firstChild
  }

  return {
    parent,
    child
  }
}
