/* used to shuffle an array */

export function Shuffle(arr) {
  let newArr = []
  for (let j =0 ;j<arr.length ; j++) {
    newArr[j] = arr[j]
  }
  for(let i = 0; i< newArr.length ;i ++) {
    let j = getRandom(0, i)
    let temp = newArr[i]
    newArr[i] = newArr[j]
    newArr[j] = temp
  }
  return newArr
}

function getRandom(min, max) {
  /* 产生max - min之间的随机数 */
  return Math.floor(Math.random() * (max - min + 1) + min)
}
