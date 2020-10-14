export default function (color, width) {
  const canvasPart = document.createElement('canvas');
  const ctx = canvasPart.getContext('2d');
  const hypotenuse = width / 2;
  const sqrt3 = Math.sqrt(3);
  const xRight = hypotenuse / 2;
  const yBottom = xRight * sqrt3;
  canvasPart.width = width / 4;
  canvasPart.height = Math.round(canvasPart.width * sqrt3);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  function drawHex(xOffset, yOffset, sideLength) {
    ctx.beginPath();
    ctx.moveTo(xOffset, sideLength * 0.5 + yOffset);
    ctx.lineTo(sideLength * sqrt3 * 0.5 + xOffset, yOffset);
    ctx.lineTo(sideLength * sqrt3 + xOffset,  sideLength * 0.5 + yOffset);
    ctx.lineTo(sideLength * sqrt3 + xOffset, sideLength * 1.5 + yOffset);
    ctx.lineTo(sideLength * sqrt3 * 0.5 + xOffset, sideLength * 2 + yOffset);
    ctx.lineTo(xOffset, sideLength * 1.5 + yOffset);
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
    // Try to limit recursion so hexes stay at or above canvas pixel size.
    if (hexWidthHalf < 0.25) {
      return;
    }

    let angleNew;
    let xOffset;
    let yOffset;
    let xAxis = xAxisStart;
    let yAxis = yAxisStart;
    let recursionLevelOffset = 0;

    if (angle === 150) {
      xAxis -= hexWidthHalf * 1;
      xOffset = xAxis;
      xOffset -= hexWidthHalf * 1;
      yAxis -= sideLength * 1.5;
      yOffset = yAxis;
      yOffset -= sideLength * 1;
      angleNew = angle + 60;
    }
    if (angle === 210) {
      xAxis += hexWidthHalf * 1;
      xOffset = xAxis;
      xOffset -= hexWidthHalf * 1;
      yAxis -= sideLength * 1.5;
      yOffset = yAxis;
      yOffset -= sideLength * 1;
      angleNew = angle + 60;
    }
    if (angle === 270) {
      xAxis += hexWidthHalf * 2;
      xOffset = xAxis;
      xOffset -= hexWidthHalf * 1;
      yOffset = yAxis;
      yOffset -= sideLength * 1;
      angleNew = angle + 60;
    }
    if (angle === 330) {
      xAxis += hexWidthHalf * 1;
      xOffset = xAxis;
      xOffset -= hexWidthHalf * 1;
      yAxis += sideLength * 1.5;
      yOffset = yAxis;
      yOffset -= sideLength * 1;
      angleNew = angle - 300;
    }
    if (angle === 30) {
      xAxis -= hexWidthHalf * 1;
      xOffset = xAxis;
      xOffset -= hexWidthHalf * 1;
      yAxis += sideLength * 1.5;
      yOffset = yAxis;
      yOffset -= sideLength * 1;
      angleNew = angle + 60;
    }
    if (angle === 90) {
      xAxis -= hexWidthHalf * 2;
      xOffset = xAxis;
      xOffset += hexWidthHalf * 1;
      yOffset = yAxis;
      yOffset -= sideLength * 1;
      angleNew = angle + 60;
    }

    const r = Math.random();
    let iterations;


    if (recursionLevel === 1 || recursionLevel === 2) {
      iterations = maxIterations * 0.5;
      iterations += r * maxIterations * 0.5;
    }
    else {
      iterations = maxIterations * 0.75;
      iterations += r * maxIterations * 0.25;
    }

    iterations = Math.round(iterations);
    const randomValPerIteration = new Uint8Array(iterations);

    crypto.getRandomValues(randomValPerIteration);

    for (let i = 0; i < iterations; i++) {
      if (angle === 150) {
        xAxis += hexWidthHalf * 1;
        xOffset += hexWidthHalf * 1;
        yAxis += sideLength * 1.5;
        yOffset += sideLength * 1.5;
      }
      if (angle === 210) {
        xAxis -= hexWidthHalf * 1;
        xOffset -= hexWidthHalf * 1;
        yAxis += sideLength * 1.5;
        yOffset += sideLength * 1.5;
      }
      if (angle === 270) {
        xAxis -= hexWidthHalf * 2;
        xOffset -= hexWidthHalf * 2;
      }
      if (angle === 330) {
        xAxis -= hexWidthHalf * 1;
        xOffset -= hexWidthHalf * 1;
        yAxis -= sideLength * 1.5;
        yOffset -= sideLength * 1.5;
      }
      if (angle === 30) {
        xAxis += hexWidthHalf * 1;
        xOffset += hexWidthHalf * 1;
        yAxis -= sideLength * 1.5;
        yOffset -= sideLength * 1.5;
      }
      if (angle === 90) {
        xAxis += hexWidthHalf * 2;
        xOffset += hexWidthHalf * 2;
      }

      // FOR DEBUGGING.
      // ctx.fillStyle = '#ff0000';
      // ctx.fillRect(xAxis, yAxis, 1, 1);
      // ctx.fillStyle = color;

      if (
        recursionLevel === 0 ||
        (
          (xOffset >= 0 && xOffset <= canvasPart.width) &&
          (yOffset >= 0 && yOffset <= canvasPart.height)
        )
      ) {
        drawHex(xOffset, yOffset, sideLength);
      }
      else {
        break;
      }

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
      if (recursionLevel === 0) {
        if (
          (divisor === 4 && i === iterations - 1) ||
          (
            (divisor === 4 || divisor === 8) &&
            (
              (i === iterations - 2 && (randomValPerIteration[i] < 256 / 3)) ||
              (i === iterations - 1 && (randomValPerIteration[i] < 512 / 3))
            )
          )
        ) {
          divisor = null;
        }
      }

      if (divisor) {
        // FOR DEBUGGING.
        // ctx.fillStyle = '#ff0000';
        // ctx.fillRect(xAxis, yAxis, 1, 1);
        // ctx.fillStyle = color;

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
    let yLowest = sideLength * 2 + yOffset;
    let maxIterations = 0;

    while (yLowest < yBottom) {
      yOffset += sideLength * 1.5;
      yLowest = sideLength * 2 + yOffset;

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

  draw(0, 0, canvasPart.height / 12, 150);

  const canvasWhole = document.createElement('canvas');
  canvasWhole.width = width;
  canvasWhole.height = canvasPart.height * 2;

  const ctx1 = canvasWhole.getContext('2d');
  ctx1.translate(hypotenuse, canvasPart.height);
  ctx1.drawImage(canvasPart, 0, 0);

  for (let i = 0; i < 5; i++) {
    ctx1.rotate(Math.PI * 60 / 180);
    ctx1.drawImage(canvasPart, 0, 0);
  }

  ctx1.scale(-1, 1);
  ctx1.drawImage(canvasPart, 0, 0);

  for (let i = 0; i < 5; i++) {
    ctx1.rotate(Math.PI * 60 / 180);
    ctx1.drawImage(canvasPart, 0, 0);
  }

  return canvasWhole;
}
