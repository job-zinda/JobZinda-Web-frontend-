// Browser-side media helpers (replace the Flutter video_thumbnail / image_picker plugins).

/** Grabs a JPEG frame ~1s into a local video file. */
export function videoThumbnail(file: File): Promise<{ blob: Blob; duration: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, (video.duration || 1) / 2);
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 1080 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve({ blob, duration: Math.round(video.duration || 0) });
          else reject(new Error("Couldn't create a video thumbnail"));
        },
        "image/jpeg",
        0.82,
      );
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This video format isn't supported by your browser"));
    };
  });
}

export function mediaKind(file: File): "image" | "video" | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
}
