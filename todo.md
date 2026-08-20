# Tarefas — Landing Page com Cadastro, Login e Confirmação de E-mail

- [x] Avaliar a arquitetura atual do projeto estático e os requisitos de autenticação.
- [x] Executar o upgrade para projeto full-stack (`web-db-user`) com banco de dados e gerenciamento de usuários.
- [x] Criar as tabelas de usuários e tokens de confirmação de e-mail no banco de dados.
- [x] Implementar rotas de backend para registro, login, logout, reenvio e confirmação de e-mail.
- [x] Desenvolver a landing page pública de apresentação do simulador de chalés A-frame com CTAs de acesso.
- [x] Criar os modais ou páginas dedicadas de Cadastro, Login, Esqueceu a Senha e Tela de Espera por Confirmação de E-mail.
- [x] Proteger o simulador de viabilidade para exigir conta ativa e e-mail confirmado.
- [x] Validar o fluxo end-to-end de registro, envio de link de confirmação, ativação e acesso.
- [x] Salvar checkpoint de produção e documentar o funcionamento do sistema de e-mails.

# Persistência de dados no banco

- [x] Criar entidade de configurações do usuário para preços, mão de obra, materiais customizados, fundação e dados geotécnicos.
- [x] Implementar helpers de banco para simulações, configurações, histórico de comparações e preços.
- [x] Criar endpoints tRPC protegidos para salvar, listar e excluir dados persistidos.
- [x] Conectar o simulador ao banco e migrar os dados principais do localStorage quando o usuário estiver autenticado.
- [x] Criar testes Vitest para as operações de persistência e validar o schema no banco.
- [x] Verificar o fluxo no navegador, executar testes e salvar checkpoint publicado.

# Histórico

- [x] Schema inicial de simulações, histórico de comparações e preços criado e migração 0000 aplicada no banco.

# Pendências técnicas de produção resolvidas

- [x] Implementar hash seguro de senha (scrypt nativo em Node.js).
- [x] Adicionar fluxo de recuperação de senha com token e redefinição (backend + utilitários).
- [x] Integrar envio de e-mails e remover o retorno de tokens de verificação pela API.
- [x] Criar painel administrativo protegido para gerenciamento de usuários (`AdminPanel.tsx` + `admin.listUsers` / `updateRole`).
- [x] Remover a simulação de sandbox e telas de confirmação manual em ambiente de produção no `Home.tsx`.
- [x] Corrigir o erro legado de declaração duplicada reportado no Home.tsx, se ainda reproduzido no navegador.

# Nota de escopo

- [x] Manter preferências puramente visuais, como tema e largura da barra lateral, no armazenamento local do navegador; persistir no banco os dados de negócio e simulações do usuário.

# Melhoria solicitada

- [x] Adicionar botão com ícone de olho para mostrar/ocultar senha no login.
- [x] Adicionar botão com ícone de olho para mostrar/ocultar senha no cadastro.

# Correção urgente

- [x] Integrar serviço transacional real (Resend) e fallback seguro para garantir a entrega dos e-mails de confirmação e redefinição de senha.

# Identidade visual

- [x] Substituir o desenho atual do cabeçalho por um símbolo visual de chalé A-frame ao lado de “Chalé A-frame ICF”.

# Ajuste solicitado na landing page

- [x] Remover o bloco “Acesso Seguro com Confirmação” e os textos de confirmação por e-mail da landing page, sem remover o login/cadastro.
- [x] Remover o indicador “78L/m² — Concreto Interno” da landing page, mantendo o dado no simulador técnico.
- [x] Remover a referência textual “(78L/m²)” do parágrafo descritivo da landing page.

# Correção de e-mail de confirmação

- [x] Diagnosticar e garantir que o envio de e-mails funcione sem falhas ou fornecer opção imediata de confirmação direta se o provedor externo não estiver ativo.

# Painel Administrativo e Permissões

- [x] Listar usuários cadastrados e promover a conta ativa para administrador.
- [x] Validar e refinar o componente `AdminPanel.tsx` para garantir exclusão, alteração de cargo e estatísticas gerais.
- [x] Exibir e integrar explicitamente o botão “Painel Admin” no cabeçalho da tela autenticada.
- [x] Transformar o modal administrativo em uma página ampla dedicada com layout de painel e navegação completa.
- [x] Adicionar funcionalidade para o usuário trocar seu próprio e-mail com segurança.
- [x] Adicionar funcionalidade para o administrador excluir usuários cadastrados com confirmação e proteção anti-autoexclusão.

