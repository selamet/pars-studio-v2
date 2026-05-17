'use client';

import Image from 'next/image';
import * as DialogPrimitive from '@radix-ui/react-dialog';

type Props = {
  name: string;
  gear: string;
  image: string;
  closeLabel: string;
};

/** Lightbox-enabled room card. Click image → full viewport view. */
export default function RoomCard({ name, gear, image, closeLabel }: Props) {
  return (
    <DialogPrimitive.Root>
      <figure className="reveal-text group bg-bg">
        <DialogPrimitive.Trigger asChild>
          <button
            type="button"
            className="relative block aspect-[4/3] w-full overflow-hidden bg-bg-soft outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={`${name} — open photo`}
          >
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover opacity-80 grayscale transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-100 group-hover:grayscale-0"
            />
            {/* Subtle "expand" indicator on hover */}
            <span
              aria-hidden
              className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center border border-fg/40 bg-bg/40 text-fg opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <path d="M1 5V1h4M13 5V1H9M1 9v4h4M13 9v4H9" />
              </svg>
            </span>
          </button>
        </DialogPrimitive.Trigger>

        <figcaption className="flex flex-col gap-3 py-7 pl-4 pr-4 sm:pl-6 sm:pr-6">
          <h3 className="font-serif text-2xl font-light text-fg">{name}</h3>
          <p className="meta normal-case tracking-[0.12em] text-fg-dim">
            {gear}
          </p>
        </figcaption>
      </figure>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-bg/95 backdrop-blur-md data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-[91] flex flex-col items-center justify-center gap-6 p-4 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 md:p-12"
          aria-describedby={undefined}
        >
          <div className="relative h-[70vh] w-full max-w-6xl">
            <Image
              src={image}
              alt={name}
              fill
              sizes="100vw"
              priority
              className="object-contain"
            />
          </div>

          <div className="flex w-full max-w-6xl flex-col gap-2 text-center md:flex-row md:items-baseline md:justify-between md:text-left">
            <DialogPrimitive.Title className="font-serif text-2xl font-light text-fg md:text-3xl">
              {name}
            </DialogPrimitive.Title>
            <p className="meta normal-case tracking-[0.12em] text-fg-dim">
              {gear}
            </p>
          </div>

          <DialogPrimitive.Close
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center border border-rule text-fg transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:right-8 md:top-8"
            aria-label={closeLabel}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
