
// spread: 1-7
// offset: 0-7

function computeWalls(spread, offset) {
  let walls = [];
  let error = 0;

  for (let i = 0; i < 8; i++) {
    let j = (i * spread + error) % 8;

    if (walls[j] !== undefined) {
      error++;
      j = (i * spread + error) % 8;
    }

    walls[j] = i;
  }

  if (offset) {
    walls = walls.concat(walls.splice(0,offset));
  }

  return walls;
}

function randomInt(max) {
  return ~~(Math.random() * max)
}

function createWallsObject(rowSpread, rowOffset, colSpread, colOffset) {
  if (rowSpread === 0 || colSpread === 0) {
    return null
  };

  let rowWalls = computeWalls(rowSpread, rowOffset);
  let colWalls = computeWalls(colSpread, colOffset);

  // prefent non connected nodes from appearing in the corners
  if (
    (rowWalls[0] === 1 && colWalls[0] === 1) ||
    (rowWalls[7] === 7 && colWalls[7] === 7) ||
    (rowWalls[0] === 7 && colWalls[7] === 1) ||
    (rowWalls[7] === 1 && colWalls[0] === 7)
  ) {
    return null
  }

  return {
    rowSpread: rowSpread,
    rowOffset: rowOffset,
    colSpread: colSpread,
    colOffset: colOffset,
    rowWalls: rowWalls,
    colWalls: colWalls
  }
}

function randomWalls() {
  let rowSpread = randomInt(6) + 1;
  let rowOffset = randomInt(7);
  let rowWalls = computeWalls(rowSpread, rowOffset);

  let colSpread = randomInt(6) + 1;
  let colOffset = randomInt(7);
  let colWalls = computeWalls(colSpread, colOffset);

  // prefent non connected nodes from appearing in the corners
  while (
    (rowWalls[0] === 1 && colWalls[0] === 1) ||
    (rowWalls[7] === 7 && colWalls[7] === 7) ||
    (rowWalls[0] === 7 && colWalls[7] === 1) ||
    (rowWalls[7] === 1 && colWalls[0] === 7)
  ) {
    colSpread = randomInt(6) + 1;
    colOffset = randomInt(7);
    colWalls = computeWalls(colSpread, colOffset);
  }

  return {
    rowSpread: rowSpread,
    rowOffset: rowOffset,
    colSpread: colSpread,
    colOffset: colOffset,
    rowWalls: rowWalls,
    colWalls: colWalls
  }
}

function randomWalls() {
  let rowSpread = randomInt(6) + 1;
  let rowOffset = randomInt(7);
  let colSpread = randomInt(6) + 1;
  let colOffset = randomInt(7);

  let walls = createWallsObject(rowSpread, rowOffset, colSpread, colOffset);

  // try until valid walls are created
  while (!walls) {
    console.log("invalid walls, trying again");
    colSpread = randomInt(6) + 1;
    colOffset = randomInt(7);
    walls = createWallsObject(rowSpread, rowOffset, colSpread, colOffset);
  }

  return walls;
}

function randomColors() {
  let colors = [0,1,2,3];
  let sectorAColor = colors.splice(randomInt(colors.length),1)[0];
  let sectorBColor = colors.splice(randomInt(colors.length),1)[0];
  let sectorCColor = colors.splice(randomInt(colors.length),1)[0];
  let sectorDColor = colors[0];

  return [
    sectorAColor,
    sectorBColor,
    sectorCColor,
    sectorDColor
  ]
}

function randomTarget() {
  return [randomInt(8), randomInt(8)];
}

function createTrapsObject(trapsSeed) {
  let trapsXY = [];

  for (let i = 0; i < 4; i++) {
    let seed = trapsSeed[i]
    let xy = [seed % 4, ~~(seed / 4)];
    if (i === 1 || i === 3) {
      xy[0] = xy[0] + 4; // move x coord for sectors B and D
    }
    if (i === 2 || i === 3) {
      xy[1] = xy[1] + 4; // move y coord for sectors C and D
    }
    trapsXY.push(xy);
  }

  return {
    trapsSeed: trapsSeed,
    trapsXY: trapsXY
  }
}