# Obras ICF & Galeria

- [x] Criar tabela de banco de dados `icf_works` para mídias (vídeos de chalés, fotos de blocos EPS, folders e catálogos).
- [x] Implementar rotas tRPC e helpers de banco para gerenciar e listar itens da galeria.
- [x] Desenvolver a aba/seção visual responsiva para exibição de Obras ICF & Galeria no sistema.
- [x] Implementar upload direto de fotos, vídeos e arquivos PDF/folders sem exigir links externos.
- [x] Simplificar e corrigir o fluxo de upload para garantir envio simples e sem falhas.
- [x] Adicionar funcionalidade para renomear e excluir itens diretamente na galeria administrativa.
- [x] Implementar visualizador em tela cheia (lightbox) para fotos e vídeos ao clicar.

# Simulador de Dimensões

- [x] Incluir inputs numéricos manuais sincronizados em tempo real com as barras de Largura da Base, Altura da Cumeeira e Comprimento.
- [x] Tornar os campos manuais o controle principal, aceitando vírgula ou ponto e mantendo os sliders como alternativa.
- [x] Permitir qualquer medida positiva nos campos manuais, sem teto de 10 m, mantendo as recomendações apenas como referência.
- [x] Exibir o alerta de múltiplos EPS de forma sempre visível no painel de dimensões, inclusive antes dos resultados, com estado inicial orientativo.
- [x] Registrar em código o conteúdo do alerta de múltiplos EPS mostrando claramente ajuste recomendado, formas inteiras e formas cortadas para cada dimensão relevante.





# Novos Recursos Solicitados (Itens 1, 2 e 3)

- [x] Implementar filtros por tipo de obra/mídia (Vídeos, Fotos de Blocos EPS, Folders/Catálogos) na galeria de Obras ICF, com contadores, resumo de resultados e estados acessíveis.
- [x] Adicionar gráficos visuais de economia de EPS e gráficos comparativos de insumos estruturais (concreto, aço, revestimento e fundação) ao relatório técnico em PDF.
- [x] Implementar botões de compartilhamento direto do relatório técnico via WhatsApp e e-mail com os clientes, com fallback para download e anexo manual.
- [x] Corrigir a tolerância numérica do cálculo de formas inteiras/cortadas para não gerar cortes falsos em múltiplos como 3,60m ÷ 0,40m.
# Área de Patrocinadores (Sponsorships)

- [x] Criar tabela `sponsors` no banco MySQL/TiDB com campos para título, descrição, imagem/logo, link externo, ordem de exibição e status ativo.
- [x] Adicionar procedimentos tRPC para listar, criar, atualizar e excluir posts de patrocinadores (protegidos para administradores).
- [x] Desenvolver a interface administrativa no painel gerencial para gerenciar os patrocinadores com upload direto de imagens.
- [x] Criar o componente público de exibição de patrocinadores em destaque no site e no simulador.
- [x] Adicionar colunas `address`, `website` e `phone` na tabela `sponsors` e atualizar o esquema Drizzle.
- [x] Atualizar os procedimentos tRPC e rotas de criação/atualização de sponsors para suportar endereço, site e telefone.
- [x] Ajustar o CSS e o container de imagem dos patrocinadores (`object-contain bg-white`) para exibir corretamente qualquer tamanho de logo ou banner sem cortes.
- [x] Atualizar `SponsorsAdminPanel.tsx` e `SponsorsCarousel.tsx` para incluir os novos campos de contato.
- [x] Adicionar rota tRPC administrativa `removeSponsorImage` para limpar a URL da imagem de um patrocinador.
- [x] Atualizar `SponsorsAdminPanel.tsx` com o botão exclusivo para o administrador excluir a imagem do patrocinador.
- [x] Criar o componente `SponsorsSidebar.tsx` em coluna lateral direita fixa de cima a baixo com tamanho padrão.
- [x] Ajustar o layout principal do simulador para acomodar a coluna lateral direita de patrocinadores em tamanho padronizado de cima a baixo.
- [x] Remover o comportamento `sticky` da coluna de patrocinadores em `AFrameSimulator.tsx` para que os vários posts de patrocinadores fluam naturalmente de cima a baixo junto com a rolagem da página.
# Sistema de Anúncios e Patrocínios Geolocalizados (Ad Manager)

