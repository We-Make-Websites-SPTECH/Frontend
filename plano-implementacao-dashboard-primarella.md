# Plano de implementação — Dashboard de Indicadores da Primarella

> **Versão revisada em 02/11/2026**, após auditoria do código atual.
> Substitui o plano original, que foi escrito antes de existir a entidade de movimentação e o service de estoque.

## Status da implementação (02/11/2026)

Implementado no backend:

- DTOs do contrato (`DashboardResponseDto` + 6 DTOs) e `MovimentacaoPeriodoDto`.
- `MovimentacaoEstoqueRepository.buscarNoPeriodo` (JPQL + constructor expression).
- `InsumoRepository.countByAtivoTrue/False`.
- `DashboardService` com os 4 KPIs, janela de 30 dias, cancelamento líquido, separação por unidade, top 10 e percentuais.
- `DashboardController` corrigido (injeção, imports, CORS).
- Testes: `DashboardServiceTests` e `MovimentacaoEstoqueRepositoryTests` (H2), ambos passando.

Pendente (depende de ambiente/front):

- Subir o banco com o `schema.sql` e popular dados de teste.
- Validar `GET /dashboard/indicadores` no Postman/Bruno com dados reais.
- Integrar com o frontend.
- Módulo de vendas, para o KPI 1 deixar de retornar vazio.

---

## 0. Decisões fechadas

| Tema | Decisão |
|---|---|
| Contrato da API | O do plano original (4 KPIs: insumos mais consumidos, entradas x saídas, perdas por quebras, insumos ativos x inativos) |
| Período | Últimos 30 dias (hoje incluso), calculado pelo backend |
| Perdas | Apenas movimentações `SAIDA` + `QUEBRA`; a perda por `percentual_perda` na entrada **não** entra neste KPI (decisão do time) |
| Endpoint | `GET /dashboard/indicadores` |
| Ranking | Ordenado por quantidade, **separado por unidade de medida**; top 10 por unidade |
| Insumos no KPI 1 | Somente ativos (`insumo.ativo = true`) |
| Fuso horário | `America/Sao_Paulo` para definir "hoje" e a janela de 30 dias |
| Agregação | Feita em Java a partir de uma única consulta JPQL no período (ver §6) |

---

## 1. Estado atual do backend (auditoria)

| Item | Situação | Ação neste plano |
|---|---|---|
| `enums/TipoMovimentacaoEnum` | ✅ Existe (`ENTRADA`, `SAIDA`) | Não criar |
| `enums/MotivoMovimentacaoEnum` | ✅ Existe (`VENDA`, `COMPRA`, `QUEBRA`, `AJUSTE`, `OUTRO`, `CANCELAMENTO_VENDA`) | Não criar |
| `entity/MovimentacaoEstoque` | ✅ Existe e mapeia `insumo`, `usuario`, `tipo`, `motivo`, `quantidade`, `observacao`, `data_hora` | Usar como está |
| `entity/MovimentacaoEstoque` — `item_venda_insumo_id` | ❌ Não mapeado | Fora do escopo do dashboard; necessário só quando o módulo de vendas existir (§3) |
| `entity/Insumo` | ✅ Tem `ativo` e `unidadeMedida` | Usar como está |
| `repository/MovimentacaoEstoqueRepository` | ✅ Existe, vazio | Adicionar 1 consulta |
| `repository/InsumoRepository` | ✅ Existe, sem counts | Adicionar `countByAtivoTrue/False` |
| `service/EstoqueService` | ✅ Registra `ENTRADA` (COMPRA/OUTRO), `SAIDA` (QUEBRA/OUTRO) e `AJUSTE` | Nada |
| Fluxo de venda (`Venda`, `ItemVenda`, `ItemVendaInsumo`) | ❌ **Nunca existiu** em nenhuma branch | Pré-requisito do KPI 1, fora deste plano (§3) |
| `controller/DashboardController` | ⚠️ Existe, **não compila** (sem imports, sem construtor, sem CORS) | Corrigir |
| `service/DashboardService` | ⚠️ Existe, **não compila** (referencia classes inexistentes, sem construtor) | Reescrever |
| `dto/dashboard/DashboardResponseDto` | ⚠️ Existe com contrato diferente do plano (`insumos`/`produtos`/`consumo`) | Reescrever |
| DTOs dos 4 KPIs | ❌ Não existem | Criar |
| Projeções (`dto/dashboard/projection`) | ❌ Não existem | **Não serão necessárias** |
| `DashboardRepository` | ❌ Não existe | **Não será criado** (reaproveitar `MovimentacaoEstoqueRepository`) |
| Testes do dashboard | ❌ Não existem | Criar teste de service |
| `insert mock.sql` (fora do repo) | ⚠️ Desatualizado (não preenche `percentual_perda`, obrigatório) | Corrigir antes de popular dados |

