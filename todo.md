# Tarefas — Preços de acabamento e custo por m² de parede

- [x] Revisar o modelo atual de preços, rendimentos e cálculo de custo por m².
- [x] Adicionar os produtos informados pelo usuário à configuração de preços.
- [x] Tornar preço, unidade e rendimento dos acabamentos editáveis.
- [x] Separar acabamento interno e externo no cálculo da obra cinza.
- [x] Recalcular EPS, concreto, aço e acabamento por m² de parede.
- [x] Atualizar a interface para exibir o detalhamento do custo por m².
- [x] Validar persistência dos preços no localStorage e compatibilidade com simulações salvas.
- [x] Compilar, testar e salvar checkpoint.
- [x] Confirmar que, na ausência de rendimento informado, os campos permanecerão configuráveis sem inventar rendimento técnico.

## Dados fornecidos pelo usuário

- ICFlex Externo Verde: 31 unidades, preço unitário R$ 102,00, total informado R$ 3.162,00.
- ICFlex Interno Laranja: 28 unidades, preço unitário R$ 102,00, total informado R$ 2.856,00.
- ICFibra Metro: 300 unidades, preço base R$ 6,20, acréscimo informado 6,50%, preço calculado R$ 6,603.
- ICFLEX Datec: preço R$ 69,00.
- ICFbond Balde: 1 unidade, preço R$ 48,00.
- AquaICF Balde 20kg: 2 unidades, preço base R$ 434,00, acréscimo informado 3,25%, preço calculado R$ 448,105.
- ICFixa ACIII: 9 unidades, preço R$ 24,90.
- ICFixa Ultra 8 em 1: 18 unidades, preço R$ 18,90.
- ICFixa ACIII Branca: preço R$ 35,00.
- ICFixa PL 8 em 1 Branca: preço R$ 28,90.

## Regra técnica confirmada

- Obra cinza por m² deve considerar somente blocos EPS, 72 litros de concreto, aproximadamente 5 kg de aço e acabamento interno + externo, sem mão de obra, fundação ou materiais não selecionados.
- Rendimentos dos produtos de acabamento não foram informados; devem permanecer editáveis no simulador.
