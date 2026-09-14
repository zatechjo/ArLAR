"use client";

import Image from "next/image";
import { useState, type CSSProperties, type ReactNode } from "react";

import { ExpandIcon, ImageLightbox, type LightboxImage } from "@/components/news/image-lightbox";
import { migratedWixDocumentUrl } from "@/lib/wix-document-url";
import { migratedWixMediaUrl } from "@/lib/wix-media-url";

type RichNode = {
  type?: string;
  nodes?: RichNode[];
  textData?: {
    text?: string;
    decorations?: Array<{
      type?: string;
      colorData?: { foreground?: string };
      linkData?: { link?: { url?: string; target?: string } };
    }>;
  };
  paragraphData?: { textStyle?: { textAlignment?: string } };
  headingData?: { level?: number; textStyle?: { textAlignment?: string } };
  imageData?: {
    image?: {
      src?: { id?: string };
      width?: number;
      height?: number;
    };
  };
  videoData?: {
    video?: { src?: { id?: string }; duration?: number };
    thumbnail?: { src?: { id?: string }; width?: number; height?: number };
    title?: string;
  };
  fileData?: {
    src?: { id?: string; private?: boolean };
    name?: string;
    path?: string;
    size?: number;
  };
  buttonData?: {
    text?: string;
    link?: { url?: string; target?: string };
    styles?: {
      colors?: { text?: string; background?: string; border?: string };
      border?: { width?: number; radius?: number };
    };
  };
  galleryData?: {
    items?: Array<{
      image?: {
        media?: {
          src?: { url?: string };
          width?: number;
          height?: number;
        };
      };
    }>;
    options?: {
      layout?: { numberOfColumns?: number };
      item?: { spacing?: number };
    };
  };
};

type RichDocument = { nodes?: RichNode[] };

function mediaSource(id: string | undefined) {
  return migratedWixMediaUrl(id);
}

function mediaDimensions() {
  return { width: 1600, height: 1000 };
}

function imageFromNode(node: RichNode): LightboxImage | null {
  const id = node.imageData?.image?.src?.id;
  const src = mediaSource(id);
  return src ? { src } : null;
}

function galleryImagesFromNode(node: RichNode): LightboxImage[] {
  if (node.type !== "GALLERY") return [];
  return (node.galleryData?.items || []).flatMap((item) => {
    const id = item.image?.media?.src?.url;
    const src = mediaSource(id);
    return src ? [{ src }] : [];
  });
}

function imagesFromNode(node: RichNode): LightboxImage[] {
  const image = imageFromNode(node);
  if (image) return [image];
  return galleryImagesFromNode(node);
}

function imageCount(node: RichNode) {
  return imagesFromNode(node).length;
}

function textAlignment(value: string | undefined): CSSProperties["textAlign"] {
  if (value === "CENTER") return "center";
  if (value === "RIGHT") return "right";
  if (value === "JUSTIFY") return "justify";
  return "start";
}

function renderInline(nodes: RichNode[] | undefined, keyPrefix: string): ReactNode {
  return (nodes || []).map((node, index) => {
    const textData = node.textData;
    if (!textData) return null;
    const text = textData.text ?? "";
    const decorations = textData.decorations || [];
    const link = decorations.find((decoration) => decoration.type === "LINK")
      ?.linkData?.link;
    const foreground = decorations.find((decoration) => decoration.type === "COLOR")
      ?.colorData?.foreground;
    const style: CSSProperties = {
      color: foreground,
      fontWeight: decorations.some((decoration) => decoration.type === "BOLD")
        ? 700
        : undefined,
      fontStyle: decorations.some((decoration) => decoration.type === "ITALIC")
        ? "italic"
        : undefined,
      textDecoration: decorations.some(
        (decoration) => decoration.type === "UNDERLINE",
      )
        ? "underline"
        : undefined,
    };
    const content = (
      <span key={`${keyPrefix}-text-${index}`} style={style}>
        {text}
      </span>
    );
    if (!link?.url) return content;
    return (
      <a
        key={`${keyPrefix}-link-${index}`}
        href={migratedWixDocumentUrl(link.url)}
        target={link.target === "BLANK" ? "_blank" : undefined}
        rel={link.target === "BLANK" ? "noreferrer" : undefined}
        className="break-words text-jade-700 underline decoration-jade-300 underline-offset-4 transition-colors [overflow-wrap:anywhere] hover:text-crimson-700"
      >
        {content}
      </a>
    );
  });
}

