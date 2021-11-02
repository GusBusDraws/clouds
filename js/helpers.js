function make2DArray(nRows, nCols, fill = undefined) {
  let arr = new Array(nRows);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(nCols).fill(fill);
  }
  return arr;
}

function calcProb(prob) {
  if (Math.random() < prob) {
    return 1;
  }
  return 0;
}

function sumProb(existingProb, newProb) {
  prob = existingProb + newProb;
  if (prob > 1) {
    prob = 1;
  } else if (prob < 0) {
    prob = 0;
  }
  return prob;
}