> **Atenção:** os 3 arquivos de dashboard estão como `AM` no Git (não commitados) e quebram o build. Serão substituídos pelos arquivos finais deste plano.

---

## 2. O que muda em relação ao plano original

1. **Não criar** enums nem a entidade `MovimentacaoEstoque` — já existem e já são usados pelo `EstoqueService`.
2. **Não criar** `DashboardRepository` nem as 3 projeções. Uma única consulta no `MovimentacaoEstoqueRepository` + agrupamento no service resolve, evita SQL nativo MySQL e permite testar em H2.
3. **Não criar** classes `InsumosIndicadoresDto`, `ProdutosIndicadoresDto`, `ConsumoIndicadoresDto` (eram do WIP e não fazem parte do contrato).
4. **Adicionar** tratamento de cancelamento: consumo líquido = `VENDA` − `CANCELAMENTO_VENDA`.
5. **Definir** limite do ranking (top 10 por unidade) e separação por unidade de medida.
6. **Corrigir** o `@PrePersist` de `MovimentacaoEstoque` (opcional, só quando o módulo de vendas existir): hoje ele sempre sobrescreve `dataHora`.
7. **Registrar** que o KPI 1 depende do módulo de vendas, que não existe.

---

## 3. Dependência crítica: movimentações de venda

O KPI "insumos mais consumidos" filtra `tipo = SAIDA` e `motivo = VENDA`. Hoje **nenhuma movimentação é gravada com esse motivo**, porque:

- Não existem entidades `Venda`, `ItemVenda` e `ItemVendaInsumo`.
- O `EstoqueService` bloqueia explicitamente `VENDA` e `CANCELAMENTO_VENDA` em `registrarSaida`, porque esses motivos exigem vínculo com uma venda.
- O schema exige `item_venda_insumo_id IS NOT NULL` quando o motivo é `VENDA`/`CANCELAMENTO_VENDA` (`chk_mov_venda_consistente`).

### Consequência

Até o módulo de vendas existir, `insumosMaisConsumidos` virá **vazio**. Isso é o comportamento correto e honesto para o contrato aprovado — não é bug.

### Alternativa temporária (não recomendada)

Trocar o filtro para todas as `SAIDA`. O gráfico passaria a mostrar "maiores saídas", incluindo quebras e ajustes, com outro significado. Se for adotada, **renomear o KPI na interface** para não induzir a leitura errada, e voltar ao filtro `VENDA` quando as vendas existirem.

### Para o KPI funcionar de verdade (fora deste plano)

1. Criar `Venda`, `ItemVenda`, `ItemVendaInsumo` (mapeando as tabelas do `schema.sql`).
2. Ao registrar uma venda: copiar `produto_insumo` para `item_venda_insumo` e gravar uma `MovimentacaoEstoque` `SAIDA`/`VENDA` por insumo.
3. Ao cancelar: gravar `ENTRADA`/`CANCELAMENTO_VENDA` por insumo.
4. Mapear `item_venda_insumo_id` em `MovimentacaoEstoque` (obrigatório pela constraint).
5. Ajustar `@PrePersist` para não sobrescrever `dataHora` quando ela já vier preenchida.

---

## 4. Arquitetura final