function RichImage({
  node,
  index,
  imageIndex,
  onImageOpen,
}: {
  node: RichNode;
  index: number;
  imageIndex: number;
  onImageOpen: (index: number) => void;
}) {
  const image = node.imageData?.image;
  const id = image?.src?.id;
  const src = mediaSource(id);
  if (!src) return null;
  const dimensions = mediaDimensions();
  return (
    <figure key={`image-${index}`} className="my-6 overflow-hidden rounded-2xl border border-ink-100 bg-[#f8faf9]">
      <button
        type="button"
        onClick={() => onImageOpen(imageIndex)}
        className="group relative block w-full cursor-zoom-in text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-crimson-600"
        aria-label="Expand image"
        title="Expand image"
      >
        <Image
          src={src}
          alt=""
          width={image?.width || dimensions.width}
          height={image?.height || dimensions.height}
          sizes="(max-width: 768px) 100vw, 820px"
          className="mx-auto h-auto max-h-[70rem] w-full object-contain transition duration-300 group-hover:scale-[1.01]"
        />
        <span className="pointer-events-none absolute inset-0 bg-ink-950/0 transition-colors duration-300 group-hover:bg-ink-950/10" />
        <span className="pointer-events-none absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-ink-950/70 text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          <ExpandIcon />
        </span>
      </button>
    </figure>
  );
}

function RichVideo({ node, index }: { node: RichNode; index: number }) {
  const video = node.videoData?.video;
  const src = video?.src?.id;
  if (!src) return null;
  const migratedSrc = mediaSource(src);
  if (!migratedSrc) return null;
  const poster = mediaSource(node.videoData?.thumbnail?.src?.id);
  return (
    <figure key={`video-${index}`} className="my-6 overflow-hidden rounded-2xl border border-ink-200 bg-ink-950">
      <video
        controls
        preload="metadata"
        poster={poster || undefined}
        className="mx-auto max-h-[70rem] w-full"
        src={migratedSrc}
      />
      {node.videoData?.title ? (
        <figcaption className="border-t border-white/10 px-4 py-3 text-[12px] text-white/70">
          {node.videoData.title}
        </figcaption>
      ) : null}
    </figure>
  );
}

function RichFile({ node, index }: { node: RichNode; index: number }) {
  const file = node.fileData;
  const id = file?.path || file?.src?.id;
  if (!id) return null;
  const href = migratedWixDocumentUrl(id);
  if (!href) return null;
  return (
    <div key={`file-${index}`} className="my-6 rounded-2xl border border-ink-100 bg-[#f7faf8] p-5">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 font-display text-[13px] font-semibold text-jade-700 underline decoration-jade-300 underline-offset-4 hover:text-crimson-700"
      >
        {file.name || "Open attached file"}
        <span aria-hidden>↗</span>
      </a>
    </div>
  );
}

function RichButton({ node, index }: { node: RichNode; index: number }) {
  const button = node.buttonData;
  if (!button?.link?.url) return null;
  const colors = button.styles?.colors;
  return (
    <div key={`button-${index}`} className="my-6">
      <a
        href={button.link.url}
        target={button.link.target === "BLANK" ? "_blank" : undefined}
        rel={button.link.target === "BLANK" ? "noreferrer" : undefined}
        className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 font-display text-[12px] font-semibold transition-opacity hover:opacity-85"
        style={{
          color: colors?.text || "#fff",
          backgroundColor: colors?.background || "#c10230",
          border: `${button.styles?.border?.width || 0}px solid ${colors?.border || "transparent"}`,
          borderRadius: button.styles?.border?.radius,
        }}
      >
        {button.text || "Open link"}
      </a>
    </div>
  );
}

