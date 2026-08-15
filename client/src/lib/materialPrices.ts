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
  pricingModelVersion: number;
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
    // Referência confirmada: 1 embalagem cobre 4 m² no lado externo, ou 0,25 embalagem/m².
    unitsPerM2: 0.25,
    side: 'external',
    includeInObraCinza: true,
    priceNote: '1 embalagem cobre 4 m² de parede externa.',
  },
  {
    id: 'icflex-interno-laranja',
    name: 'ICFlex Interno Laranja',
    unit: 'un',
    unitPrice: 102,
    referenceQuantity: 28,
    // Referência confirmada: 1 embalagem cobre 4 m² no lado interno, ou 0,25 embalagem/m².
    unitsPerM2: 0.25,
    side: 'internal',
    includeInObraCinza: true,
    priceNote: '1 embalagem cobre 4 m² de parede interna.',
  },
  {
    id: 'icfibra-metro',
    name: 'ICFibra Metro',
    unit: 'm',
    unitPrice: 6.603,
    referenceQuantity: 300,
    // Referência aproximada: 1 metro por m² em cada lado, total de 2 m/m².
    unitsPerM2: 2,
    side: 'support',
    includeInObraCinza: true,
    priceNote: 'Valor informado já considera acréscimo de 6,50%. Referência: 1 m/m² por lado, 2 m/m² no total.',
  },
  {
    id: 'tela-fibra-reforco',
    name: 'Tela de Fibra para ICFlex',
    unit: 'm²',
    unitPrice: 4.50,
    referenceQuantity: 0,
    // 1 m² de tela por m² de parede (aplicação em ambas as faces ou tela estrutural)
    unitsPerM2: 1,
    side: 'support',
    includeInObraCinza: true,
    priceNote: 'Tela de reforço estrutural para aplicação com ICFlex interno e externo.',
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
  pricingModelVersion: 3,
  concretePerM3: 500,
  steelPerKg: 6,
  epsPerForm: 75.7,
  accessories: 20,
  iceflex: 0,
  icfibra: 0,
  finishingProducts: DEFAULT_FINISHING_PRODUCTS,
};

export function mergeMaterialPrices(value: Partial<MaterialPrices> | null | undefined): MaterialPrices {
  const hasCurrentPricingModel = value?.pricingModelVersion === DEFAULT_MATERIAL_PRICES.pricingModelVersion;
  const hasPreviousPricingModel = value?.pricingModelVersion === 2;
  const parsedProducts = (hasCurrentPricingModel || hasPreviousPricingModel) && Array.isArray(value?.finishingProducts)
    ? value.finishingProducts
    : [];
  const productsById = new Map(parsedProducts.map((product) => [product.id, product]));

  return {
    ...DEFAULT_MATERIAL_PRICES,
    ...value,
    pricingModelVersion: DEFAULT_MATERIAL_PRICES.pricingModelVersion,
    finishingProducts: DEFAULT_FINISHING_PRODUCTS.map((defaultProduct) => {
      const savedProduct = productsById.get(defaultProduct.id);
      const migratedYield = hasPreviousPricingModel && (
        defaultProduct.id === 'icflex-externo-verde' || defaultProduct.id === 'icflex-interno-laranja'
      )
        ? { unitsPerM2: defaultProduct.unitsPerM2 }
        : {};

      return {
        ...defaultProduct,
        ...(savedProduct ?? {}),
        ...migratedYield,
      };
    }),
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
