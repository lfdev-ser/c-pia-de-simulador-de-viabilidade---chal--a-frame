/**
 * Technical Report Generator
 * Gera relatórios técnicos detalhados e cronogramas de construção
 */

export interface MaterialSpecification {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplier?: string;
  leadTime?: number; // dias
}

export interface ConstructionPhase {
  phase: number;
  name: string;
  description: string;
  duration: number; // dias
  startDay: number;
  endDay: number;
  tasks: string[];
  resources: string[];
  dependencies: number[];
}

export interface TechnicalReport {
  projectName: string;
  dimensions: {
    base: number;
    height: number;
    length: number;
    totalArea: number;
    wallArea: number;
    volume: number;
  };
  materials: MaterialSpecification[];
  totalCost: number;
  costPerM2: number;
  constructionTimeline: ConstructionPhase[];
  totalDuration: number;
  qualityStandards: string[];
  safetyRequirements: string[];
  environmentalConsiderations: string[];
}

/**
 * Gera especificações de materiais baseado na simulação
 */
export function generateMaterialSpecifications(
  concreteVolume: number,
  steelWeight: number,
  wallArea: number,
  iceflexQuantity: number,
  icfibraQuantity: number,
  concretePricePerM3: number = 450,
  steelPricePerKg: number = 15,
  epsPricePerForm: number = 75.70,
  iceflexPricePerBucket: number = 150,
  icfibraPricePerRoll: number = 300
): MaterialSpecification[] {
  // Cálculos corretos baseado em m² de parede
  const concretePerM2Wall = 72; // litros por m²
  const steelPerM2Wall = 5; // kg por m²
  const concreteFromWalls = (wallArea * concretePerM2Wall) / 1000; // converter litros para m³
  const steelFromWalls = wallArea * steelPerM2Wall;
  
  const epsBlocks = Math.ceil(wallArea / 1); // 1m² por bloco
  const epsFormsPerBlock = 2; // 2 formas = 1m² de parede
  
  return [
    {
      name: 'Concreto Usinado (Fck 30 MPa)',
      quantity: concreteFromWalls,
      unit: 'm³',
      unitPrice: concretePricePerM3,
      totalPrice: concreteFromWalls * concretePricePerM3,
      supplier: 'Concreteira Local',
      leadTime: 3,
    },
    {
      name: 'Aço de Reforço CA-50',
      quantity: steelFromWalls,
      unit: 'kg',
      unitPrice: steelPricePerKg,
      totalPrice: steelFromWalls * steelPricePerKg,
      supplier: 'Distribuidor de Aço',
      leadTime: 7,
    },
    {
      name: 'Blocos EPS (Formas)',
      quantity: epsBlocks * epsFormsPerBlock,
      unit: 'formas',
      unitPrice: epsPricePerForm,
      totalPrice: epsBlocks * epsFormsPerBlock * epsPricePerForm,
      supplier: 'Fabricante de EPS',
      leadTime: 14,
    },
    {
      name: 'Iceflex (Revestimento)',
      quantity: iceflexQuantity,
      unit: 'baldes',
      unitPrice: iceflexPricePerBucket,
      totalPrice: iceflexQuantity * iceflexPricePerBucket,
      supplier: 'Distribuidor de Acabamento',
      leadTime: 5,
    },
    {
      name: 'ICFibra (Reforço)',
      quantity: icfibraQuantity,
      unit: 'rolos',
      unitPrice: icfibraPricePerRoll,
      totalPrice: icfibraQuantity * icfibraPricePerRoll,
      supplier: 'Distribuidor de Reforço',
      leadTime: 7,
    },
  ];
}

/**
 * Gera cronograma de construção baseado nas dimensões
 */