```text
school.sptech.wmw_projeto_pi
├── controller
│   └── DashboardController.java          (corrigir)
├── service
│   └── DashboardService.java             (reescrever)
├── repository
│   ├── MovimentacaoEstoqueRepository.java (adicionar 1 @Query)
│   └── InsumoRepository.java              (adicionar 2 counts)
└── dto
    └── dashboard
        ├── DashboardResponseDto.java
        ├── InsumosMaisConsumidosDto.java
        ├── MovimentacaoSemanalDto.java
        ├── ResumoMovimentacaoDto.java
        ├── EntradasSaidasDto.java
        ├── PerdasQuebrasDto.java
        ├── InsumosStatusDto.java
        └── MovimentacaoPeriodoDto.java    (resultado interno da consulta)
```

Fluxo:

```text
GET /dashboard/indicadores
  -> DashboardController
  -> DashboardService
       -> MovimentacaoEstoqueRepository.buscarNoPeriodo(inicio, fim)   (1 query)
       -> InsumoRepository.countByAtivoTrue/False()                    (2 counts)
       -> agrupa/soma em Java
  -> DashboardResponseDto
```

---

## 5. Entity e schema

**Nada muda nesta entrega.** A entidade `MovimentacaoEstoque` já cobre tudo que a leitura precisa.

Pontos apenas documentados para a próxima etapa (vendas):

- Falta o vínculo `itemVendaInsumo` (`@ManyToOne` / `@JoinColumn(name = "item_venda_insumo_id")`).
- `@PrePersist` sobrescreve `dataHora` sempre; trocar por `if (this.dataHora == null)`.
- A constraint `uq_mov_item_venda_insumo_tipo` limita 1 `VENDA` e 1 `CANCELAMENTO_VENDA` por item.

---

## 6. Consulta

### 6.1 `MovimentacaoEstoqueRepository`

```java
@Query("""
    SELECT new school.sptech.wmw_projeto_pi.dto.dashboard.MovimentacaoPeriodoDto(
        m.insumo.id,
        m.insumo.nome,
        m.insumo.unidadeMedida,
        m.insumo.ativo,
        m.tipo,
        m.motivo,
        m.quantidade,
        m.dataHora
    )
    FROM MovimentacaoEstoque m
    WHERE m.dataHora >= :inicio AND m.dataHora < :fim
    """)
List<MovimentacaoPeriodoDto> buscarNoPeriodo(
        @Param("inicio") LocalDateTime inicio,
        @Param("fim") LocalDateTime fim);
```

Por que JPQL e não SQL nativo:

- Não usa `WEEK()`/`DATE_FORMAT()` (MySQL), então funciona também em H2 nos testes.
- Evita N+1 (não carrega `Usuario` nem a entidade inteira).
- Uma consulta só; o agrupamento por semana e unidade é feito em Java.
- Volume esperado (30 dias de uma pizzaria) é irrelevante para performance.

> Se o time preferir agregar no banco, a alternativa é SQL nativo + projeções. Aí os testes precisam de MySQL real, porque `WEEK`/`DATE_FORMAT` não rodam no H2 sem modo de compatibilidade.

### 6.2 `InsumoRepository`

```java
Long countByAtivoTrue();
Long countByAtivoFalse();
```

---

## 7. DTOs finais

Records (Java 21) — o JSON gerado é idêntico ao do plano original. Usar os enums do projeto em vez de `String` para `tipo` e `unidadeMedida`; o Jackson serializa como `"ENTRADA"` / `"GRAMA"`.

```java
public record InsumosMaisConsumidosDto(
    Integer insumoId,
    String nome,
    UnidadeMedidaEnum unidadeMedida,
    BigDecimal quantidadeConsumida
) {}

public record MovimentacaoSemanalDto(
    String semana,
    TipoMovimentacaoEnum tipo,
    UnidadeMedidaEnum unidadeMedida,
    BigDecimal quantidade
) {}

public record ResumoMovimentacaoDto(
    UnidadeMedidaEnum unidadeMedida,
    BigDecimal quantidade
) {}

public record EntradasSaidasDto(
    List<MovimentacaoSemanalDto> movimentacoes,
    List<ResumoMovimentacaoDto> totalEntradas,
    List<ResumoMovimentacaoDto> totalSaidas
) {}

public record PerdasQuebrasDto(
    String semana,
    UnidadeMedidaEnum unidadeMedida,
    BigDecimal quantidade
) {}

public record InsumosStatusDto(
    Long ativos,
    Long inativos,
    Long total,
    Double percentualAtivos,
    Double percentualInativos
) {}

public record DashboardResponseDto(
    LocalDate dataInicio,
    LocalDate dataFim,
    List<InsumosMaisConsumidosDto> insumosMaisConsumidos,
    EntradasSaidasDto entradasSaidas,
    List<PerdasQuebrasDto> perdasQuebras,
    InsumosStatusDto insumosStatus
) {}
```

