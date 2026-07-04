const COVER_WIDTH = 960;
const COVER_HEIGHT = 720;
const WORK_WIDTH = 360;
const WORK_HEIGHT = 270;

type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

type DrawableImage = CanvasImageSource & {
  height: number;
  width: number;
};

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("无法读取位置照片"));
    reader.onload = () => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("无法解析位置照片"));
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

async function loadDrawableImage(file: File): Promise<DrawableImage> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // Some browser/file combinations fail createImageBitmap even when <img> can decode them.
    }
  }

  return loadImageElement(file);
}

function drawImageCover(ctx: CanvasRenderingContext2D, image: DrawableImage, width: number, height: number) {
  const scale = Math.max(width / image.width, height / image.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.width - sourceWidth) / 2;
  const sourceY = (image.height - sourceHeight) / 2;
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function cartoonize(imageData: ImageData) {
  const { data } = imageData;
  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const gray = red * 0.299 + green * 0.587 + blue * 0.114;
    const saturationBoost = 1.45;
    const brightness = 14;

    const boostedRed = gray + (red - gray) * saturationBoost + brightness;
    const boostedGreen = gray + (green - gray) * saturationBoost + brightness;
    const boostedBlue = gray + (blue - gray) * saturationBoost + brightness;

    const posterStep = max - min > 18 ? 34 : 42;
    data[index] = Math.min(255, Math.max(0, Math.round(boostedRed / posterStep) * posterStep));
    data[index + 1] = Math.min(255, Math.max(0, Math.round(boostedGreen / posterStep) * posterStep));
    data[index + 2] = Math.min(255, Math.max(0, Math.round(boostedBlue / posterStep) * posterStep));
  }
  return imageData;
}

function isCabinetPixel(red: number, green: number, blue: number) {
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const saturation = max - min;
  const isGreenBackground = green > red * 1.08 && green > blue * 1.12;
  const isBlueGrayPavement = blue > red * 0.78 && green > red * 0.82 && saturation < 46;
  const isWarmWood = red > 92 && green > 66 && blue < red * 0.78 && blue < green * 0.92 && red < green * 1.72;
  const isLightWood = red > 150 && green > 120 && blue > 72 && red > blue * 1.18 && green > blue * 1.08;

  return (isWarmWood || isLightWood) && !isGreenBackground && !isBlueGrayPavement;
}

function smoothMask(mask: Uint8ClampedArray, width: number, height: number, rounds: number) {
  let current = mask;

  for (let round = 0; round < rounds; round += 1) {
    const next = new Uint8ClampedArray(current.length);
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            count += current[(y + dy) * width + x + dx] ? 1 : 0;
          }
        }
        next[y * width + x] = count >= 4 ? 1 : 0;
      }
    }
    current = next;
  }

  return current;
}

