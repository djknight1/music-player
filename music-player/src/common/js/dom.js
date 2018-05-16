export function addClass(el,className) {

}
/* 获取带有data-属性的后面的值 */
export function getData(el, name, val) {
  const prefix = 'data-'
  name = prefix + name
  /* 如果你传了val就get,没有就set */
  if (val) {
    return el.setAttribute(name,val)
  } else {
    return el.getAttribute(name)
  }
}