DTO interno da consulta:

```java
public record MovimentacaoPeriodoDto(
    Integer insumoId,
    String nome,
    UnidadeMedidaEnum unidadeMedida,
    Boolean ativo,
    TipoMovimentacaoEnum tipo,
    MotivoMovimentacaoEnum motivo,
    BigDecimal quantidade,
    LocalDateTime dataHora
) {}
```

> Se o Hibernate reclamar de record em constructor expression, trocar apenas esse DTO interno por classe com construtor.

---

## 8. Regras de cálculo

### Período
- `dataFim = LocalDate.now()`
- `dataInicio = dataFim.minusDays(29)` → 30 dias incluindo hoje
- Consulta: `dataHora >= dataInicio.atStartOfDay()` e `dataHora < dataFim.plusDays(1).atStartOfDay()`

### KPI 1 — Insumos mais consumidos
- Considerar `SAIDA` + `VENDA` e subtrair `ENTRADA` + `CANCELAMENTO_VENDA`.
- Agrupar por `insumoId`; somar apenas valores positivos (consumo líquido > 0).
- Ordenar por `unidadeMedida` e depois por `quantidadeConsumida` decrescente.
- Limitar a 10 itens **por unidade** (constante `LIMITE_RANKING = 10`).
- Incluir somente insumos ativos (`insumo.ativo = true`) — o DTO da consulta traz o campo `ativo`. **Confirmado.**

### KPI 2 — Entradas x saídas
- Considerar `ENTRADA` e `SAIDA`.
- **Excluir `AJUSTE`**: é correção de inventário, não fluxo real (correção em relação ao plano original).
- `CANCELAMENTO_VENDA` entra como `ENTRADA` (é uma entrada física de estoque).
- Agrupar por (semana, tipo, unidade) e somar.
- Semana = segunda-feira da semana da movimentação, formatada `dd/MM` (`TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)`).
- Totais de entradas/saídas = soma da série agrupada por unidade (sem segunda consulta).

### KPI 3 — Perdas por quebras
- Considerar apenas `SAIDA` + `QUEBRA`.
- Agrupar por (semana, unidade) e somar.
- **Não** incluir a perda por `percentual_perda` da entrada (decisão do time).

### KPI 4 — Insumos ativos x inativos
- `ativos = countByAtivoTrue()`, `inativos = countByAtivoFalse()`, `total = ativos + inativos`.
- Percentuais com 1 casa decimal (`Math.round(x * 1000.0 / total) / 10.0`).
- `total == 0` → percentuais `0.0`.

### BigDecimal
- Todas as somas em `BigDecimal.ZERO`.
- Resultado com `setScale(3, RoundingMode.HALF_UP)` para manter o padrão `DECIMAL(12,3)`.

---

## 9. Service

`DashboardService` deve:

1. Calcular `dataInicio`/`dataFim`.
2. Buscar as movimentações do período (uma chamada).
3. Calcular o KPI 1 (mapa por insumo + ajuste de cancelamento).
4. Calcular a série semanal e os totais (KPI 2).
5. Calcular as perdas (KPI 3).
6. Contar insumos (KPI 4).
7. Montar `DashboardResponseDto`.
8. Ter construtor explícito com `MovimentacaoEstoqueRepository` e `InsumoRepository` (padrão do projeto).

---

## 10. Controller

```java
@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/indicadores")
    public ResponseEntity<DashboardResponseDto> getIndicadores() {
        return ResponseEntity.ok(dashboardService.getIndicadores());
    }
}
```

