# FASE 4 — Relatório de Transformação do Ad Manager em Produto Comercial

**Autor:** Manus AI  
**Data:** 14 de Agosto de 2026  
**Projeto:** Cópia de Simulador de Viabilidade - Chalé A-frame  

---

## 1. Resumo Executivo

Este relatório consolida a especificação, arquitetura e diretrizes de implementação da **Fase 4** do Ad Manager. O objetivo é estabelecer o ecossistema comercial completo para transacionar publicidade digital com segurança institucional, vedando ativações sem quitação financeira, garantindo rastreabilidade por webhook e mantendo inalterados o layout atual e a experiência do simulador A-frame [1] [2].

---

## 2. Arquitetura de Dados e Tabelas Propostas

Para suportar o ciclo comercial rigoroso, a arquitetura expande as entidades relacionais em MySQL/TiDB:

| Tabela | Função Principal | Campos Essenciais |
| :--- | :--- | :--- |
| **`ad_campaigns`** | Ciclo de vida estendido da campanha | `status` (DRAFT, PENDING_PAYMENT, PAID, PENDING_REVIEW, APPROVED, ACTIVE, PAUSED, EXPIRED, EXHAUSTED, CANCELLED), `budget`, `impressionLimit`, `impressionsCount`. |
| **`ad_orders`** | Gestão de pedidos de patrocínio | `id`, `sponsorId`, `campaignId`, `planType`, `amount`, `status` (PENDING, PAID, CANCELLED, REFUNDED). |
| **`ad_payment_transactions`** | Trilha financeira e auditoria | `id`, `orderId`, `gatewayTxId`, `amount`, `status`, `payloadJson`, `createdAt`. |
| **`ad_webhook_events`** | Idempotência de webhooks de pagamento | `id`, `eventId`, `provider`, `processedAt`, `status`. |
| **`ad_impression_logs`** | Prova de entrega refinada | Separação entre *ad_request*, *ad_rendered*, *valid_impression* e *billable_impression*. |

---

## 3. Regras de Ativação e Ciclo de Estados

O motor de anúncios e as rotas administrativas obedecem às seguintes travas comerciais:
1. **PENDING_PAYMENT:** Estado inicial de checkout. Nenhuma exibição permitida.
2. **PAID:** Confirmação financeira recebida, mas requer aprovação de criativo/conteúdo.
3. **ACTIVE:** Exclusivo para campanhas com **pagamento confirmado + aprovação administrativa + criativo válido (640x360 16:9) + estoque disponível**.
4. **EXHAUSTED / EXPIRED / PAUSED:** Bloqueio imediato de novas impressões e tráfego publicitário.

---

## 4. Prova de Entrega e Faturamento

Para auditoria de anunciantes, o sistema diferencia:
- **Ad Request:** Chamada de carregamento do slot na interface.
- **Ad Rendered:** Criativo efetivamente montado na tela lateral.
- **Valid Impression:** Exibição que passou pelas regras de geolocalização e frequency capping sem duplicação na sessão.
- **Billable Impression:** Impressão válida contabilizada para consumo do `impressionLimit` contratado.

---

## 5. Sponsor Score Matemático e Distribuição Justa

O placar de patrocínio é calculado por:
$$\text{Score} = (\text{GeoScore} \times 0.50) + (\text{Priority} \times 0.30) + (\text{BudgetBonus} \times 0.20)$$

Para evitar que o fator estocástico (usado para rotação) prejudique campanhas menores, implementou-se um teto de variação randômica ($\pm 15\%$), realizando pacing e otimização de entrega para maximizar o cumprimento das impressões contratadas durante a vigência, respeitando segmentação, frequência, inventário e elegibilidade.

---

## 6. Classificação de Prontidão

- **Tabelas e Schema:** Projetados para ambiente de produção.
- **Modo Atual:** **TEST / SANDBOX** (Pronto para homologação sem gateway real conectado).
- **Classificação Final:** **PRONTO PARA TESTES DE HOMOLOGAÇÃO E INTEGRAÇÃO DE PAGAMENTO**.
