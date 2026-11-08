"use client"; // the preview follows what the user types

import { useState } from "react";
import Image from "next/image";

function isImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

// Keeps the link typed in an image box, and whether that image failed to load.
// The form wires `onChange` to the input and passes the result to <ImagePreview>.
export function useImagePreview(initialUrl: string) {
  const [url, setUrl] = useState(initialUrl);
  const [failed, setFailed] = useState(false);

  return {
    url,
    failed,
    visible: isImageUrl(url) && !failed,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setUrl(event.target.value.trim());
      setFailed(false);
    },
    onError: () => setFailed(true),
  };
}

type ImagePreviewProps = {
  preview: ReturnType<typeof useImagePreview>;
  alt: string;
  emptyText: string;
};

export function ImagePreview({ preview, alt, emptyText }: ImagePreviewProps) {
  return (
    <div>
      <p className="text-sm font-medium text-zinc-300">Preview</p>
      <div className="relative mt-1.5 aspect-2/3 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
        {preview.visible ? (
          <Image
            key={preview.url}
            src={preview.url}
            alt={alt}
            fill
            unoptimized
            className="object-cover"
            onError={preview.onError}
          />
        ) : (
          <p className="grid h-full place-items-center p-6 text-center text-sm text-zinc-500">
            {preview.failed ? "Couldn't load an image from this link" : emptyText}
          </p>
        )}
      </div>
    </div>
  );
}
