const preset = 'big-square';
let fps = 5;
let probSeedCol0Spawn = 0.002;
let probSeedCol0Beside = 1;
let probSeedCol0TopCorner = 0.2;
let probSeedCol0BottomCorner = 0.2;
let probSeedRandomSpawn = 0.0;
// Bug when probMaintain != 1
let probMaintain = 0.9;
let probGrow = 0.01;
let bg = [75, 150, 200];
let nCols;
let nRows;
let probLocs = [];
let probGrid;
let clouds = [];
let cloudsToDelete;
let liveCells;
// Set true to save GIF animation
// let save = true;
let save = false;
let wait = 0;
let nFrames = 100;
// Set countClouds to true for debugging cloud counting
let countClouds = true;

const [nPixelsRow, nPixelsCol, res, margins] = presets(preset);

function presets(name) {
  let nPixelsRow;
  let nPixelsCol;
  let res;
  let margins;
  if (name == 'magma-overlay') {
    nPixelsRow = 1100;
    nPixelsCol = 2000;
    res = 10;
    margins = 110;
  }
  else if (name == 'procreate-overlay') {
    nPixelsRow = 1100;
    nPixelsCol = 2000;
    res = 10;
    margins = 150;
  }
  else if (name == 'square') {
    nPixelsRow = 500;
    nPixelsCol = 500;
    res = 10;
    margins = undefined;
  }
  else if (name == 'big-square') {
    nPixelsRow = 500;
    nPixelsCol = 500;
    res = 5;
    margins = undefined;
  }
  return [nPixelsRow, nPixelsCol, res, margins];
}

function keyPressed() {
  // Set spacebar to toggle play/pause of drawing loop
  if (key === ' ') {
    if (isLooping()) {
      noLoop();
      console.log('STOPPED. Press SPACE to resume.')
    } else {
      loop();
      console.log('RESUMED. Press SPACE to stop.')
    }
  }
}

function setup() {
  createCanvas(nPixelsCol, nPixelsRow);
  console.log('setup');
  frameRate(fps);
  background(bg[0], bg[1], bg[2]);
  nRows = height / res;
  nCols = width / res;
  probGrid = make2DArray(nRows, nCols, undefined);
  liveCells = make2DArray(nRows, nCols, 0); 
  cloudsToDelete = make2DArray(nRows, nCols, 0);
  if (save && frameCount - 1 < nFrames) saveCanvas(
    `frame_${('000' + frameCount).slice(-3)}`
  );
  console.log('end of setup')
}

