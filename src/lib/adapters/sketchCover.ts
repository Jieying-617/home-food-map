export async function createSketchCover(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = Math.round((bitmap.height / bitmap.width) * 640);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法生成位置封面");

  ctx.filter = "grayscale(1) contrast(1.4) brightness(1.08)";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "rgba(255, 244, 214, 0.45)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("封面生成失败"))), "image/jpeg", 0.86);
  });
}
