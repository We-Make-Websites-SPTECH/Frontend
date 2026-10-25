# Primarella — Controle de estoque

Aplicação de front-end em React para o controle de estoque da pizzaria. Os dados são simulados nos Models e podem ser trocados pela API sem reescrever as telas.

## Executar

```bash
npm install
npm run dev
```

## Organização

A estrutura segue as camadas apresentadas no material de Arquitetura Front-end:

- `app`: inicialização, navegação principal e composição da aplicação.
- `pages`: telas completas, com foco na apresentação e nas interações da interface.
- `widgets`: espaço para blocos reutilizáveis maiores.
- `features`: regras e ações do usuário, organizadas por estoque, cardápio e vendas. Os hooks `use...` fazem o papel de ViewModel.
- `entities`: modelos do domínio e acesso aos dados (Model), hoje com dados mockados.
- `shared`: estilos e funções reutilizadas.

Os services foram organizados junto às entidades para manter dados e integração com API na camada Model. Os formulários estão junto às respectivas features. O projeto continua apenas front-end; atualizar a página reinicia os dados em memória.
