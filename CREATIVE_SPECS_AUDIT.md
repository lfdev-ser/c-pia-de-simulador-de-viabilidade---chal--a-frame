# Especificações Técnicas e Dimensões Recomendadas para Criativos Publicitários

**Projeto:** Cópia de Simulador de Viabilidade - Chalé A-frame (SaaS ICF/EPS)  
**Componente Alvo:** `SponsorsSidebar` / `AdSlotCard` (Coluna Lateral Direita)  
**Data:** Agosto de 2026

---

## 1. Análise de Largura Real dos Cards (`AdSlot`)

Com base na estrutura atual da coluna lateral (`w-full xl:w-80`, equivalente a `320px` no breakpoint `xl+` do Tailwind) e considerando as margens internas dos cards (`p-3` ou `12px` de cada lado), obtivemos as seguintes larguras úteis de renderização:

| Dispositivo / Breakpoint | Largura Total da Coluna | Margem Interna (Padding) | Largura Útil do Criativo (Renderizada) | Proporção Recomendada |
| :--- | :--- | :--- | :--- | :--- |
| **Desktop (`xl+`, ≥ 1280px)** | 320 px | 24 px (12px + 12px) | **296 px** | 16:9 ou 4:3 |
| **Tablet (`md` a `lg`, 768px – 1279px)** | 704 px a 768 px (Grid fluido) | 24 px | **320 px a 350 px** | 16:9 ou 4:3 |
| **Mobile (`< 768px`)** | 100% da tela (~360px a 420px) | 24 px | **336 px a 396 px** | 16:9 ou 4:3 |

---

## 2. Dimensões Finais Recomendadas para Upload de Criativos

Para garantir que as imagens ocupem **100% da largura útil do card** sem qualquer distorção, corte indesejado ou perda de qualidade em telas Retina/HiDPI (2x), recomendamos o envio de criativos nas seguintes dimensões nativas:

| Dispositivo / Formato Alvo | Resolução Nativa Recomendada (2x / Retina) | Resolução de Exibição Base | Proporção |
| :--- | :--- | :--- | :--- |
| **Padrão Oficial (Recomendado)** | **640 × 360 px** | 320 × 180 px | **16:9 (Widescreen)** |
| **Alternativo Compacto** | **640 × 480 px** | 320 × 240 px | **4:3 (Standard)** |

---

## 3. Diretrizes de Arquivo e Performance

* **Largura e Ocupação:** 100% da largura útil (`w-full`), aplicando a classe CSS `object-contain` (ou `object-cover` quando o criativo for projetado em formato preenchido), mantendo o container com fundo branco (`bg-white`) para evitar letterboxing visual.
* **Formatos Aceitos:**
  * **WebP:** Altamente recomendado (menor peso, excelente compressão com alfa).
  * **PNG:** Ideal para logotipos com transparência pura.
  * **JPG / JPEG:** Ideal para fotografias de obras e blocos EPS.
* **Limite Máximo de Peso por Arquivo:** **500 KB** por criativo, garantindo carregamento instantâneo e pontuação máxima em Core Web Vitals na coluna lateral.
