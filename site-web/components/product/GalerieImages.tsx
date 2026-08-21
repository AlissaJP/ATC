"use client";

import { useState } from "react";
import Image from "next/image";

export function GalerieImages({ images, alt }: { images: string[]; alt: string }) {
  const [indexActif, setIndexActif] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-fond text-sm text-texte-secondaire">
        Image à venir
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-fond">
        <Image
          src={images[indexActif]}
          alt={alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndexActif(i)}
              aria-label={`Voir l'image ${i + 1}`}
              aria-current={i === indexActif}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                i === indexActif ? "border-primaire" : "border-transparent"
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