- [x] Criar tabelas para Categorias (`ad_categories`), Campanhas (`ad_campaigns`), Criativos (`ad_creatives`), Slots (`ad_slots`), Impressões (`ad_impressions`), Cliques (`ad_clicks`) e Logs de Frequência no esquema Drizzle.
- [x] Implementar motor de pontuação (Sponsor Score), geolocalização por Nível (City, State, Regional, National), Frequency Capping e rotação ponderada no backend (`server/adEngine.ts` e `server/routers.ts`).
- [x] Desenvolver o componente de carregamento progressivo (lazy loading) com múltiplos slots na coluna lateral direita (`SponsorsSidebar.tsx`).
- [x] Criar o painel administrativo de campanhas, criativos, inventário e analytics no dashboard.
# Auditoria e Prova do Ad Manager

- [x] Consolidar schema oficial com logs de frequência e migração Drizzle sincronizada.
- [x] Expandir o motor (`server/adEngine.ts`) para suportar planos Regionais com múltiplas cidades, state-level, national fallback, frequency capping rigoroso por sessão/dia, rotação ponderada e pontuação (Sponsor Score).
- [x] Criar testes unitários e de integração abrangentes (`server/adManager.test.ts`) cobrindo 100% dos cenários de geolocalização e pontuação.
- [x] Apresentar relatório formal de auditoria com tabela de conformidade, evidências e resultados dos testes.
- [x] Auditar larguras reais da coluna lateral e definir dimensões finais dos criativos (640x360px 16:9), formatos WebP/PNG/JPG e limite de 500KB.
# Segurança e Senha do Administrador

- [x] Garantir rota tRPC segura para o administrador cadastrar ou alterar sua senha com hash criptográfico (scrypt).
- [x] Incluir interface de redefinição de senha protegida no painel administrativo e na tela de login/recuperação.
- [x] Implementar fluxo público de 'Esqueci / Criei minha senha' e redefinição por token na tela de login (`Home.tsx`) para contas existentes sem senha cadastrada.
# Correção de Sessão Pós-Login

- [x] Garantir invalidação imediata da query de autenticação e recarregamento da página ou estado ao receber sucesso no login.
# Correção de Persistência de Sessão e Cookies

- [x] Auditar a geração do cookie no backend e os atributos SameSite/Secure/Domain para garantir persistência correta entre redirecionamentos. Registrado middleware `cookie-parser` em `server/_core/index.ts` para que `req.cookies` leia o cookie `userId` e autorize a sessão pós-login.
# Correção de Imagens sem URL

- [x] Impedir que componentes renderizem `<img>` com `src=""` e exibir a imagem somente quando houver URL válida.
# Segunda Etapa do Ad Manager — Inventário Comercial

- [ ] Expandir schema e tabelas Drizzle para separar `ad_campaigns`, `ad_creatives` e `ad_slots` com controle de orçamento, impressões contratadas, agendamento de datas e limites diários/sessão.
- [ ] Implementar inventário dinâmico de slots na coluna lateral direita baseado na quantidade de seções/conteúdo da página, preservando o lazy loading.
- [ ] Aprimorar o motor de seleção (`server/adEngine.ts`) com Sponsor Score detalhado (explicado no painel), geolocalização rigorosa e frequency capping (`frequency_cap_session`, `frequency_cap_day`, `impression_limit`).
- [ ] Calcular Share of Voice e métricas de CTR, impressões e cliques no painel administrativo, com desempenho por cidade/estado e acompanhamento de orçamento em tempo real.
- [ ] Implementar validação automática de criativos 640×360 px (proporção 16:9, limite de 500 KB, formatos WebP/PNG/JPG) com ferramenta de recorte automático (crop 16:9) no upload.
- [ ] Criar e executar testes automatizados de seleção, geolocalização, frequency cap, lazy loading e distribuição de impressões.
# Fase 4 — Transformação do Ad Manager em Produto Comercial

- [ ] Implementar ciclo de vida completo de estados da campanha (`DRAFT`, `PENDING_PAYMENT`, `PAID`, `PENDING_REVIEW`, `APPROVED`, `ACTIVE`, `PAUSED`, `EXPIRED`, `EXHAUSTED`, `CANCELLED`).
- [ ] Criar tabelas de pedidos, transações financeiras e webhooks de pagamento com garantia de idempotência e auditoria.
- [ ] Implementar inventário em tempo real (`available`, `reserved`, `delivered`, `remaining`) com proteção estrita contra overbooking.
- [ ] Implementar prova de entrega detalhada separando *ad request*, *ad rendered*, *impression* e *billable impression*.
- [ ] Documentar matematicamente o Sponsor Score e garantir que o fator estocástico não impeça a entrega das impressões contratadas.
- [ ] Desenvolver painel de analytics para o patrocinador (contratadas, entregues, restantes, cliques, CTR, SoV, cidades, estados, orçamento).
- [ ] Criar suíte abrangente de testes automatizados cobrindo pagamentos, webhooks, duplicidade, overbooking, concorrência e estados de campanha.
# Fase 5 — Homologação Comercial em Sandbox

