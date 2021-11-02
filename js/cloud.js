class Cloud {
  constructor(r, c, res) {
    this.r = r;
    this.c = c;
    this.res = res;
    this.rgba = [255, 255, 255, 255];
    this.toDelete = 0;
  }
  draw() {
    fill(
      this.rgba[0], 
      this.rgba[1], 
      this.rgba[2], 
      this.rgba[3]
    );
    noStroke();
    rect(
      this.c * this.res, 
      this.r * this.res, 
      this.res, 
      this.res
    );
  }
  move() {
    this.c++;
  }
  besideProb(
    probSeedGrid, 
    seedLocs, 
    probSeedCol0Beside
  ) {
    // If seed object doesn't already exists in grid directly to the left of the cloud (in the first col), create a new seed object, store a reference in the grid, and add the location within the grid [row, col] to the list seedLocs; else, sum the new probability and the probability that already exists at that location within the existing seed object
    if (!probSeedGrid[this.r][0]) {
      // Store seed object at corresponding location in grid
      probSeedGrid[this.r][0] = new Seed(
        this.r, 0, probSeedCol0Beside
      );
      // Add location of seed in grid to seedLocs list
      seedLocs.push([this.r, 0]);
    } else {
      // Sum seed prob with existing prob 
      let newProb = sumProb(
        probSeedGrid[this.r][0].prob, probSeedCol0Beside
      );
      // Apply summed newProb to seed probability in grid of seed objects for seed at this location
      probSeedGrid[this.r][0].prob = newProb;
    }
    return probSeedGrid, seedLocs;
  }
  topCornerProb(
    probSeedGrid, 
    seedLocs, 
    probSeedCol0TopCorner
  ) {
    // If seed object doesn't already exists in grid above and to the left of the live cloud cell (in the first col), create a new seed object, store a reference in the grid, and add the location within the grid [row, col] to the list seedLocs; else, sum the new probability and the probability that already exists at that location within the existing seed object
    if (!probSeedGrid[this.r - 1][0]) {
      // Store seed object at corresponding location in grid
      probSeedGrid[this.r - 1][0] = new Seed(
        this.r - 1, 0, probSeedCol0TopCorner
      );
      // Add location of seed in grid to seedLocs list
      seedLocs.push([this.r - 1, 0]);
    } else {
      // Sum seed prob with existing prob 
      let newProb = sumProb(
        probSeedGrid[this.r - 1][0].prob, probSeedCol0TopCorner
      );
      // Apply summed newProb to seed probability in grid of seed objects for seed at this location
      probSeedGrid[this.r - 1][0].prob = newProb;
    }
    return probSeedGrid, seedLocs;
  }
  bottomCornerProb(
    probSeedGrid, 
    seedLocs, 
    probSeedCol0BottomCorner
  ) {
    // If seed object doesn't already exists in grid below and to the left of the live cloud cell (in the first col), create a new seed object, store a reference in the grid, and add the location within the grid [row, col] to the list seedLocs; else, sum the new probability and the probability that already exists at that location within the existing seed object
    if (!probSeedGrid[this.r + 1][0]) {
      // Store seed object at corresponding location in grid
      probSeedGrid[this.r + 1][0] = new Seed(
        this.r + 1, 0, probSeedCol0BottomCorner
      );
      // Add location of seed in grid to seedLocs list
      seedLocs.push([this.r + 1, 0]);
    } else {
      // Sum seed prob with existing prob 
      let newProb = sumProb(
        probSeedGrid[this.r + 1][0].prob, probSeedCol0BottomCorner
      );
      // Apply summed newProb to seed probability in grid of seed objects for seed at this location
      probSeedGrid[this.r + 1][0].prob = newProb;
    }
    return probSeedGrid, seedLocs;
  }
}

class Seed {
  constructor(r, c, p) {
    this.r = r;
    this.c = c;
    this.prob = p;
  }
}
