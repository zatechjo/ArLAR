export type IraqGalleryImage = {
  src: string;
  /** English source string; translated at render time like other page copy. */
  alt: string;
  /** Tile shape in the scrolling strip. Mix them for a varied rhythm. */
  shape: "wide" | "tall" | "square";
};

/**
 * Photographs shown in the ArLAR27 destination gallery.
 *
 * The `iraq-gallery/` files come from Unsplash, whose licence permits
 * commercial use without attribution; photographers are credited in the
 * comments below as a courtesy. To extend the strip, drop a file into
 * `public/images/iraq-gallery/` and add an entry — the component repeats
 * whatever it is given until the track is wide enough to loop.
 */
export const iraqGallery: IraqGalleryImage[] = [
  // ArLAR27 Iraq destination photographs provided by the ArLAR team.
  {
    src: "/images/iraq-gallery/arlar27-iraq-photos/iraq-photo-01.jpg",
    alt: "Iraq destination photograph 1",
    shape: "square",
  },
  {
    src: "/images/iraq-gallery/arlar27-iraq-photos/iraq-photo-02.jpg",
    alt: "Iraq destination photograph 2",
    shape: "square",
  },
  {
    src: "/images/iraq-gallery/arlar27-iraq-photos/iraq-photo-03.jpg",
    alt: "Iraq destination photograph 3",
    shape: "wide",
  },
  {
    src: "/images/iraq-gallery/arlar27-iraq-photos/iraq-photo-04.jpg",
    alt: "Iraq destination photograph 4",
    shape: "square",
  },
  {
    src: "/images/iraq-gallery/arlar27-iraq-photos/iraq-photo-05.jpg",
    alt: "Iraq destination photograph 5",
    shape: "square",
  },
  {
    src: "/images/iraq-gallery/arlar27-iraq-photos/iraq-photo-06.jpg",
    alt: "Iraq destination photograph 6",
    shape: "square",
  },
  {
    src: "/images/iraq-gallery/arlar27-iraq-photos/iraq-photo-07.jpg",
    alt: "Iraq destination photograph 7",
    shape: "wide",
  },
  {
    src: "/images/iraq-gallery/arlar27-iraq-photos/iraq-photo-08.jpg",
    alt: "Iraq destination photograph 8",
    shape: "tall",
  },
  {
    src: "/images/iraq-gallery/arlar27-iraq-photos/iraq-photo-09.jpg",
    alt: "Iraq destination photograph 9",
    shape: "square",
  },
  {
    src: "/images/iraq-gallery/arlar27-iraq-photos/iraq-photo-10.jpg",
    alt: "Iraq destination photograph 10",
    shape: "tall",
  },
  {
    src: "/images/iraq-gallery/arlar27-iraq-photos/iraq-photo-11.jpg",
    alt: "Iraq destination photograph 11",
    shape: "square",
  },
  {
    src: "/images/iraq-gallery/arlar27-iraq-photos/iraq-photo-12.jpg",
    alt: "Iraq destination photograph 12",
    shape: "square",
  },
  {
    // Unsplash — Saad Salim
    src: "/images/iraq-gallery/erbil-fountain-square.jpg",
    alt: "A city square in Erbil with fountains, a clock tower and a minaret",
    shape: "wide",
  },
  {
    // Unsplash — Tatiana Mokhova
    src: "/images/iraq-gallery/baghdad-alley-tiled-dome.jpg",
    alt: "A tiled turquoise mosque dome seen from a narrow Baghdad alley",
    shape: "tall",
  },
  {
    src: "/images/iraq-congress-cta.png",
    alt: "The Tigris at sunset, with a mosque dome and minaret on the riverbank",
    shape: "wide",
  },
  {
    // Unsplash — Ibrahim Ahmed
    src: "/images/iraq-gallery/baghdad-tower.jpg",
    alt: "Baghdad Tower against a clouded sky",
    shape: "tall",
  },
  {
    // Unsplash — Tatiana Mokhova
    src: "/images/iraq-gallery/baghdad-al-shaheed-monument.jpg",
    alt: "The split turquoise dome of the Al-Shaheed Monument in Baghdad",
    shape: "wide",
  },
  {
    // Unsplash — Tatiana Mokhova
    src: "/images/iraq-gallery/baghdad-abu-nuwas-statue.jpg",
    alt: "A bronze statue of the poet Abu Nuwas, with a clock tower behind",
    shape: "tall",
  },
  {
    src: "/images/national-societies/backgrounds/iraq.jpg",
    alt: "An Iraqi city square with fountains, seen from above",
    shape: "square",
  },
  {
    // Unsplash — Tatiana Mokhova
    src: "/images/iraq-gallery/baghdad-tigris-skyline.jpg",
    alt: "The Baghdad skyline beside the Tigris, with the Central Bank tower",
    shape: "wide",
  },
];
