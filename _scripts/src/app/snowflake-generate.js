export default function (color) {
  const MAX_RECURSION_LEVEL = 4;
  const randomValPerRecursion = new Uint8Array(MAX_RECURSION_LEVEL + 1);
  const canvasPart = document.createElement('canvas');
  const ctx = canvasPart.getContext('2d');
  const hypotenuse = 222;
  const sqrt3 = Math.sqrt(3);
  const xRight = hypotenuse / 2;
  const yBottom = xRight * sqrt3;
  canvasPart.width = 111;
  canvasPart.height = 192;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  crypto.getRandomValues(randomValPerRecursion);

  function drawHex(xOffset, yOffset, sideLength) {
    ctx.beginPath();
    ctx.moveTo(xOffset, 0.5 * sideLength + yOffset);
    ctx.lineTo(0.5 * sideLength * sqrt3 + xOffset, yOffset);
    ctx.lineTo(sideLength * sqrt3 + xOffset,  0.5 * sideLength + yOffset);
    ctx.lineTo(sideLength * sqrt3 + xOffset, 1.5 * sideLength + yOffset);
    ctx.lineTo(0.5 * sideLength * sqrt3 + xOffset, 2 * sideLength + yOffset);
    ctx.lineTo(xOffset, 1.5 * sideLength + yOffset);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }

  function getDivisor(iteration, iterations, divisorToTest = 2, halfway_) {
    if (divisorToTest > 8) {
      return;
    }

    const quotientToTest = Math.ceil(iterations / divisorToTest);
    const halfway = halfway_ || quotientToTest;
    let divisor = null;

    if (iteration === quotientToTest) {
      return divisorToTest;
    }
    else if (iteration < quotientToTest) {
      divisor = getDivisor(iteration, iterations, divisorToTest * 2, halfway / 2);
    }
    else if (iteration > quotientToTest) {
      divisor = getDivisor(iteration - Math.ceil(halfway), iterations, divisorToTest * 2, halfway / 2);
    }

    return divisor;
  }

  function drawHexes(xAxisStart, yAxisStart, angle, hexWidthHalf, sideLength, maxIterations, recursionLevel = 0) {
    if (recursionLevel > MAX_RECURSION_LEVEL) {
      return;
    }

    let angleNew;
    let xOffset;
    let yOffset;
    let xAxis = xAxisStart;
    let yAxis = yAxisStart;
    let recursionLevelOffset = 0;

    if (angle === 150) {
      xAxis -= 1 * hexWidthHalf;
      xOffset = xAxis;
      xOffset -= 1 * hexWidthHalf;
      yAxis -= 1.5 * sideLength;
      yOffset = yAxis;
      yOffset -= 1 * sideLength;
      angleNew = angle + 60;
    }
    if (angle === 210) {
      xAxis += 1 * hexWidthHalf;
      xOffset = xAxis;
      xOffset -= 1 * hexWidthHalf;
      yAxis -= 1.5 * sideLength;
      yOffset = yAxis;
      yOffset -= 1 * sideLength;
      angleNew = angle + 60;
    }
    if (angle === 270) {
      xAxis += 2 * hexWidthHalf;
      xOffset = xAxis;
      xOffset -= 1 * hexWidthHalf;
      yOffset = yAxis;
      yOffset -= 1 * sideLength;
      angleNew = angle + 60;
    }
    if (angle === 330) {
      xAxis += 1 * hexWidthHalf;
      xOffset = xAxis;
      xOffset -= 1 * hexWidthHalf;
      yAxis += 1.5 * sideLength;
      yOffset = yAxis;
      yOffset -= 1 * sideLength;
      angleNew = angle - 300;
    }
    if (angle === 30) {
      xAxis -= 1 * hexWidthHalf;
      xOffset = xAxis;
      xOffset -= 1 * hexWidthHalf;
      yAxis += 1.5 * sideLength;
      yOffset = yAxis;
      yOffset -= 1 * sideLength;
      angleNew = angle + 60;
    }
    if (angle === 90) { // Doesn't go this far now but here in case it does in the future.
      xAxis -= 2 * hexWidthHalf;
      xOffset = xAxis;
      xOffset += 1 * hexWidthHalf;
      yOffset = yAxis;
      yOffset -= 1 * sideLength;
      angleNew = angle + 60;
    }

    let iterations;

    if (recursionLevel === 0) {
      iterations = 0.875 * maxIterations;
      iterations += 0.25 * (randomValPerRecursion[recursionLevel] / 256) * maxIterations;
    }
    if (recursionLevel > 0) {
      iterations = 0.5 * maxIterations;
      iterations += 0.5 * (randomValPerRecursion[recursionLevel] / 256) * maxIterations;
    }

    iterations = Math.round(iterations);
    const randomValPerIteration = new Uint8Array(iterations);

    crypto.getRandomValues(randomValPerIteration);

    for (let i = 0; i < iterations; i++) {
      if (angle === 150) {
        xAxis += 1 * hexWidthHalf;
        xOffset += 1 * hexWidthHalf;
        yAxis += 1.5 * sideLength;
        yOffset += 1.5 * sideLength;
      }
      if (angle === 210) {
        xAxis -= 1 * hexWidthHalf;
        xOffset -= 1 * hexWidthHalf;
        yAxis += 1.5 * sideLength;
        yOffset += 1.5 * sideLength;
      }
      if (angle === 270) {
        xAxis -= 2 * hexWidthHalf;
        xOffset -= 2 * hexWidthHalf;
      }
      if (angle === 330) {
        xAxis -= 1 * hexWidthHalf;
        xOffset -= 1 * hexWidthHalf;
        yAxis -= 1.5 * sideLength;
        yOffset -= 1.5 * sideLength;
      }
      if (angle === 30) {
        xAxis += 1 * hexWidthHalf;
        xOffset += 1 * hexWidthHalf;
        yAxis -= 1.5 * sideLength;
        yOffset -= 1.5 * sideLength;
      }
      if (angle === 90) { // Doesn't go this far now but here in case it does in the future.
        xAxis += 2 * hexWidthHalf;
        xOffset += 2 * hexWidthHalf;
      }

      ctx.fillRect(xAxis, yAxis, 1, 1); // For debugging.
      drawHex(xOffset, yOffset, sideLength);

      let divisor = getDivisor(i, iterations);
      let x;
      let y;
      let hexWidthHalfNew;
      let sideLengthNew;

      if (divisor === 2) {
        recursionLevelOffset = 1;
      }
      if (divisor === 4) {
        recursionLevelOffset = 2;
      }
      if (divisor === 8) {
        recursionLevelOffset = 3;
      }

      // Make it less likely to branch at the very ends of the largest branches.
      if (
        recursionLevel === 0 &&
        (divisor === 4 || divisor === 8) &&
        (
          (i === iterations - 2 && (randomValPerIteration[i] < 256 / 3)) ||
          (i === iterations - 1 && (randomValPerIteration[i] < 512 / 3))
        )
      ) {
        divisor = null;
      }

      if (divisor) {
        // FOR DEBUGGING.
        // ctx.fillStyle = '#ff0000';
        // ctx.fillRect(xAxis, yAxis, 1, 1);
        // ctx.fillStyle = window.snowflake_color;

        let hexWidthHalfNew = hexWidthHalf / divisor;
        let sideLengthNew = sideLength / divisor;

        drawHexes(
          xAxis,
          yAxis,
          angleNew,
          hexWidthHalfNew,
          sideLengthNew,
          maxIterations,
          recursionLevel + recursionLevelOffset
        );
      }
    }
  }

  function draw(x, y, sideLength, angle) {
    // FOR DEBUGGING:
    // ctx.beginPath();
    // ctx.moveTo(x, y);
    // ctx.lineTo(x + xRight, y + (xRight* sqrt3));
    // ctx.stroke();

    const hexWidth = sideLength * sqrt3;
    const hexWidthHalf = hexWidth / 2;
    let xOffset = -hexWidthHalf;
    let yOffset = -sideLength;
    let yLowest = 2 * sideLength + yOffset;
    let maxIterations = 0;

    while (yLowest < yBottom) {
      yOffset += 1.5 * sideLength;
      yLowest = 2 * sideLength + yOffset;

      maxIterations++;
    }

    drawHexes(
      x,
      y,
      angle,
      hexWidthHalf,
      sideLength,
      maxIterations
    );
  }

  // MAIN EXECUTION.

  draw(0, 0, 16, 150);

  const canvasWhole = document.createElement('canvas');
  canvasWhole.width = 444;
  canvasWhole.height = 384;

  const ctx1 = canvasWhole.getContext('2d');
  ctx1.translate(222, 192);
  ctx1.drawImage(canvasPart, 0, 0);

  for (let i = 0; i < 5; i++) {
    ctx1.rotate(60 * Math.PI / 180);
    ctx1.drawImage(canvasPart, 0, 0);
  }

  ctx1.scale(-1, 1);
  ctx1.drawImage(canvasPart, 0, 0);

  for (let i = 0; i < 5; i++) {
    ctx1.rotate(60 * Math.PI / 180);
    ctx1.drawImage(canvasPart, 0, 0);
  }

  return canvasWhole;
}