function draw() {
  background(bg[0], bg[1], bg[2]);
  // Wipe liveCells so that cells can be moved and redrawn
  liveCells = make2DArray(nRows, nCols, 0);
  // Clear probabilities
  probGrid = make2DArray(nRows, nCols, 0);
  probLocs = [];
  // Delete clouds that drifted off the screen in the previous loop by reseting clouds array to a filtered version of itself with only the items that have Cloud.toDelete !== 1
  clouds = clouds.filter(cloud => !cloud.toDelete);
  for (let cloud of clouds) {
    // Ignore cloud if deleted
    //--------------------------------------------------------------------------
    // Check if cloud was marked to delete from it's death after the last cloud iteration loop (i.e. in the Calc Probs phase)
    if (cloudsToDelete[cloud.r][cloud.c]) {
      cloud.toDelete = 1;
      cloudsToDelete[cloud.r][cloud.c] = 0;
      continue;
    }
    /////////////////
    // Draw Clouds //
    /////////////////
    //--------------------------------------------------------------------------
    cloud.draw();
    /////////////////
    // Move Clouds //
    /////////////////
    //--------------------------------------------------------------------------
    cloud.move();
    liveCells[cloud.r][cloud.c] = 1;
    // Mark cloud to delete if it is in last column
    if (cloud.c == nCols) {
      cloud.toDelete = 1;
    } 
    ///////////////////////
    // Sum probabilities //
    ///////////////////////
    //--------------------------------------------------------------------------
    // Add probability of cloud to maintain by adding probability to grid
    //--------------------------------------------------------------------------
    probGrid[cloud.r][cloud.c] = probMaintain;
    if (!probLocs.includes[cloud.r, cloud.c]) {
      probLocs.push([cloud.r, cloud.c]);
    }
    // Set row offset range for surrounding cells to make sure off-grid probabilities aren't added
    let rowOffsetRange;
    if (cloud.r == 0) {
      rowOffsetRange = [0, 1];
    } else if (cloud.r == nRows - 1) {
      rowOffsetRange = [-1, 0];
    } else {
      rowOffsetRange = [-1, 1];
    }
    // Set column offset range for surrounding cells to make sure off-grid probabilities aren't added (We consider column 0 to be off grid so that clouds don't grow in the column that they're spawning)
    let colOffsetRange;
    if (cloud.c == 0) {
      colOffsetRange = [1, 1];
    } else if (cloud.c == 1) {
      colOffsetRange = [0, 1];
    } else if (cloud.c == nCols - 1) {
      colOffsetRange = [-1, 0];
    } else {
      colOffsetRange = [-1, 1];
    }
    // Iterate through the row & column offsets to sum the probabilities of growing a cell in each of the cells surrounding a live cloud cell
    for (let rowOffset = rowOffsetRange[0]; rowOffset <= rowOffsetRange[1]; rowOffset++) {
      for (let colOffset = colOffsetRange[0]; colOffset <= colOffsetRange[1]; colOffset++) {
        let row = cloud.r + rowOffset;
        let col = cloud.c + colOffset;
        probGrid[row][col] = sumProb(
          probGrid[row][col], probGrow
        );
        if (!probLocs.includes[row, col]) {
          probLocs.push([row, col]);
        }
      }
    }
    // Sum probs for new column 0 seeds based on clouds in column 1
    //--------------------------------------------------------------------------
    if (cloud.c == 1) {
      // Sum probs for seeds to form in col 0 directly beside live cells in col 1
      probGrid[cloud.r][0] = sumProb(
        probGrid[cloud.r][0], probSeedCol0Beside
      );
      if (!probLocs.includes[cloud.r, 0]) {
        probLocs.push([cloud.r, 0]);
      }
      // Sum probs for seeds to form in col 0 above and beside live cells in col 1
      if (cloud.r != 0) {
        probGrid[cloud.r - 1][0] = sumProb(
          probGrid[cloud.r - 1][0], probSeedCol0TopCorner
        );
        if (!probLocs.includes[cloud.r - 1, 0]) {
          probLocs.push([cloud.r - 1, 0]);
        }
      }
      // Sum probs for seeds to form in col 0 below and beside live cells in col 1
      if (cloud.r != nRows - 1) {
        probGrid[cloud.r + 1][0] = sumProb(
          probGrid[cloud.r + 1][0], probSeedCol0BottomCorner
        );
        if (!probLocs.includes[cloud.r + 1, 0]) {
          probLocs.push([cloud.r + 1, 0]);
        }
      }
    }
  }
  //--------------//
  // Loop Logging // 
  //--------------//
  // Compare number of cloud in list to live cells on grid before calculating the probabilities for new clouds
  if (countClouds) {
    console.log(`Frame: ${frameCount - 1}`)
    console.log(`Number of clouds: ${clouds.length}`);
    let nLiveCells = 0;
    for (let row = 0; row < nRows; row++) {
      for (let col = 0; col < nCols; col++) {
        if (liveCells[row][col] == 1) {
          nLiveCells++;
        }
      }
    }
    console.log(`Number of live cells: ${nLiveCells}`);
    console.log(`Number of prob locs: ${probLocs.length }`);
  }
  ////////////////
  // Calc Probs //
  ////////////////
  // Calculate probabilities to determine which cells need to be drawn
  //----------------------------------------------------------------------------
  for (let loc of probLocs) {
    let prob = probGrid[loc[0]][loc[1]];
    let cell = calcProb(prob);
    // If cell is to be turned from dead to alive, make a new Cloud object (cell is true in this case because it will be 1 and !liveCells[seed.r][seed.c] is true because seed location in liveCells was previously undefined)
    if (cell && !liveCells[loc[0]][loc[1]]) {
      // Add a new cloud object to the clouds list
      clouds.push(new Cloud(loc[0], loc[1], res));
    } else if (!cell && liveCells[loc[0]][loc[1]]) {
      // If cell is to be turned from alive to dead, mark the Cloud object to be deleted in cloudsToDelete 2D array (Do not turn off in liveCells so that it is known that a cloud was there for any other probs)
      cloudsToDelete[loc[0]][loc[1]] = 1;
      // liveCells[loc[0]][loc[1]] = 0;
    }
    if (cell) {
      liveCells[loc[0]][loc[1]] = 1;
    }
  }
  // Calculate the spawning of any new clouds in column 0
  //----------------------------------------------------------------------------
  for (r = 0; r < nRows; r++) {
    // Calc probability seed will be 0 or 1 based on probSeedCol0Spawn
    let seedCol0 = calcProb(probSeedCol0Spawn);
    // If seeded (seedCol0 == 1), add Seed object with row, col, prob info to seedProbList to be turned into cloud/live cell in first loop of draw()
    if (seedCol0) {
      clouds.push(new Cloud(r, 0, res));
      liveCells[r][0] = 1;
    }
  }
  // Calculate the spawning of any new clouds at a random position on the grid
  //----------------------------------------------------------------------------
  let seedRandom = calcProb(probSeedRandomSpawn);
  // If seeded (seedRandom == 1), add Seed object with row, col, prob info to seedProbList to be turned into cloud/live cell in first loop of draw()
  if (seedRandom) {
    let row = Math.floor(Math.random() * (nRows));
    let col = Math.floor(Math.random() * (nCols));
    if (!liveCells[row][col]) {
      clouds.push(new Cloud(row, col, res));
      liveCells[row][col] = 1;
    }
  }
  //--------------//
  // Erase Center // 
  //--------------//
  if (margins) {
    erase();
    rect(margins, margins, 1920 - (2*margins), 1080 - (2*margins));
    noErase();
  }
  //-------------//
  // Save Frames // 
  //-------------//
  // if save is true, save frames
  if (save && frameCount - 1 < nFrames - 1) saveCanvas(
    `frame_${('000' + frameCount).slice(-3)}`
  );
}
