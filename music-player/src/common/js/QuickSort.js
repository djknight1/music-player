export function quickSort(arr,j) {
  if (!arr instanceof Array){
    return false
  } else {
    Qsort(a,1,j);
  }
}

/* 这是用来找标尺的,low表示从哪里开始排序,high表示排序到哪里 */
function Partion(arr,low,high) {
  if (!arr instanceof Array){
    return false
  } else {
    let key,i,t;
    key = arr[0];
    while (low <high) {
      while (low<high && a[high] >= key) --high
      t=a[low]
      a[low] = a[high]
      a[high] = t
      while(low<high && a[low] <=key) ++low
      t = a[high]
      a[high] = a[low]
      a[low] = t
    }
    a[low] = a[0]
    return low
  }
}

function Qsort( arr,low,high){
  let pivotloc;    //中间的标尺
  pivotloc = Partion(a,low,high);
  if(low<high){
    Qsort(a,low,pivotloc-1);
    Qsort(a,pivotloc+1,high);
  }
}
let arr = [,3,20,8,9,13]
 quickSort(arr,arr.length)
console.log(quickSort())
