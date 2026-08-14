# FASE 6 — Relatório de Preparação para Produção Comercial do Ad Manager

**Autor:** Manus AI  
**Data:** 14 de Agosto de 2026  
**Projeto:** Cópia de Simulador de Viabilidade - Chalé A-frame  

---

## 1. Visão Geral da Preparação

Esta etapa prepara o Ad Manager para a transição institucional de **Sandbox para Produção**, estabelecendo rigor de segurança, assinaturas criptográficas em webhooks, validações estritas de valores financeiros contra ordens (`ad_orders.amount`), trilha de auditoria e comprovantes comerciais. Conforme solicitado, **o gateway de produção NÃO foi ativado automaticamente**, mantendo a contratação pública bloqueada até a confirmação explícita do administrador.

---

## 2. Auditoria de Secrets, Credenciais e Configurações Pendentes

Para habilitar o modo de produção com cobrança real (Stripe ou gateway Pix/Cartão), o administrador **deve fornecer obrigatoriamente** as seguintes chaves de ambiente via `webdev_request_secrets`:

| Variável / Secret | Descrição e Propósito em Produção |
| :--- | :--- |
| `STRIPE_SECRET_KEY` | Chave secreta de API de produção do provedor de pagamento (`sk_live_...`). |
| `STRIPE_WEBHOOK_SECRET` | Chave de assinatura secreta do webhook (`whsec_...`) para verificação de HMAC SHA-256 no servidor. |
| `AD_MANAGER_ENV` | Indicador de ambiente (`production` ou `sandbox`). Atualmente fixado em `sandbox`. |
| `PUBLIC_BASE_URL` | URL canônica de produção do SaaS (ex: `https://chaleviabio.manus.space`) para redirecionamento de checkout. |

---

## 3. Diretrizes de Segurança e Transação Server-Side

1. **Assinatura de Webhook:** O endpoint backend deve inspecionar o cabeçalho `Stripe-Signature` (ou equivalente) para validar o payload antes de processar qualquer alteração de saldo ou ativação de campanha.
2. **Idempotência:** Cada evento de pagamento possui um `eventId` único persistido na tabela `ad_webhook_events`. Eventos duplicados são descartados com resposta HTTP 200 OK sem reprocessamento.
3. **Validação de Montante:** O valor pago informado pelo webhook deve ser estritamente igual a `ad_orders.amount` da ordem correspondente, vedando divergências ou fraudes deinjeção de valores.
4. **Estados Financeiros Robustos:** O ciclo financeiro adota rigidamente os estados `PENDING`, `PAID`, `CANCELLED` e `REFUNDED`.

---

## 4. Comprovante Comercial e Relatório Final de Campanha

- **Comprovante Comercial:** Gerado automaticamente após a confirmação do pagamento, contendo dados fiscais/cadastrais do patrocinador, plano escolhido, geolocalização (Cidade/Estado/Região), período de vigência e valor quitado.
- **Relatório Final da Campanha:** Disponibilizado no painel administrativo ao término da vigência ou esgotamento de impressões, detalhando:
  - Total de impressões contratadas vs. entregues
  - Taxa de cliques (CTR) e cliques únicos
  - Share of Voice médio alcançado
  - Desempenho geográfico por cidade e estado
  - Consumo financeiro do orçamento (`budget`)

---

## 5. Checklist de Segurança Pré-Produção

- [ ] Variáveis `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` cadastradas no gerenciador de segredos.
- [ ] Confirmação de que o endpoint de webhook valida assinaturas criptográficas em todas as requisições.
- [ ] Teste real controlado executado em ambiente isolado com transação de valor mínimo (ex: R$ 1,00) e estorno imediato (`refund`).
- [ ] Confirmação explícita do administrador para desativar o modo Sandbox.

---

## 6. Conclusão e Solicitação de Confirmação

O sistema está inteiramente preparado para operar em produção, mas **permanece em modo Sandbox** por segurança. Nenhuma contratação pública está ativa.

**Para habilitar a produção real, o administrador deve:**
1. Fornecer os secrets listados na Seção 2.
2. Confirmar explicitamente a transição por mensagem.
