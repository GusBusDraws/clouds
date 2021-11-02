let fps = 10;
let nCols;
let nRows;
let res = 5;
let grid;
let nextGrid;
let col0;
let clouds = new Array();
let seeds = new Array();

function setup() {
  createCanvas(500, 500);
  background(75, 150, 200);
  frameRate(fps);
  nCols = width / res;
  nRows = height / res;
  grid = make2DArray(nCols, nRows);
  // Generate initial first column
  col0 = randProbArr(1, 25, nRows);
  for (let i = 0; i < col0.length; i++) {
    if (col0[i] == 1) {
      clouds.push(new Cloud(0, i));
    }
  }
}

function draw() {
  background(75, 150, 200);
  // Draw clouds   
  for (let cloud of clouds) {
    cloud.draw();
  }
  for (let i = 0; i < clouds.length; i++) {
    cloud = clouds[i];
    // Calc prob of dying
    // Move if not die
    cloud.move();
    nextGrid = make2DArray(nCols, nRows);
    nextGrid[cloud.y][cloud.x] = cloud;
    // Calc probs of seeding new clouds
    if (cloud.x == 1) {
      seeds.push(new Seed(0.5, 0, i));
    }
  }
  // For each prob, calc seeded clouds
  for (let seed of seeds) {
    // Replace nextGrid with col0 and use randProbArr?
    nextGrid[seed.y][seed.x] = probVal(seed.prob*100, 100);
  }
}