export function generateConstructionTimeline(
  base: number,
  height: number,
  length: number,
  concreteVolume: number
): ConstructionPhase[] {
  // Estimativas baseadas em dimensões e volume
  const wallArea = (base * height * 2) + (length * 2.1 * 2);
  const daysPerM2 = 0.5; // 0.5 dias por m² de parede
  const wallConstructionDays = Math.ceil(wallArea * daysPerM2);
  
  return [
    {
      phase: 1,
      name: 'Preparação e Mobilização',
      description: 'Limpeza do terreno, marcação, preparação de equipamentos e materiais',
      duration: 5,
      startDay: 1,
      endDay: 5,
      tasks: [
        'Limpeza e nivelamento do terreno',
        'Marcação das dimensões (base: ' + base.toFixed(2) + 'm)',
        'Preparação de canteiro de obras',
        'Verificação de equipamentos',
        'Entrega de materiais',
      ],
      resources: ['Escavadeira', 'Nível laser', 'Operários (4)', 'Mestre de obras'],
      dependencies: [],
    },
    {
      phase: 2,
      name: 'Fundação e Base',
      description: 'Escavação, compactação e preparação da base',
      duration: 8,
      startDay: 6,
      endDay: 13,
      tasks: [
        'Escavação conforme projeto',
        'Compactação do solo',
        'Colocação de brita',
        'Preparação para radier ou baldrame',
      ],
      resources: ['Escavadeira', 'Rolo compactador', 'Operários (6)', 'Mestre de obras'],
      dependencies: [1],
    },
    {
      phase: 3,
      name: 'Estrutura de Concreto',
      description: 'Montagem de formas, colocação de aço e concretagem',
      duration: Math.ceil(concreteVolume * 2), // 2 dias por m³ aprox
      startDay: 14,
      endDay: 14 + Math.ceil(concreteVolume * 2) - 1,
      tasks: [
        'Montagem de formas EPS',
        'Colocação de aço de reforço',
        'Verificação de alinhamento',
        'Concretagem das paredes (Volume: ' + concreteVolume.toFixed(2) + 'm³)',
        'Cura do concreto',
      ],
      resources: ['Forma EPS', 'Aço CA-50', 'Betoneira/Bomba', 'Operários (8)', 'Mestre de obras'],
      dependencies: [2],
    },
    {
      phase: 4,
      name: 'Montagem de Paredes',
      description: 'Construção das paredes com blocos EPS',
      duration: wallConstructionDays,
      startDay: 14 + Math.ceil(concreteVolume * 2),
      endDay: 14 + Math.ceil(concreteVolume * 2) + wallConstructionDays - 1,
      tasks: [
        'Montagem de blocos EPS (Altura: ' + height.toFixed(2) + 'm)',
        'Alinhamento e nivelamento',
        'Preenchimento com concreto',
        'Verificação de prumo e esquadro',
      ],
      resources: ['Blocos EPS', 'Concreto', 'Operários (6)', 'Mestre de obras'],
      dependencies: [3],
    },
    {
      phase: 5,
      name: 'Cobertura e Telhado',
      description: 'Instalação de estrutura de cobertura e telhado',
      duration: 10,
      startDay: 14 + Math.ceil(concreteVolume * 2) + wallConstructionDays,
      endDay: 14 + Math.ceil(concreteVolume * 2) + wallConstructionDays + 9,
      tasks: [
        'Montagem de estrutura de madeira/metálica',
        'Instalação de telhas',
        'Colocação de calhas e rufos',
        'Verificação de vedação',
      ],
      resources: ['Madeira/Metal', 'Telhas', 'Operários (6)', 'Carpinteiro'],
      dependencies: [4],
    },
    {
      phase: 6,
      name: 'Acabamento Interno',
      description: 'Revestimentos, pintura e acabamentos internos',
      duration: 15,
      startDay: 14 + Math.ceil(concreteVolume * 2) + wallConstructionDays + 10,
      endDay: 14 + Math.ceil(concreteVolume * 2) + wallConstructionDays + 24,
      tasks: [
        'Aplicação de Iceflex (revestimento)',
        'Colocação de ICFibra (reforço)',
        'Pintura interna',
        'Instalação de esquadrias',
        'Acabamentos finais',
      ],
      resources: ['Iceflex', 'ICFibra', 'Tinta', 'Operários (4)', 'Pintor'],
      dependencies: [5],
    },
    {
      phase: 7,
      name: 'Acabamento Externo',
      description: 'Revestimentos e acabamentos externos',
      duration: 10,
      startDay: 14 + Math.ceil(concreteVolume * 2) + wallConstructionDays + 10,
      endDay: 14 + Math.ceil(concreteVolume * 2) + wallConstructionDays + 19,
      tasks: [
        'Revestimento externo',
        'Pintura externa',
        'Limpeza geral',
        'Paisagismo',
      ],
      resources: ['Revestimento', 'Tinta', 'Operários (4)', 'Pintor'],
      dependencies: [5],
    },
    {
      phase: 8,
      name: 'Inspeção e Entrega',
      description: 'Inspeção final, testes e entrega da obra',
      duration: 3,
      startDay: 14 + Math.ceil(concreteVolume * 2) + wallConstructionDays + 25,
      endDay: 14 + Math.ceil(concreteVolume * 2) + wallConstructionDays + 27,
      tasks: [
        'Inspeção técnica completa',
        'Testes de funcionalidade',
        'Limpeza final',
        'Entrega da obra',
      ],
      resources: ['Engenheiro', 'Técnico', 'Operários (2)'],
      dependencies: [6, 7],
    },
  ];
}