- Sem parâmetros (backend define o período).
- Sem header `Usuario-Id` (diferente de `/estoque`).
- `@CrossOrigin` alinhado ao `EstoqueController`; se o projeto adotar CORS global depois, remover.

---

## 11. Testes e dados

- **Teste de service** (`DashboardServiceTests`) com listas fixas de `MovimentacaoPeriodoDto`: cobre cancelamento, unidades diferentes, insumo inativo, semana parcial e total zero. Implementado e passando.
- **Teste de repositório** (`MovimentacaoEstoqueRepositoryTests`) com H2 (`ddl-auto=create-drop`), validando o JPQL e a projeção `MovimentacaoPeriodoDto`. Implementado e passando.
- **Dados de teste:** corrigir `insert mock.sql` (falta `percentual_perda`, que é `NOT NULL`) e inserir pelo menos:
  - 2 insumos em `GRAMA` e 1 em `UNIDADE`;
  - `ENTRADA`/`COMPRA`, `SAIDA`/`QUEBRA`, `SAIDA`/`AJUSTE`, `SAIDA`/`VENDA` (esta exige `item_venda_insumo` — só após o módulo de vendas).
- **Validação manual:** `GET http://localhost:8080/dashboard/indicadores` no Bruno/Postman.
- `InsumoController` está vazio; não há API para cadastrar insumo. Popular via SQL.

---

## 12. Ordem de implementação

- [x] Confirmar a exclusão de `AJUSTE` do KPI 2 e o filtro de insumos ativos no KPI 1.
- [x] Substituir os 3 arquivos WIP (`DashboardController`, `DashboardService`, `DashboardResponseDto`) — o build está quebrado.
- [x] Criar `MovimentacaoPeriodoDto`.
- [x] Criar os 7 DTOs do contrato.
- [x] Adicionar `buscarNoPeriodo` em `MovimentacaoEstoqueRepository`.
- [x] Adicionar `countByAtivoTrue/False` em `InsumoRepository`.
- [x] Implementar `DashboardService`.
- [x] Corrigir `DashboardController`.
- [x] Compilar (`./mvnw compile`).
- [ ] Corrigir `insert mock.sql` e popular o banco.
- [ ] Testar o endpoint manualmente e conferir totais.
- [x] Escrever o teste de service.
- [ ] Integrar com o frontend.

---

## 13. Riscos e pontos de atenção

| Risco | Impacto | Mitigação |
|---|---|---|
| Não existe módulo de vendas | KPI 1 sempre vazio | Documentar; implementar vendas em seguida |
| `AJUSTE` distorce o gráfico de entradas x saídas | Barras irreais | Excluir `AJUSTE` (decisão deste plano) |
| Gramas x unidades no mesmo ranking | Ranking enganoso | Ranking separado por unidade |
| Cancelamento não descontado | Consumo inflado | Somar `VENDA` e subtrair `CANCELAMENTO_VENDA` |
| Insumo inativo com histórico | Aparece no topo | Filtrar `ativo = true` (confirmado) |
| Perda de recebimento não entra no KPI 3 | Número menor que a perda real | Documentado como decisão do time |
| Semanas parciais no início/fim | Primeira/última barra menores | Aceito e documentado |
| `ddl-auto=validate` + `.env` ausente | App não sobe em teste | Garantir `.env` ou perfil de teste |
| `insert mock.sql` sem `percentual_perda` | Inserts falham | Corrigir o script |

---

## 14. Critérios de aceite

- [x] `./mvnw compile` passa sem erros.
- [ ] `GET /dashboard/indicadores` responde 200 com o JSON do §7.
- [x] `dataInicio`/`dataFim` correspondem aos últimos 30 dias.
- [x] Insumos mais consumidos consideram apenas `VENDA` líquida de cancelamento.
- [x] Entradas e saídas não misturam unidades e ignoram `AJUSTE`.
- [x] Perdas consideram apenas `QUEBRA`.
- [x] Percentuais de ativos/inativos corretos com e sem insumos cadastrados.
- [x] Semanas parciais não quebram o agrupamento.
- [x] Endpoint acessível pelo front (CORS).


