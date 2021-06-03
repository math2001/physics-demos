function querySelector<T extends Element>(
  selector: string,
  parent: Document | Element = document
): T {
  const element: T | null = parent.querySelector(selector);
  if (element === null) {
    throw new Error(`element '${selector}' not found`);
  }
  return element;
}

function resizeCanvasAccordingToCSS(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  // const size = Math.floor(Math.min(rect.width, rect.height));
  const size = rect.width;
  canvas.width = size;
  canvas.height = size;
}

function drawSatellite(c: CanvasRenderingContext2D, x: number, y: number) {
  const radius = 0.03 * c.canvas.width;
  c.save();
  c.fillStyle = "red";
  c.beginPath();
  c.ellipse(
    x * c.canvas.width,
    y * c.canvas.height,
    radius,
    radius,
    0,
    0,
    2 * Math.PI
  );
  c.fill();
  c.restore();
}

function drawCenter(c: CanvasRenderingContext2D) {
  const radius = 0.02 * c.canvas.width;
  c.save();
  c.fillStyle = "blue";
  c.beginPath();
  c.ellipse(
    0.5 * c.canvas.width,
    0.5 * c.canvas.height,
    radius,
    radius,
    0,
    0,
    2 * Math.PI
  );
  c.fill();
  c.restore();
}

function squareLength(v: { x: number; y: number }): number {
  return v.x * v.x + v.y * v.y;
}

function drawVector(
  c: CanvasRenderingContext2D,
  color: string,
  startX: number,
  startY: number,
  endX: number,
  endY: number
) {
  c.save();
  c.strokeStyle = color;
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(startX * c.canvas.width, startY * c.canvas.width);
  c.lineTo(endX * c.canvas.width, endY * c.canvas.width);
  const distance = Math.sqrt(
    (endX - startX) * (endX - startX) + (endY - startY) * (endY - startY)
  );
  const normalizedDx = (endX - startX) / distance;
  const normalizedDy = (endY - startY) / distance;
  const length = 0.01;
  c.lineTo(
    (endX -
      normalizedDx * length * Math.SQRT2 +
      normalizedDy * length * Math.SQRT2) *
      c.canvas.width,
    (endY -
      normalizedDx * length * Math.SQRT2 -
      normalizedDy * length * Math.SQRT2) *
      c.canvas.width
  );
  c.moveTo(endX * c.canvas.width, endY * c.canvas.width);
  c.lineTo(
    (endX -
      normalizedDx * length * Math.SQRT2 -
      normalizedDy * length * Math.SQRT2) *
      c.canvas.width,
    (endY +
      normalizedDx * length * Math.SQRT2 -
      normalizedDy * length * Math.SQRT2) *
      c.canvas.width
  );
  c.stroke();
  c.restore();
}

function drawVectors(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  centripitalAcceleration: number,
  tangentialAcceleration: number
) {
  const length = Math.sqrt((x - 0.5) * (x - 0.5) + (y - 0.5) * (y - 0.5));
  centripitalAcceleration /= 5;
  tangentialAcceleration /= 5;

  drawVector(
    c,
    "purple",
    x,
    y,
    x + ((0.5 - x) * centripitalAcceleration) / length,
    y + ((0.5 - y) * centripitalAcceleration) / length
  );

  drawVector(
    c,
    "purple",
    x,
    y,
    x + (0.5 - y) * tangentialAcceleration,
    y - (0.5 - x) * tangentialAcceleration
  );

  drawVector(
    c,
    "green",
    x,
    y,
    x +
      ((0.5 - x) * centripitalAcceleration) / length +
      (0.5 - y) * tangentialAcceleration,
    y +
      ((0.5 - y) * centripitalAcceleration) / length -
      (0.5 - x) * tangentialAcceleration
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = querySelector<HTMLCanvasElement>("#canvas");
  const context = canvas.getContext("2d");
  if (context === null) throw new Error("no context");

  resizeCanvasAccordingToCSS(canvas);

  window.addEventListener("resize", () => {
    resizeCanvasAccordingToCSS(canvas);
  });

  const orbitalRadius = 0.3;
  const satellite = { x: 0.5 - orbitalRadius, y: 0.5 };
  const satelliteVelocity = { x: 0, y: -0.5 };

  const tangentialAcceleration = 0.6;

  let last = Date.now();

  let stop = false;
  document.addEventListener("keydown", (e) => {
    if (e.key == "Escape") {
      stop = true;
    }
  });

  const mainloop = () => {
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const dt = (Date.now() - last) / 1000;
    last = Date.now();
    // compute centripital acceleration |a_c| = v^2 / r
    const centripitalAcceleration =
      squareLength(satelliteVelocity) / orbitalRadius;

    // centripital acceleration always points towards the center
    // TODO: add the tangential acceleration
    const netAcceleration = {
      x: ((0.5 - satellite.x) / orbitalRadius) * centripitalAcceleration + 0,
      // ((0.5 - satellite.y) / orbitalRadius) * tangentialAcceleration,
      y: ((0.5 - satellite.y) / orbitalRadius) * centripitalAcceleration + 0,
      // ((0.5 - satellite.x) / orbitalRadius) * tangentialAcceleration,
    };

    satelliteVelocity.x += netAcceleration.x * dt;
    satelliteVelocity.y += netAcceleration.y * dt;

    satellite.x += satelliteVelocity.x * dt;
    satellite.y += satelliteVelocity.y * dt;

    drawSatellite(context, satellite.x, satellite.y);
    drawCenter(context);
    drawVectors(
      context,
      satellite.x,
      satellite.y,
      centripitalAcceleration,
      tangentialAcceleration
    );
    if (!stop) requestAnimationFrame(mainloop);
  };

  requestAnimationFrame(mainloop);
});
