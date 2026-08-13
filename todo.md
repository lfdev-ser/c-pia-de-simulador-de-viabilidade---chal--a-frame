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