function randomTraps() {
  let trapsSeed = [
    randomInt(16),
    randomInt(16),
    randomInt(16),
    randomInt(16),
  ];

  return createTrapsObject(trapsSeed);
}

function randomNetwork() {
  let traps = randomTraps();
  let target = randomTarget();

  // prevent target from appearing on traps
  while (
    target.join() === traps.trapsXY[0].join() ||
    target.join() === traps.trapsXY[1].join() ||
    target.join() === traps.trapsXY[2].join() ||
    target.join() === traps.trapsXY[3].join()
  ) {
    target = randomTarget();
  }

  return {
    traps: randomTraps(),
    target: randomTarget(),
    colors: randomColors(),
    walls: randomWalls()
  }
}

function getNetworkMap(network) {
  const colorCodes = ['#3E5', '#3CF', '#FF3', '#F3C'];

  // 0 - wall (nothing)
  // 1 - connection h
  // 2 - connection v
  // 3 - node
  // 4 - trap
  // 5 - target
  const nodesLine = [3,1,3,1,3,1,3,1,3,1,3,1,3,1,3];
  const linksLine = [2,0,2,0,2,0,2,0,2,0,2,0,2,0,2];
  let networkGrid = []

  // create a default empty network map
  for (let i = 0; i < 8; i++) {
    networkGrid.push(nodesLine.slice(0));
    if (i < 7) {
      networkGrid.push(linksLine.slice(0));
    }
  }

  // if network has definition of walls/connections put them into map
  if (network && network.walls) {
    let walls;
    if (network.walls.rowWalls) {
      walls = network.walls.rowWalls;
      for (i = 0; i < 8; i++) {
        if (walls[i]) {
          networkGrid[i * 2][walls[i] * 2 - 1] = 0;
        }
      }
    }

    if (network.walls.colWalls) {
      walls = network.walls.colWalls;
      for (i = 0; i < 8; i++) {
        if (walls[i]) {
          networkGrid[walls[i] * 2 - 1][i * 2] = 0;
        }
      }
    }
  }

  // if network has definition of traps put them on the map
  if (network.traps && network.traps.trapsXY) {
    for (let trap of network.traps.trapsXY) {
      networkGrid[trap[1] * 2][trap[0] * 2] = 4;
    }
  }

  // if network has definition of target
  if (network.target) {
    networkGrid[network.target[1] * 2][network.target[0] * 2] = 5;
  }

  // turn magic numbers into HTML friendly string representation
  let networkString = networkGrid.map(function(line, i){
    var x = 0;
    return line.join('')
      .replace(/0/g, ' ') // print walls
      .replace(/1|2/g, function(value) { // print connections
        if (network && network.walls) { //if network has connections
          if (value === '1') {
            return '-'
          }
          if (value === '2') {
            return '|'
          }
        } else { //by default dont show connections at all
          return ' '
        }
      })
      .replace(/3|4|5/g, function(value) { // print nodes (including traps & target)
          let y = i / 2;
          var node = '&#9670;'; // standard node

          if (value === '4') { // it's a trap!
            node = '!'
          }

          if (value === '5') { // target
            node = 'X'
          }

          if (network.colors) {
            var color;

            if (y < 4) {
              color = (x < 4) ? colorCodes[network.colors[0]] : colorCodes[network.colors[1]];
            } else {
              color = (x < 4) ? colorCodes[network.colors[2]] : colorCodes[network.colors[3]];
            }

            x++;

            return '<span style="color: '+ color +'">' + node + '</span>';
          };

          return node;
      });
  }).join('\n');

  return networkString;
}

// GENERATING NETWORK CODES
// ==========================

// Code structure
// ----------------
//
// 0xTCCCC
//
// 0x - just a prefix to make it fancy
//
// T  - hex value [0-F] defining type of the code (colors, walls, traps, target)
//      T % 4 gives a number 0-3: (0: colors, 1: walls, 2: traps, 3: target)
//
// C - 4 hex values [0-F] defining the code value (depends on code type)

