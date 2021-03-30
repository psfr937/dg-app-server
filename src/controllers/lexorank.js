const convertStringToNumber = (str) => {
  let total = 0;
  let length = str.length;
  for (let i = 0; i < length; i++) {
    let val = str.charCodeAt(i) - 97;
    total += val * Math.pow(26, length -1 -i)
  }
  return total
};

const toBase = (num) => { // only i64 numbers
  const keys = [...'abcdefghijklmnopqrstuvwxyz'];
  const radix = 26;
  if (num < 0) var isNegative = true
  if (isNaN(num = Math.abs(+num))) return NaN;

  let output = [];
  do {
    let index = num % radix;
    output.unshift(keys[index]);
    num = Math.trunc(num / radix);
  } while (num != 0);
  if (isNegative) output.unshift('-');
  return output.join("");
};

export const findAverage = (a, b) => {
  let aLen = a.length;
  let bLen = b.length;
  let aLonger = aLen - bLen;
  if(aLonger > 0 ) b = b + 'a'.repeat(aLonger);
  if(aLonger < 0) a = a + 'a'.repeat(-aLonger);
  let aVal = convertStringToNumber(a);
  let bVal = convertStringToNumber(b);
  if(Math.abs(bVal-aVal) <= 1) {
    aVal = aVal * 26;
    bVal = bVal * 26;
  }
  const avgVal = Math.floor((aVal + bVal) / 2);

  return toBase(avgVal);
};

console.log(findAverage('ab', 'az'));

