"use client";

const MAX_EDGE = 2560;

/**
 * Shrink a photo in the browser before upload: max 2560px, JPEG. This keeps uploads small
 * and strips EXIF metadata (including the GPS location phones embed in photos).
 */
export async function preparePhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("לא הצלחנו לעבד את התמונה"))), "image/jpeg", 0.9),
  );
}
