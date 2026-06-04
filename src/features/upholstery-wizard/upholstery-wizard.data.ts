import type { UpholsteryCategorySection } from "./upholstery-wizard.types";

/** Fallback for items without a dedicated photo yet */
export const UPHOLSTERY_PLACEHOLDER_IMAGE = "/images/upholstery-placeholder.jpg";

const DRY_CLEANING_IMAGES = {
  sofa2: "/dry-cleaning/2-seated-sofa.png",
  sofa3: "/dry-cleaning/3-seated-sofa.png",
  sofa4: "/dry-cleaning/4-seated-sofa.png",
  mattressSingle: "/dry-cleaning/single-matres.png",
  mattressDouble: "/dry-cleaning/doubled-matres.png",
  mattressKing: "/dry-cleaning/king-size%20bed.png",
  armchair: "/dry-cleaning/armchair.png",
  diningChair: "/dry-cleaning/chair.png",
  officeChair: "/dry-cleaning/office-chair.png",
} as const;

export const UPHOLSTERY_CATEGORIES: UpholsteryCategorySection[] = [
  {
    id: "sofas",
    title: "Sofas",
    icon: "sofa",
    showEcoBadge: true,
    items: [
      {
        id: "sofa_2_seat",
        title: "2-seat sofa",
        description: "Usually up to 180 cm wide",
        priceFrom: 49,
        image: DRY_CLEANING_IMAGES.sofa2,
      },
      {
        id: "sofa_3_seat",
        title: "3-seat sofa",
        description: "Usually 180–250 cm wide",
        priceFrom: 69,
        image: DRY_CLEANING_IMAGES.sofa3,
      },
      {
        id: "sofa_corner",
        title: "Corner sofa",
        description: "L-shaped sofa",
        priceFrom: 99,
        image: DRY_CLEANING_IMAGES.sofa4,
      },
    ],
  },
  {
    id: "mattresses",
    title: "Mattresses",
    icon: "bed",
    items: [
      {
        id: "mattress_single",
        title: "Single mattress",
        description: "90–100 cm wide",
        priceFrom: 39,
        image: DRY_CLEANING_IMAGES.mattressSingle,
      },
      {
        id: "mattress_double",
        title: "Double mattress",
        description: "140–160 cm wide",
        priceFrom: 59,
        image: DRY_CLEANING_IMAGES.mattressDouble,
      },
      {
        id: "mattress_king",
        title: "King size mattress",
        description: "160–200 cm wide",
        priceFrom: 79,
        image: DRY_CLEANING_IMAGES.mattressKing,
      },
    ],
  },
  {
    id: "chairs",
    title: "Chairs & other",
    icon: "armchair",
    items: [
      {
        id: "armchair",
        title: "Armchair",
        description: "Any standard armchair",
        priceFrom: 29,
        image: DRY_CLEANING_IMAGES.armchair,
      },
      {
        id: "dining_chair",
        title: "Dining chair",
        description: "Upholstered seat",
        priceFrom: 15,
        image: DRY_CLEANING_IMAGES.diningChair,
      },
      {
        id: "office_chair",
        title: "Office chair",
        description: "Fabric office chair",
        priceFrom: 25,
        image: DRY_CLEANING_IMAGES.officeChair,
      },
    ],
  },
];