function RichGallery({
  node,
  index,
  imageIndex,
  onImageOpen,
}: {
  node: RichNode;
  index: number;
  imageIndex: number;
  onImageOpen: (index: number) => void;
}) {
  const gallery = node.galleryData;
  const items = gallery?.items || [];
  if (!items.length) return null;
  const columns = gallery?.options?.layout?.numberOfColumns || 3;
  const gap = gallery?.options?.item?.spacing || 12;
  return (
    <div
      key={`gallery-${index}`}
      className="my-6 grid"
      style={{ gridTemplateColumns: `repeat(${Math.min(columns, 3)}, minmax(0, 1fr))`, gap }}
    >
      {items.map((item, itemIndex) => {
        const image = item.image?.media;
        const id = image?.src?.url;
        const src = mediaSource(id);
        if (!src) return null;
        return (
          <button
            key={`gallery-${index}-${itemIndex}`}
            type="button"
            onClick={() => onImageOpen(imageIndex + itemIndex)}
            className="group relative block h-full min-h-32 w-full cursor-zoom-in overflow-hidden rounded-xl border border-ink-100 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-crimson-600"
            aria-label="Expand image"
            title="Expand image"
          >
            <Image
              src={src}
              alt=""
              width={image?.width || 1200}
              height={image?.height || 800}
              sizes="(max-width: 640px) 100vw, 33vw"
              className="h-full min-h-32 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
            <span className="pointer-events-none absolute inset-0 bg-ink-950/0 transition-colors duration-300 group-hover:bg-ink-950/10" />
            <span className="pointer-events-none absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-ink-950/70 text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
              <ExpandIcon />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function RichNodeView({
  node,
  index,
  imageIndex,
  onImageOpen,
}: {
  node: RichNode;
  index: number;
  imageIndex: number;
  onImageOpen: (index: number) => void;
}) {
  if (node.type === "IMAGE") {
    return <RichImage node={node} index={index} imageIndex={imageIndex} onImageOpen={onImageOpen} />;
  }
  if (node.type === "VIDEO") return <RichVideo node={node} index={index} />;
  if (node.type === "FILE") return <RichFile node={node} index={index} />;
  if (node.type === "BUTTON") return <RichButton node={node} index={index} />;
  if (node.type === "GALLERY") {
    return <RichGallery node={node} index={index} imageIndex={imageIndex} onImageOpen={onImageOpen} />;
  }

  if (node.type === "HEADING") {
    const level = Math.min(Math.max(node.headingData?.level || 2, 2), 4);
    const className =
      level === 2
        ? "mt-8 text-2xl font-semibold leading-tight text-ink-950"
        : "mt-6 text-xl font-semibold leading-tight text-ink-950";
    const headingProps = {
      className,
      style: { textAlign: textAlignment(node.headingData?.textStyle?.textAlignment) },
    } as const;
    if (level === 3) return <h3 {...headingProps}>{renderInline(node.nodes, `heading-${index}`)}</h3>;
    if (level === 4) return <h4 {...headingProps}>{renderInline(node.nodes, `heading-${index}`)}</h4>;
    return <h2 {...headingProps}>{renderInline(node.nodes, `heading-${index}`)}</h2>;
  }

  if (node.type === "PARAGRAPH") {
    if (!node.nodes?.length) {
      return <div key={`blank-${index}`} aria-hidden className="h-4" />;
    }
    return (
      <p
        key={`paragraph-${index}`}
        className="whitespace-pre-wrap text-[16px] leading-8 text-ink-700 sm:text-[17px]"
        style={{ textAlign: textAlignment(node.paragraphData?.textStyle?.textAlignment) }}
      >
        {renderInline(node.nodes, `paragraph-${index}`)}
      </p>
    );
  }

  return null;
}

export function RichContentRenderer({ content }: { content: unknown }) {
  const document = content as RichDocument | null;
  const nodes = document?.nodes || [];
  const images = nodes.flatMap(imagesFromNode);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const renderedNodes = nodes.reduce<{ elements: ReactNode[]; imageIndex: number }>(
    (accumulator, node, index) => ({
      imageIndex: accumulator.imageIndex + imageCount(node),
      elements: [
        ...accumulator.elements,
        <RichNodeView
          key={`${node.type || "node"}-${index}`}
          node={node}
          index={index}
          imageIndex={accumulator.imageIndex}
          onImageOpen={setLightboxIndex}
        />,
      ],
    }),
    { elements: [], imageIndex: 0 },
  ).elements;

  return (
    <>
      <div className="min-w-0 space-y-3 break-words [overflow-wrap:anywhere]">
        {renderedNodes}
      </div>
      {lightboxIndex !== null ? (
        <ImageLightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndex={setLightboxIndex}
        />
      ) : null}
    </>
  );
}
