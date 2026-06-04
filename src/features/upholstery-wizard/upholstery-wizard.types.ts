export type UpholsteryItemId =
  | "sofa_2_seat"
  | "sofa_3_seat"
  | "sofa_corner"
  | "mattress_single"
  | "mattress_double"
  | "mattress_king"
  | "armchair"
  | "dining_chair"
  | "office_chair";

export type UpholsteryCategoryIcon = "sofa" | "bed" | "armchair";

export type UpholsteryItem = {
  id: UpholsteryItemId;
  title: string;
  description: string;
  priceFrom: number;
  image?: string;
};

export type UpholsteryCategorySection = {
  id: "sofas" | "mattresses" | "chairs";
  title: string;
  icon: UpholsteryCategoryIcon;
  showEcoBadge?: boolean;
  items: UpholsteryItem[];
};
