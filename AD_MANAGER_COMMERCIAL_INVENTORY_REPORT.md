# Relatório Técnico: Evolução do Ad Manager para Inventário Comercial

**Autor:** Manus AI  
**Data:** 14 de Agosto de 2026  
**Projeto:** Cópia de Simulador de Viabilidade - Chalé A-frame  

---

## 1. Visão Geral da Segunda Etapa

A evolução do **Ad Manager** transiciona o sistema de patrocínios estáticos de uma estrutura fixa para um **inventário publicitário comercial completo e dinâmico**. O sistema agora gerencia campanhas baseadas em período, volume de impressões, segmentação geográfica rigorosa, limites de frequência (*frequency caps*) e rastreamento em tempo real de orçamento e Share of Voice (SoV).

---

## 2. Arquitetura e Componentes Principais

O ecossistema do Ad Manager foi estruturado em entidades estritamente desacopladas para garantir escalabilidade e integridade comercial:

| Entidade | Descrição Técnica | Regras de Negócio Associadas |
| :--- | :--- | :--- |
| **`ad_campaigns`** | Tabela central de campanhas comerciais | Gerencia orçamento financeiro (`budget`), limite de impressões (`impressionLimit`), contadores de entrega (`impressionsCount`, `clicksCount`), datas de início e término (`startAt`, `endAt`) e prioridade/Sponsor Score. |
| **`ad_creatives`** | Ativos criativos vinculados às campanhas | Armazena títulos, descrições, URLs de destino, CTA e mídias validadas estritamente em **640×360 px (proporção 16:9)** com peso máximo de **500 KB**. |
| **`ad_slots`** | Pontos de exibição dinâmicos na interface | Gerados sob demanda com base no comprimento e conteúdo das páginas, substituindo o limite fixo por uma rolagem contínua na barra lateral direita. |
| **`ad_impressions`** | Log granular de exibições | Registra cada exibição de criativo associada ao slot, sessão do usuário, IP/estado/cidade e timestamp UTC. |
| **`ad_clicks`** | Rastreamento de cliques e conversões | Computa engajamento por campanha para cálculo automático de CTR (*Click-Through Rate*). |
| **`ad_frequency_logs`** | Controle de frequência por sessão | Impede a saturação do usuário aplicando limites por sessão (`frequency_cap_session`) e diários (`frequency_cap_day`). |

---

## 3. Motor de Seleção e Sponsor Score

O algoritmo de seleção de anúncios (`server/adEngine.ts`) pondera múltiplos critérios comerciais para determinar qual criativo será exibido em cada slot dinâmico:

1. **Segmentação Geográfica (Geo-Targeting):**  
   - **Nacional:** Exibido em qualquer localidade.  
   - **Estado:** Restrito ao estado federativo do usuário.  
   - **Regional / Cidade:** Segmentação precisa por município ou grupo de cidades.
2. **Filtros de Vigência e Orçamento:**  
   - Campanhas fora do período de vigência (`startAt` / `endAt`) ou que atingiram o teto de impressões (`impressionLimit`) ou orçamento são automaticamente inativadas.
3. **Sponsor Score Dinâmico:**  
   - O placar de patrocínio combina a prioridade comercial definida pelo administrador, o orçamento alocado e a taxa histórica de cliques (CTR), garantindo que campanhas de alto desempenho ganhem relevância sem monopolizar o inventário.
4. **Frequency Capping:**  
   - O motor consulta os logs de frequência para bloquear anúncios que já atingiram o limite diário ou por sessão do visitante.

---

## 4. Analytics, Share of Voice e Painel Administrativo

O painel administrativo foi expandido para fornecer aos gestores visibilidade total sobre a operação comercial:

- **Share of Voice (SoV):** Percentual de impressões entregues de uma campanha em relação ao total do inventário no período.
- **CTR (*Click-Through Rate*):** Relação percentual entre cliques e impressões (`clicksCount / impressionsCount * 100`).
- **Desempenho Geográfico:** Agrupamento de impressões por cidade e estado para auditoria de campanhas regionais.
- **Acompanhamento de Orçamento:** Monitoramento em tempo real do consumo do orçamento contratado e projeção de esgotamento.

---

## 5. Validação Automática e Crop 16:9

Para assegurar a padronização visual da barra lateral direita (largura útil de 296 px em desktop e proporção 16:9 em todos os dispositivos):
- **Validação de Tamanho:** O sistema rejeita uploads superiores a **500 KB**.
- **Validação de Proporção:** Exige resolução exata ou proporcional a **640×360 px** em formatos **WebP, PNG ou JPG**.
- **Crop Automático:** Ferramenta integrada redimensiona e enquadra imagens automaticamente para eliminar distorções.

---

## 6. Resultados dos Testes e Conclusão

A suíte de testes automatizados (**Vitest**) executou com **100% de aprovação** (16/16 testes passando), validando a lógica de seleção, geolocalização, frequency capping, segurança de senhas com `scrypt` e integridade das tabelas relacionais. O build de produção foi concluído sem erros.

O Ad Manager encontra-se operacional, comercialmente robusto e totalmente integrado ao ecossistema SaaS do simulador de chalés A-frame.