function parseCode(code) {
  code = code
    .replace('0x','')
    .split(''); // turn into array of hex characters

  if (code.length !== 5) {
    throw new Error('Invalid code. Code length is not valid.');
  }

  code = code
    .map(function(x) { return parseInt(x, 16)} ) // parse hex values
    .filter(function(n) { return !isNaN(n)} ) // get only numbers

  if (code.length !== 5) {
    throw new Error('Invalid code. Code contains invalid characters');
  }

  return code;
}

// Colors codes
// -------------
//
// 0xTABCD
//
// T - color code value T % 4 = 0: [0,4,8,C]
// ABCD - colors of corresponding sectors (A, B, C, D)
//        number on each position % 4 gives 0-3: id of a color
//
// Color of each sector needs to be different, otherwise code is invalid.
//
// Examples:
// 0xC16F8
// C % 4 = 0 (code defines color, C for color ;)
// 1 % 4 = 1 (color of sector A is 1)
// 6 % 4 = 2 (color of sector B is 2)
// F % 4 = 3 (color of sector C is 3)
// 8 % 4 = 0 (color of sector D is 0)
//
// 0x44206
// 4 % 4 = 0 (code defines color)
// 4 % 4 = 0 (color of sector A is 0)
// 2 % 4 = 2 (color of sector B is 2)
// 0 % 4 = 0 (color of sector C is 0)
// 6 % 4 = 2 (color of sector D is 2)
// Code is invalid as it has duplicated colors

function colorsToCode(colors) {
  let type = 'C'; // TODO: make it 0,4,8,C later?
  let code = '0x' + type + colors.join(''); // TODO: shift colors % 4

  return code;
}

// returns colors array for given color code
// throws if code is invalid
function codeToColors(code) {
  code = parseCode(code);

  let type = code.shift();

  if (type % 4 !== 0) {
    throw new Error('Invalid code. Code type is not a color code');
  }

  return decodeColors(code);
}

function decodeColors(values) {
  let colors = values.map(function(n) { return n % 4 });

  let hasDuplicates = colors.some(function (c,i) { return colors.indexOf(c) !== i });

  if (hasDuplicates) {
    throw new Error('Invalid code. Duplicated colors in different sectors');
  }

  return colors;
}
// Walls/connections codes
// -------------
//
// 0xT Sr Or Sc Oc
//
// T - walls code value T % 4 = 1: [1,5,9,D]
// Sr - row spread value for computing walls
//      Sr % 8 gives value of spread [1-7]
// Or - row offset value for computing walls
//      0r % 8 gives value of offset [0-7]
// Sc - column spread value for computing walls
//      Sr % 8 gives value of spread [1-7]
// Oc - column offset value for computing walls
//      0r % 8 gives value of offset [0-7]
//
// Spread may not have value of 0.
// Walls may not generate not connected corners.
// In such cases code is invalid.
//
// Examples:
// 0xD1234
// D % 4 = 1 (code defines walls)
// 1 % 8 = 1 (row spread value is 1)
// 2 % 8 = 2 (row offset value is 2)
// 3 % 8 = 3 (column spread value is 3)
// 4 % 8 = 4 (column spread value is 4)
//
// 0x1298E
// 1 % 4 = 1 (code defines walls)
// 2 % 8 = 2 (row spread value is 2)
// 9 % 8 = 1 (row offset value is 1)
// 8 % 8 = 0 (column spread value is 0)
// E % 8 = 6 (column spread value is 6)
// Code is invalid because spread can't be 0

function wallsToCode(walls) {
  let type = 'D'; // TODO: make it 1,5,9,D later?
  let code = '0x' + type;

  code = code + walls.rowSpread +
                walls.rowOffset +
                walls.colSpread +
                walls.colOffset; // TODO: shift values % 8

  return code;
}

// returns walls definition array for given wall code
// throws if code is invalid
function codeToWalls(code) {
  code = parseCode(code);

  let type = code.shift();

  if (type % 4 !== 1) {
    throw new Error('Invalid code. Code type is not a walls code');
  }

  return decodeWalls(code);
}

