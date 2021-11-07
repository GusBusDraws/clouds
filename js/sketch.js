// let nPixelsRow = 1100;
// let nPixelsCol = 2000;
// let res = 10;
let nPixelsRow = 2000;
let nPixelsCol = 1100;
let res = 10;
let fps = 5;
// let margins = 110;
let margins = undefined;
let probSeedCol0Init = 0.05;
let probSeedCol0Spawn = 0.002;
let probSeedCol0Beside = 0.45;
let probSeedCol0TopCorner = 0.3;
let probSeedCol0BottomCorner = 0.2;
let bg = [75, 150, 200];
let nCols;
let nRows;
let seedLocs = [];
let probSeedCells;
let clouds = [];
let cloudsToDelete;
let liveCells;
// Set true to save GIF animation
// let save = true;
let save = false;
let wait = 0;
let nFrames = 100;

a, b = preset('overlay');

function preset(name) {
  if (name === 'overlay') {
    let a = 1;
    let b = 2;
  }
  return a, b;
}

function setup() {
  createCanvas(nPixelsCol, nPixelsRow);
  console.log('setup');
  frameRate(fps);
  background(bg[0], bg[1], bg[2]);
  nRows = height / res;
  nCols = width / res;
  probSeedGrid = make2DArray(nRows, nCols, undefined);
  liveCells = make2DArray(nRows, nCols, 0);
  cloudsToDelete = make2DArray(nRows, nCols, 0);
  // Fill column 0 with initial seed probs
  for (r = 0; r < nRows; r++) {
    // Cacl probability seed will be 0 or 1 based on probSeedCol0Init
    let seedProb = calcProb(probSeedCol0Init);
    // If seeded (seed = 1), add Seed object with row, col, prob info to seedProbList to be turned into cloud/live cell in first loop of draw()
    if (seedProb) {
      clouds.push(new Cloud(r, 0, res));
    }
  }
  if (save && frameCount - 1 < nFrames) saveCanvas(
    `frame_${('000' + frameCount).slice(-3)}`
  );
  console.log('end of setup')
}

function keyPressed() {
  // Set spacebar to toggle play/pause of drawing loop
  if (key === ' ') {
    if (isLooping()) {
      noLoop();
    } else {
      loop();
    }
  }
  // Disable any default browser actions
  return false;
}

function draw() {
  console.log(frameCount);
  background(bg[0], bg[1], bg[2]);
  //-------------//
  // Draw Clouds //
  //-------------//
  for (let cloud of clouds) {
    cloud.draw();
  }
  //-------------//
  // Move clouds //
  //-------------//
  // Wipe liveCells so that cells can be moved and redrawn
  liveCells = make2DArray(nRows, nCols, 0);
  for (let cloud of clouds) {
    if (!cloudsToDelete[cloud.r][cloud.c]) {
      cloud.move();
      liveCells[cloud.r][cloud.c] = 1;
    } else {
      cloud.toDelete = 1;
      cloudsToDelete[cloud.r][cloud.c] = 0;
    }
    // Reset clouds to a filtered version of itself with only the items that have Cloud.toDelete !== 1
    clouds = clouds.filter(cloud => !cloud.toDelete);
  }
  //-----------//
  // Sum probs //
  //-----------//
  // Live cell based probs
  for (let cloud of clouds) {
    // For clouds in column 1, sum probs for new column 0 seeds
    if (cloud.c == 1) {
      // Sum probs for seeds to form in col 0 directly beside live cells in col 1
      probSeedGrid, seedLocs = cloud.besideProb(
        probSeedGrid, seedLocs, probSeedCol0Beside
      );
      // Sum probs for seeds to form in col 0 above and beside live cells in col 1
      if (cloud.r != 0) {
        probSeedGrid, seedLocs = cloud.topCornerProb(
          probSeedGrid, seedLocs, probSeedCol0TopCorner
        );
      }
      // Sum probs for seeds to form in col 0 below and beside live cells in col 1
      if (cloud.r != nRows - 1) {
        probSeedGrid, seedLocs = cloud.bottomCornerProb(
          probSeedGrid, seedLocs, probSeedCol0BottomCorner
        );
      }
    }
  }
  //------------//
  // Calc Probs //
  //------------//
  // Calculate probabilities to determine which cells need to be drawn
  for (let loc of seedLocs) {
    let seed = probSeedGrid[loc[0]][loc[1]];
    let cell = calcProb(seed.prob);
    // If cell is to be turned from dead to alive, make a new Cloud object (cell is true in this case because it will be 1 and !liveCells[seed.r][seed.c] is true because seed location in liveCells was previously undefined)
    if (cell && !liveCells[seed.r][seed.c]) {
      // Add a new cloud object to the clouds list
      clouds.push(new Cloud(seed.r, seed.c, res));
    } else if (!cell && liveCells[seed.r][seed.c]) {
      cloudsToDelete[seed.r][seed.c] = 1;
    }
    if (cell) {
      liveCells[seed.r][seed.c] = 1;
    }
  }
  // Calculate the spawning of any new clouds
  for (r = 0; r < nRows; r++) {
    // Calc probability seed will be 0 or 1 based on probSeedCol0Spawn
    let seedProb = calcProb(probSeedCol0Spawn);
    // If seeded (seed = 1), add Seed object with row, col, prob info to seedProbList to be turned into cloud/live cell in first loop of draw()
    if (seedProb) {
      clouds.push(new Cloud(r, 0, res));
    }
  }
  // Clear probabilities
  probSeedGrid = make2DArray(nRows, nCols, 0);
  seedLocs = [];
  //--------------//
  // Erase Center // 
  //--------------//
  if (margins) {
    erase();
    rect(margins, margins, 1920 - (2*margins), 1080 - (2*margins));
    noErase();
  }
  // if save is true, save frames
  if (save && frameCount - 1 < nFrames) saveCanvas(
    `frame_${('000' + frameCount).slice(-3)}`
  );
}