function findCabinetMask(imageData: ImageData) {
  const { width, height, data } = imageData;
  const initialMask = new Uint8ClampedArray(width * height);
  const centerX = width / 2;
  const centerY = height * 0.55;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = (y * width + x) * 4;
      const red = data[pixel];
      const green = data[pixel + 1];
      const blue = data[pixel + 2];
      const horizontalWeight = 1 - Math.min(1, Math.abs(x - centerX) / centerX);
      const verticalWeight = 1 - Math.min(1, Math.abs(y - centerY) / centerY);

      if (isCabinetPixel(red, green, blue) && horizontalWeight > 0.08 && verticalWeight > 0.02) {
        initialMask[y * width + x] = 1;
      }
    }
  }

  const mask = smoothMask(initialMask, width, height, 2);
  const visited = new Uint8ClampedArray(width * height);
  let bestPixels: number[] = [];
  let bestScore = 0;

  for (let index = 0; index < mask.length; index += 1) {
    if (!mask[index] || visited[index]) continue;

    const queue = [index];
    const pixels: number[] = [];
    visited[index] = 1;
    let score = 0;

    for (let head = 0; head < queue.length; head += 1) {
      const current = queue[head];
      pixels.push(current);
      const x = current % width;
      const y = Math.floor(current / width);
      const centerWeight = 1.1 - Math.min(0.9, Math.hypot((x - centerX) / centerX, (y - centerY) / centerY));
      score += centerWeight;

      const neighbors = [current - 1, current + 1, current - width, current + width];
      for (const neighbor of neighbors) {
        const neighborX = neighbor % width;
        if (
          neighbor >= 0 &&
          neighbor < mask.length &&
          Math.abs(neighborX - x) <= 1 &&
          mask[neighbor] &&
          !visited[neighbor]
        ) {
          visited[neighbor] = 1;
          queue.push(neighbor);
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestPixels = pixels;
    }
  }

  const outputMask = new Uint8ClampedArray(width * height);
  const bounds: Bounds = { minX: width, minY: height, maxX: 0, maxY: 0 };
  for (const pixelIndex of bestPixels) {
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    outputMask[pixelIndex] = 1;
    bounds.minX = Math.min(bounds.minX, x);
    bounds.minY = Math.min(bounds.minY, y);
    bounds.maxX = Math.max(bounds.maxX, x);
    bounds.maxY = Math.max(bounds.maxY, y);
  }

  const pixelCount = bestPixels.length;
  if (pixelCount < width * height * 0.06) {
    return {
      mask: new Uint8ClampedArray(width * height).fill(1),
      bounds: { minX: 0, minY: 0, maxX: width - 1, maxY: height - 1 },
    };
  }

  return { mask: smoothMask(outputMask, width, height, 1), bounds };
}

function applyMask(imageData: ImageData, mask: Uint8ClampedArray) {
  const { data } = imageData;
  for (let index = 0; index < mask.length; index += 1) {
    const alphaIndex = index * 4 + 3;
    data[alphaIndex] = mask[index] ? 255 : 0;
  }
  return imageData;
}

function drawInkEdges(source: ImageData, target: CanvasRenderingContext2D, mask: Uint8ClampedArray, bounds: Bounds, targetRect: Bounds) {
  const edgeCanvas = document.createElement("canvas");
  edgeCanvas.width = source.width;
  edgeCanvas.height = source.height;
  const edgeCtx = edgeCanvas.getContext("2d");
  if (!edgeCtx) return;

  const edgeImage = edgeCtx.createImageData(source.width, source.height);
  const gray = new Uint8ClampedArray(source.width * source.height);
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const pixel = (y * source.width + x) * 4;
      gray[y * source.width + x] = source.data[pixel] * 0.299 + source.data[pixel + 1] * 0.587 + source.data[pixel + 2] * 0.114;
    }
  }

  for (let y = 1; y < source.height - 1; y += 1) {
    for (let x = 1; x < source.width - 1; x += 1) {
      const topLeft = gray[(y - 1) * source.width + x - 1];
      const top = gray[(y - 1) * source.width + x];
      const topRight = gray[(y - 1) * source.width + x + 1];
      const left = gray[y * source.width + x - 1];
      const right = gray[y * source.width + x + 1];
      const bottomLeft = gray[(y + 1) * source.width + x - 1];
      const bottom = gray[(y + 1) * source.width + x];
      const bottomRight = gray[(y + 1) * source.width + x + 1];
      const gx = -topLeft - 2 * left - bottomLeft + topRight + 2 * right + bottomRight;
      const gy = -topLeft - 2 * top - topRight + bottomLeft + 2 * bottom + bottomRight;
      const strength = Math.sqrt(gx * gx + gy * gy);
      const pixel = (y * source.width + x) * 4;

      if (mask[y * source.width + x] && strength > 74) {
        edgeImage.data[pixel] = 74;
        edgeImage.data[pixel + 1] = 48;
        edgeImage.data[pixel + 2] = 32;
        edgeImage.data[pixel + 3] = Math.min(210, (strength - 48) * 2.2);
      }
    }
  }

  edgeCtx.putImageData(edgeImage, 0, 0);
  target.imageSmoothingEnabled = true;
  target.drawImage(
    edgeCanvas,
    bounds.minX,
    bounds.minY,
    bounds.maxX - bounds.minX + 1,
    bounds.maxY - bounds.minY + 1,
    targetRect.minX,
    targetRect.minY,
    targetRect.maxX - targetRect.minX,
    targetRect.maxY - targetRect.minY,
  );
}

export async function createSketchCover(file: File): Promise<Blob> {
  const bitmap = await loadDrawableImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = COVER_WIDTH;
  canvas.height = COVER_HEIGHT;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法生成位置封面");

  const workCanvas = document.createElement("canvas");
  workCanvas.width = WORK_WIDTH;
  workCanvas.height = WORK_HEIGHT;
  const workCtx = workCanvas.getContext("2d", { willReadFrequently: true });
  if (!workCtx) throw new Error("无法生成位置封面");

  workCtx.imageSmoothingEnabled = true;
  drawImageCover(workCtx, bitmap, WORK_WIDTH, WORK_HEIGHT);
  const original = workCtx.getImageData(0, 0, WORK_WIDTH, WORK_HEIGHT);
  const { mask, bounds } = findCabinetMask(original);
  const posterized = applyMask(cartoonize(workCtx.getImageData(0, 0, WORK_WIDTH, WORK_HEIGHT)), mask);
  workCtx.putImageData(posterized, 0, 0);

  const objectWidth = bounds.maxX - bounds.minX + 1;
  const objectHeight = bounds.maxY - bounds.minY + 1;
  const scale = Math.min((COVER_WIDTH * 0.82) / objectWidth, (COVER_HEIGHT * 0.78) / objectHeight);
  const drawWidth = objectWidth * scale;
  const drawHeight = objectHeight * scale;
  const drawX = (COVER_WIDTH - drawWidth) / 2;
  const drawY = (COVER_HEIGHT - drawHeight) / 2 + COVER_HEIGHT * 0.03;
  const targetRect = { minX: drawX, minY: drawY, maxX: drawX + drawWidth, maxY: drawY + drawHeight };

  ctx.clearRect(0, 0, COVER_WIDTH, COVER_HEIGHT);
  ctx.fillStyle = "#fff6e5";
  roundedRect(ctx, 36, 36, COVER_WIDTH - 72, COVER_HEIGHT - 72, 48);
  ctx.fill();

  ctx.save();
  ctx.shadowColor = "rgba(112, 76, 36, 0.24)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 24;
  ctx.drawImage(
    workCanvas,
    bounds.minX,
    bounds.minY,
    objectWidth,
    objectHeight,
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  );
  ctx.restore();

  drawInkEdges(original, ctx, mask, bounds, targetRect);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("封面生成失败"))), "image/png");
  });
}