function decodeWalls(values) {
  values = values.map(function(n) { return n % 8 });

  let walls = createWallsObject(values[0], values[1], values[2], values[3]);

  if (!walls) {
    throw new Error('Invalid code. Code contains invalid walls definition')
  }

  return walls;
}
// Traps codes
// -------------
//
// 0xTABCD
//
// T - traps code value T % 4 = 2: [2,6,A,E]
// ABCD - traps positions in corresponding sectors (A, B, C, D)
//        number on each position [0-15] defines position of trap in given sector:
//            0  1  2  3
//            4  5  6  7
//            8  9 10 11
//           12 13 14 15
//
// Examples:
// 0xEF4D0
// E % 4 = 2 (code defines traps)
// F = 15 (trap position in sector A is 15, so its coors are [3,3] in whole network)
// 4      (trap position in sector B is 4, so its coors are [4,1] in whole network)
// D = 1  (trap position in sector C is 1, so its coors are [1,4] in whole network)
// 0      (trap position in sector D is 1, so its coors are [4,4] in whole network)

function trapsToCode(traps) {
  let type = 'E'; // TODO: make it 2,6,A,E later?
  let code = '0x' + type;

  code = code + traps.trapsSeed
    .map(function(t) { return t.toString(16).toUpperCase() })
    .join('');

  return code;
}

// returns traps definition for given traps code
// throws if code is invalid
function codeToTraps(code) {
  code = parseCode(code);

  let type = code.shift();

  if (type % 4 !== 2) {
    throw new Error('Invalid code. Code type is not a traps code');
  }

  return decodeTraps(code);
}

function decodeTraps(values) {
  return createTrapsObject(values);
}

// Target codes
// -------------
//
// 0xTXYXY
//
// T - traps code value T % 4 = 3: [3,7,B,F]
// XY - target coordinates in the network
//      each number % 8 is a X/Y coordinate 0-7
//
// Second pair of XY in the code is currently not used for any additional data.
// It should contain duplicated values of previous XY, which can be used to
// verify if code is valid.
//
// Examples:
// 0xB129A
// B % 4 = 3 (code defines target)
// 1 % 8 = 1 (X coordinate of target in network is 1)
// 2 % 8 = 2 (Y coordinate of target in network is 2)
// 9 % 8 = 1 (duplicated X coordinate of target in network is 1)
// A % 8 = 2 (duplicated Y coordinate of target in network is 2)
//
// 0xF298E
// F % 4 = 3 (code defines target)
// 2 % 8 = 2 (X coordinate of target in network is 2)
// 9 % 8 = 1 (Y coordinate of target in network is 1)
// 8 % 8 = 0 (duplicated X coordinate of target in network is 0)
// E % 8 = 6 (duplicated Y coordinate of target in network is 6)
// Code is invalid because duplicated coordinates don't match

function targetToCode(target) {
  let type = 'F'; // TODO: make it 3,7,B,F later?
  let code = '0x' + type;

  code = code + target.join('') + target
    .map(function(t) { return (t + 8).toString(16).toUpperCase() })
    .join('');

  return code;
}

// returns target definition for given target code
// throws if code is invalid
function codeToTarget(code) {
  code = parseCode(code);

  let type = code.shift();

  if (type % 4 !== 3) {
    throw new Error('Invalid code. Code type is not a target code');
  }

  return decodeTarget(code);
}

function decodeTarget(values) {
  values = values.map(function(n) { return n % 8 });

  if (values[0] !== values[2] || values[1] !== values[3]) {
    throw new Error('Invalid code. Code contains invalid target definition')
  }

  return values.splice(0,2);
}

// Generating network definition from list of codes

function getNetworkCodes(network) {
  return [
    colorsToCode(network.colors),
    wallsToCode(network.walls),
    trapsToCode(network.traps),
    targetToCode(network.target)
  ]
}

function networkFromCodes(codes) {
  let network = {};
  let errors = [];

  if (!codes || !codes.length) {
    errors.push("No codes defined")
  } else {
    for (let i = 0; i < codes.length; i++) {
      let code = codes[i];
      let parsed = null;

      try {
        parsed = parseCode(code);
      } catch(e) {
        errors.push(code + ": " + e.message);
      }

      if (parsed) {
        let type = parsed.shift() % 4;

        try {
          switch(type) {
            case 0:
            network.colors = decodeColors(parsed);
            break;
            case 1:
            network.walls = decodeWalls(parsed);
            break;
            case 2:
            network.traps = decodeTraps(parsed);
            break;
            case 3:
            network.target = decodeTarget(parsed);
            break;
          }
          // TODO: check if multiple codes of same type are given
          // TODO: check if traps conflict with target
        } catch (e) {
          errors.push(code + ": " + e.message);
        }
      }
    }
  }

  if (errors.length) {
    network.errors = errors;
  }

  return network;
}

