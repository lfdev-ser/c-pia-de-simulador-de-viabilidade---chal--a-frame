export type FinishingSide = 'internal' | 'external' | 'support';

export interface FinishingProductPrice {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  referenceQuantity: number;
  unitsPerM2: number;
  side: FinishingSide;
  includeInObraCinza: boolean;
  priceNote?: string;
}

export interface MaterialPrices {
  concretePerM3: number;
  steelPerKg: number;
  epsPerForm: number;
  accessories: number;
  iceflex: number;
  icfibra: number;
  finishingProducts: FinishingProductPrice[];
}

export const DEFAULT_FINISHING_PRODUCTS: FinishingProductPrice[] = [
  {
    id: 'icflex-externo-verde',
    name: 'ICFlex Externo Verde',
    unit: 'un',
    unitPrice: 102,
    referenceQuantity: 31,
    unitsPerM2: 0,
    side: 'external',
    includeInObraCinza: true,
  },
  {
    id: 'icflex-interno-laranja',
    name: 'ICFlex Interno Laranja',
    unit: 'un',
    unitPrice: 102,
    referenceQuantity: 28,
    unitsPerM2: 0,
    side: 'internal',
    includeInObraCinza: true,
  },
  {
    id: 'icfibra-metro',
    name: 'ICFibra Metro',
    unit: 'm',
    unitPrice: 6.603,
    referenceQuantity: 300,
    unitsPerM2: 0,
    side: 'support',
    includeInObraCinza: false,
    priceNote: 'Valor informado já considera acréscimo de 6,50%.',
  },
  {
    id: 'icflex-datec',
    name: 'ICFLEX Datec',
    unit: 'un',
    unitPrice: 69,
    referenceQuantity: 0,
    unitsPerM2: 0,
    side: 'support',
    includeInObraCinza: false,
  },
  {
    id: 'icfbond-balde',
    name: 'ICFbond Balde',
    unit: 'un',
    unitPrice: 48,
    referenceQuantity: 1,
    unitsPerM2: 0,
    side: 'support',
    includeInObraCinza: false,
  },
  {
    id: 'aquaicf-balde-20kg',
    name: 'AquaICF Balde 20 kg',
    unit: 'un',
    unitPrice: 448.105,
    referenceQuantity: 2,
    unitsPerM2: 0,
    side: 'support',
    includeInObraCinza: false,
    priceNote: 'Valor informado já considera acréscimo de 3,25%.',
  },
  {
    id: 'icfixa-aciii',
    name: 'ICFixa ACIII',
    unit: 'un',
    unitPrice: 24.9,
    referenceQuantity: 9,
    unitsPerM2: 0,
    side: 'support',
    includeInObraCinza: false,
  },
  {
    id: 'icfixa-ultra-8-em-1',
    name: 'ICFixa Ultra 8 em 1',
    unit: 'un',
    unitPrice: 18.9,
    referenceQuantity: 18,
    unitsPerM2: 0,
    side: 'support',
    includeInObraCinza: false,
  },
  {
    id: 'icfixa-aciii-branca',
    name: 'ICFixa ACIII (Branca)',
    unit: 'un',
    unitPrice: 35,
    referenceQuantity: 0,
    unitsPerM2: 0,
    side: 'support',
    includeInObraCinza: false,
  },
  {
    id: 'icfixa-pl-8-em-1-branca',
    name: 'ICFixa PL 8 em 1 (Branca)',
    unit: 'un',
    unitPrice: 28.9,
    referenceQuantity: 0,
    unitsPerM2: 0,
    side: 'support',
    includeInObraCinza: false,
  },
];

export const DEFAULT_MATERIAL_PRICES: MaterialPrices = {
  concretePerM3: 500,
  steelPerKg: 6,
  epsPerForm: 75.7,
  accessories: 20,
  iceflex: 0,
  icfibra: 0,
  finishingProducts: DEFAULT_FINISHING_PRODUCTS,
};

export function mergeMaterialPrices(value: Partial<MaterialPrices> | null | undefined): MaterialPrices {
  const parsedProducts = Array.isArray(value?.finishingProducts) ? value.finishingProducts : [];
  const productsById = new Map(parsedProducts.map((product) => [product.id, product]));

  return {
    ...DEFAULT_MATERIAL_PRICES,
    ...value,
    finishingProducts: DEFAULT_FINISHING_PRODUCTS.map((defaultProduct) => ({
      ...defaultProduct,
      ...(productsById.get(defaultProduct.id) ?? {}),
    })),
  };
}

export function calculateFinishingCosts(
  wallArea: number,
  products: FinishingProductPrice[]
): {
  totalCost: number;
  costPerM2: number;
  includedProducts: Array<FinishingProductPrice & { requiredQuantity: number; totalCost: number }>;
} {
  const includedProducts = products
    .filter((product) => product.includeInObraCinza && product.unitsPerM2 > 0 && product.unitPrice >= 0)
    .map((product) => {
      const requiredQuantity = wallArea > 0 ? Math.ceil(wallArea * product.unitsPerM2) : 0;
      return {
        ...product,
        requiredQuantity,
        totalCost: requiredQuantity * product.unitPrice,
      };
    });

  const totalCost = includedProducts.reduce((sum, product) => sum + product.totalCost, 0);
  const costPerM2 = wallArea > 0
    ? products
      .filter((product) => product.includeInObraCinza && product.unitsPerM2 > 0 && product.unitPrice >= 0)
      .reduce((sum, product) => sum + product.unitsPerM2 * product.unitPrice, 0)
    : 0;

  return {
    totalCost,
    costPerM2,
    includedProducts,
  };
}