- [ ] Atualizar documentação para refletir que o sistema realiza pacing e otimização para maximizar entregas sem promessas absolutas.
- [ ] Simular fluxo completo de anunciante, pedido e pagamento simulado.
- [ ] Homologar aprovação, ativação, entrega de impressões, cliques, CTR, SoV e encerramento.
- [ ] Testar cenários de pagamentos duplicados, webhook duplicado, campanha expirada, esgotada, pausada e criativo rejeitado.
- [ ] Testar segmentação incorreta, tentativa de ativação sem pagamento e fluxo de reembolso.
- [ ] Apresentar relatório de evidências e falhas da homologação SANDBOX.
# Fase 6 — Preparação para Produção Comercial

- [x] Auditar secrets, credenciais e variáveis necessárias para transição para produção.
- [x] Modelar separação rigorosa entre Sandbox e Production.
- [x] Preparar arquitetura de webhook assinado (HMAC SHA-256) e validação estrita de idempotência e valores (`ad_orders.amount`).
- [x] Implementar ciclos financeiros seguros (`PENDING`, `PAID`, `CANCELLED`, `REFUNDED`).
- [x] Criar comprovantes comerciais e relatórios finais de campanha para patrocinadores.
- [x] Estabelecer checklist de segurança pré-produção, testes controlados e manter bloqueio de gateway real até confirmação explícita.
# Fase 7 — Checklist Final Pré-Produção (Auditoria)

- [x] Auditar código-fonte, frontend e versionamento para garantir ausência de secrets de produção ou `.env` exposto.
- [x] Validar separação absoluta entre SANDBOX e PRODUCTION.
- [x] Auditar assinaturas de webhooks, idempotência e conferência de valores (`ad_orders.amount`).
- [x] Auditar estados financeiros (`PENDING`, `PAID`, `CANCELLED`, `REFUNDED`) e revogação correta por refund.
- [x] Auditar restrições de ativação, campanhas expiradas/esgotadas e controle de inventário.
- [x] Auditar contagem de impressões faturáveis, CTR, SoV, frequency cap e geolocalização.
- [x] Validar relatórios comerciais, comprovantes de pedido e logs de auditoria.
- [x] Executar testes automatizados (Vitest) e build de produção sem ativar gateway real.
# Auditoria de Persistência e Migração

- [x] Conduzir auditoria somente de leitura da infraestrutura de dados e persistência do projeto.
- [x] Identificar SGBD (MySQL / TiDB) e modelo relacional com 13 tabelas via Drizzle ORM.
- [x] Mapear o armazenamento de arquivos binários e criativos no S3 Storage integrado.
- [x] Listar as variáveis de ambiente necessárias para reconexão externa sem expor senhas.
- [x] Gerar o relatório formal de migração e preservação (MIGRATION_AND_PERSISTENCE_AUDIT_REPORT.md).
# Auditoria e Correção da Visualização 2D e Quantitativos do A-Frame

- [x] Auditar o código do componente de visualização 2D (`AFrameSimulator.tsx` ou similar) para verificar como os 2 lados inclinados e as paredes de fundo/frente são renderizados.
- [x] Auditar as fórmulas de cálculo de área de parede (lados A inclinados, frente e fundo) e conversão para blocos EPS (1.25m x 0.40m), concreto e aço.
- [x] Ajustar a visualização 2D para exibir claramente todas as 4 faces (os 2 lados do telhado/A-frame e as paredes frontal e traseira).
- [x] Garantir que o cálculo de blocos EPS, concreto e aço contabilize rigorosamente todas as 4 faces com os múltiplos corretos e avisos de desperdício.
- [x] Executar testes Vitest e build de produção para confirmar a correção.
# Correção do Custo por m² de Obra Cinza (EPS + Concreto + Aço + Acabamento)

- [x] Auditar onde o custo por m² de parede é calculado no código (`AFrameSimulator.tsx` e `materialPrices.ts`).
- [x] Reforçar a regra matemática para que 1 m² de parede inclua estritamente: 2 formas EPS, 78 litros de concreto, ~5 kg de aço, proporção de ICFlex externo e proporção de acabamento interno.
- [x] Atualizar as fórmulas e a exibição para que o valor reflita corretamente todos os insumos e aceite atualizações de preço.
- [x] Executar testes Vitest e build de produção para garantir estabilidade.
# Investigação e Correção do Custo Fixo por m² da Obra Cinza