/**
 * Calcula a duração total do projeto
 */
export function calculateProjectDuration(phases: ConstructionPhase[]): number {
  return Math.max(...phases.map(p => p.endDay));
}

/**
 * Gera padrões de qualidade recomendados
 */
export function getQualityStandards(): string[] {
  return [
    'NBR 6118 - Projeto e execução de obras de concreto armado',
    'NBR 7480 - Aço destinado a armaduras para estruturas de concreto armado',
    'NBR 12142 - Concreto - Determinação da resistência à compressão de corpos-de-prova cilíndricos',
    'NBR 13280 - Argamassa para assentamento e revestimento de paredes e tetos',
    'NBR 14931 - Execução de estruturas de concreto - Procedimento',
    'Inspeção visual de todas as superfícies',
    'Testes de resistência do concreto (28 dias)',
    'Verificação de alinhamento e prumo',
  ];
}

/**
 * Gera requisitos de segurança
 */
export function getSafetyRequirements(): string[] {
  return [
    'Uso obrigatório de EPI (capacete, colete, luvas, botas)',
    'Andaimes e escadas certificados',
    'Proteção contra quedas em altura',
    'Sinalização de segurança em todo o canteiro',
    'Treinamento de segurança para todos os operários',
    'Extintor de incêndio disponível',
    'Kit de primeiros socorros no canteiro',
    'Inspeção diária de equipamentos',
    'Limite de velocidade no canteiro: 10 km/h',
    'Proibido fumar em áreas com materiais inflamáveis',
  ];
}

/**
 * Gera considerações ambientais
 */
export function getEnvironmentalConsiderations(): string[] {
  return [
    'Controle de poeira durante escavação',
    'Gestão adequada de resíduos de construção',
    'Proteção de cursos d\'água próximos',
    'Minimização de ruído (horário: 7h-18h)',
    'Reutilização de materiais quando possível',
    'Reciclagem de blocos EPS e resíduos de concreto',
    'Proteção da vegetação adjacente',
    'Prevenção de erosão do solo',
    'Gestão de água de chuva',
    'Compensação ambiental se necessário',
  ];
}

/**
 * Gera relatório técnico completo
 */
export function generateTechnicalReport(
  projectName: string,
  base: number,
  height: number,
  length: number,
  totalArea: number,
  wallArea: number,
  volume: number,
  concreteVolume: number,
  steelWeight: number,
  iceflexQuantity: number,
  icfibraQuantity: number,
  totalCost: number,
  costPerM2: number
): TechnicalReport {
  const materials = generateMaterialSpecifications(
    concreteVolume,
    steelWeight,
    wallArea,
    iceflexQuantity,
    icfibraQuantity
  );
  
  const timeline = generateConstructionTimeline(base, height, length, concreteVolume);
  const totalDuration = calculateProjectDuration(timeline);
  
  return {
    projectName,
    dimensions: {
      base,
      height,
      length,
      totalArea,
      wallArea,
      volume,
    },
    materials,
    totalCost,
    costPerM2,
    constructionTimeline: timeline,
    totalDuration,
    qualityStandards: getQualityStandards(),
    safetyRequirements: getSafetyRequirements(),
    environmentalConsiderations: getEnvironmentalConsiderations(),
  };
}