// TESTS

function runTests() {

  function it(message, condition) {
    console[condition ? 'info' : 'error'](message);
  }

  console.group('computeWalls');

  it('should return sorted array for spread and offset 0',
    computeWalls(0,0).join() === [0,1,2,3,4,5,6,7].join()
  );

  it('should return array with defined spread of values',
    computeWalls(3,0).join() === [0,3,6,1,4,7,2,5].join()
  );

  it('should return valid array for spread that would overlap',
    computeWalls(4,0).join() === [0,2,4,6,1,3,5,7].join()
  );

  it('should offset array by given number',
    computeWalls(0,5).join() === [5,6,7,0,1,2,3,4].join()
  );

  console.groupEnd();

  console.group('colorsToCode');

  let colors = [0,1,2,3];

  it('should return valid code',
    colorsToCode(colors) === '0xC0123'
  );

  console.groupEnd();

  console.group('codeToColors');

  it('should return colors for valid code',
    codeToColors('0xC0123').join() === [0,1,2,3].join()
  );

  it('should return colors for code without 0x',
    codeToColors('C0123').join() === [0,1,2,3].join()
  );

  let err;

  err = null;

  try {
    codeToColors('12345678');
  } catch (e) {
    err = e;
  }

  it('should throw when code length is invalid',
    err
  );

  err = null;

  try {
    codeToColors('bączek');
  } catch (e) {
    err = e;
  }

  it('should throw when code is invalid',
    err
  );

  it('should return colors for code for code type 0',
    codeToColors('00123').join() === [0,1,2,3].join()
  );

  it('should return colors for code for code type 4',
    codeToColors('40123').join() === [0,1,2,3].join()
  );

  it('should return colors for code for code type 8',
    codeToColors('80123').join() === [0,1,2,3].join()
  );

  err = null;

  try {
    codeToColors('12345');
  } catch (e) {
    err = e;
  }

  it('should throw when code type is not color code',
    err
  );

  it('should return colors for code for colors % 4',
    codeToColors('C05AF').join() === [0,1,2,3].join()
  );

  err = null;

  try {
    codeToColors('C4242');
  } catch (e) {
    err = e;
  }

  it('should throw when code type has duplicated colors',
    err
  );

  let random = randomColors();
  it('should decode the same object that was coded',
    JSON.stringify(codeToColors(colorsToCode(random))) === JSON.stringify(random)
  );

  console.groupEnd();

  console.group('wallsToCode');

  let walls = {
    rowSpread: 1,
    rowOffset: 2,
    colSpread: 3,
    colOffset: 4
  }

  it('should return valid code',
    wallsToCode(walls) === '0xD1234'
  );

  console.groupEnd();

  console.group('codeToWalls');

  walls = codeToWalls('0xD1234');
  it('should return walls for valid code',
    walls.rowSpread === 1 && walls.rowOffset === 2 &&
    walls.colSpread === 3 && walls.colOffset === 4
  );

  walls = codeToWalls('D1234');
  it('should return colors for code without 0x',
    walls.rowSpread === 1 && walls.rowOffset === 2 &&
    walls.colSpread === 3 && walls.colOffset === 4
  );

  err = null;

  try {
    codeToWalls('12345678');
  } catch (e) {
    err = e;
  }

  it('should throw when code length is invalid',
    err
  );

  err = null;

  try {
    codeToWalls('bączek');
  } catch (e) {
    err = e;
  }

  it('should throw when code is invalid',
    err
  );

  walls = codeToWalls('11234');
  it('should return walls for code for code type 1',
    walls.rowSpread === 1 && walls.rowOffset === 2 &&
    walls.colSpread === 3 && walls.colOffset === 4
  );

  walls = codeToWalls('51234');
  it('should return colors for code for code type 5',
    walls.rowSpread === 1 && walls.rowOffset === 2 &&
    walls.colSpread === 3 && walls.colOffset === 4
  );

  walls = codeToWalls('91234');
  it('should return colors for code for code type 9',
    walls.rowSpread === 1 && walls.rowOffset === 2 &&
    walls.colSpread === 3 && walls.colOffset === 4
  );

  err = null;

  try {
    codeToWalls('01234');
  } catch (e) {
    err = e;
  }

  it('should throw when code type is not wall code',
    err
  );

  walls = codeToWalls('D1A3C');
  it('should return walls for code for walls % 8',
    walls.rowSpread === 1 && walls.rowOffset === 2 &&
    walls.colSpread === 3 && walls.colOffset === 4
  );

  err = null;

  try {
    codeToWalls('D0123');
  } catch (e) {
    err = e;
  }

  it('should throw when code has invalid walls definition',
    err
  );

  random = randomWalls();
  it('should decode the same object that was coded',
    JSON.stringify(codeToWalls(wallsToCode(random))) === JSON.stringify(random)
  );

  console.groupEnd();

  console.group('trapsToCode');

  let traps = {
    trapsSeed: [9,10,11,12]
  }

  it('should return valid code',
    trapsToCode(traps) === '0xE9ABC'
  );

  console.groupEnd();

  console.group('codeToTraps');

  it('should return traps for valid code',
    codeToTraps('0xE1234').trapsSeed.join() === [1,2,3,4].join()
  );

  it('should return colors for code without 0x',
    codeToTraps('0xE1234').trapsSeed.join() === [1,2,3,4].join()
  );

  err = null;

  try {
    codeToColors('12345678');
  } catch (e) {
    err = e;
  }

  it('should throw when code length is invalid',
    err
  );

  err = null;

  try {
    codeToColors('bączek');
  } catch (e) {
    err = e;
  }

  it('should throw when code is invalid',
    err
  );

  it('should return traps for code for code type 2',
    codeToTraps('0x21234').trapsSeed.join() === [1,2,3,4].join()
  );

  it('should return colors for code for code type 6',
    codeToTraps('0x61234').trapsSeed.join() === [1,2,3,4].join()
  );

  it('should return colors for code for code type A',
    codeToTraps('0xA1234').trapsSeed.join() === [1,2,3,4].join()
  );

  err = null;

  try {
    codeToTraps('32105');
  } catch (e) {
    err = e;
  }

  it('should throw when code type is not traps code',
    err
  );

  random = randomTraps();
  it('should decode the same object that was coded',
    JSON.stringify(codeToTraps(trapsToCode(random))) === JSON.stringify(random)
  );

  console.groupEnd();

  console.group('targetToCode');

  let target = [4,2];

  it('should return valid code',
    targetToCode(target) === '0xF42CA'
  );

  console.groupEnd();

  console.group('codeToTarget');

  it('should return target for valid code',
    codeToTarget('0xF129A').join() === [1,2].join()
  );

  it('should return colors for code without 0x',
    codeToTarget('0xF129A').join() === [1,2].join()
  );

  err = null;

  try {
    codeToTarget('12345678');
  } catch (e) {
    err = e;
  }

  it('should throw when code length is invalid',
    err
  );

  err = null;

  try {
    codeToTarget('bączek');
  } catch (e) {
    err = e;
  }

  it('should throw when code is invalid',
    err
  );

  it('should return traps for code for code type 3',
    codeToTarget('0xF129A').join() === [1,2].join()
  );

  it('should return colors for code for code type 7',
    codeToTarget('0x7129A').join() === [1,2].join()
  );

  it('should return colors for code for code type B',
    codeToTarget('0xB129A').join() === [1,2].join()
  );

  err = null;

  try {
    codeToTarget('02105');
  } catch (e) {
    err = e;
  }

  it('should throw when code type is not target code',
    err
  );

  err = null;

  try {
    codeToTarget('F1234');
  } catch (e) {
    err = e;
  }

  it('should throw when code does not contain duplicated target',
    err
  );


  random = randomTarget();
  it('should decode the same object that was coded',
    JSON.stringify(codeToTarget(targetToCode(random))) === JSON.stringify(random)
  );

  console.groupEnd();
}