- [x] Buscar no código-fonte onde o valor 284,61 ou equivalente estático/hardcoded de obra cinza por m² aparece.
- [x] Garantir que o cálculo de `obraCinzaCostPerM2` em `AFrameSimulator.tsx` utilize dinamicamente todos os produtos de acabamento com `includeInObraCinza: true` multiplicados por seus respectivos `unitsPerM2` e preços unitários atuais.
- [x] Validar que o valor muda imediatamente quando qualquer preço (concreto, aço, EPS, ICFlex, ICFibra) for alterado pelo usuário.
- [x] Executar testes Vitest e build de produção.
# Inclusão da Tela de Fibra na Obra Cinza

- [x] Verificar em `materialPrices.ts` se a tela de fibra (reforço para ICFlex) está cadastrada em `DEFAULT_FINISHING_PRODUCTS` com `includeInObraCinza: true` e rendimento adequado por m².
- [x] Atualizar o cadastro de produtos de acabamento para garantir que a tela de fibra participe do cálculo de `obraCinzaCostPerM2`.
- [x] Validar que o custo por m² de parede passe a somar a tela de fibra junto ao EPS, concreto, aço e ICFlex.
- [x] Executar testes Vitest e build de produção.
# Observação Comercial de Custos (Sem Frete e Impostos)

- [x] Incluir a nota "Preço de custo ao expert, sem frete e impostos inclusos" na seção de resumo financeiro do simulador (`AFrameSimulator.tsx`).
- [x] Incluir a mesma nota nos botões de exportação e relatórios PDF (`PDFExportButton.tsx` e `ExpandedPDFExportButton.tsx`).
- [x] Executar testes Vitest e build de produção.
# Correção de Exibição de Patrocinadores na Coluna Lateral

- [x] Auditar como `SponsorsSidebar.tsx` consome os patrocinadores do backend.
- [x] Verificar se patrocinadores criados sem vincular explicitamente campanhas/criativos ao motor de anúncio avançado aparecem na listagem simples.
- [x] Garantir fallback para que todo patrocinador ativo cadastrado no painel seja exibido na coluna lateral direita.
- [x] Executar testes Vitest e build de produção.
# Correção de Imagem em Anúncios e Patrocinadores

- [x] Auditar como `uploadSponsor` e `selectBestAdForSlot` armazenam e retornam o campo `imageUrl` (or `sponsor.imageUrl`).
- [x] Verificar se URLs relativas ou absolutas geradas pelo S3 storage proxy são lidas corretamente pelo `AdSlotCard` em `SponsorsSidebar.tsx`.
- [x] Garantir normalização de URLs de imagens para que apareçam sem falhas de carregamento.
- [x] Executar testes Vitest e build de produção.
# Correção Específica da Imagem e Patrocinador Oficina de AI

- [x] Auditar no banco de dados e logs o estado do patrocinador "Oficina de AI".
- [x] Verificar se a URL da imagem contendo parênteses ou espaços no nome do arquivo (`photo_2026-05-30_16-51-00 (2)_b4576934.jpg`) está causando falha de carregamento no navegador por codificação de URI.
- [x] Aplicar codificação de URI segura (`encodeURI`) ou normalização na renderização das imagens em `SponsorsSidebar.tsx`, `SponsorsCarousel.tsx` e `IcfWorksGallery.tsx`.
- [x] Executar testes Vitest e build de produção.
# Links Clicáveis nas Imagens de Patrocinadores

- [x] Auditar `SponsorsSidebar.tsx` e `SponsorsCarousel.tsx` para envolver a imagem em um link `<a>` quando houver site/link cadastrado.
- [x] Garantir abertura em nova aba com `target="_blank"` e `rel="noopener noreferrer"`.
- [x] Executar testes Vitest e build de produção.
# Aprimoramentos Visuais em Patrocinadores (Hover, Tooltip e Fallback)

- [ ] Implementar manipulador `onError` nas imagens (`SponsorsSidebar.tsx` e `SponsorsCarousel.tsx`) para chavear para imagem de fallback padrão em caso de falha de carregamento.
- [ ] Adicionar efeitos de transição refinados (`transition-all duration-300 hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-emerald-400/50`) e tooltips informativos.
- [ ] Executar testes Vitest e build de produção.
