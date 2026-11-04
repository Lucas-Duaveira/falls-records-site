# Falls Records Site

Site oficial da Falls Records para apresentar a gravadora, artistas e lançamentos.

## Estado do projeto

- A página inicial em construção está em `src/pages/index.astro`.
- O layout compartilhado está em `src/layouts/BaseLayout.astro`.
- `prototype-v0/` guarda a primeira versão estática como referência.
- As mídias públicas ficam em `public/assets/`: imagens de artistas em `images/artists/`, capas em `images/releases/`, logos em `logos/` e áudio em `audio/`.
- A página mantém apenas informações já identificadas; perfis e lançamentos serão completados com nomes, textos, imagens autorizadas e links oficiais fornecidos pela gravadora.
- O catálogo começa simples, em arquivos do projeto; um CMS pode ser avaliado mais adiante.

O manual de marca atual é provisório. O logo oficial e os arquivos tipográficos licenciados ainda precisam ser adicionados.

## Tecnologias

- Astro para páginas com foco em conteúdo e geração estática.
- TypeScript para validar código e dados conforme o projeto crescer.
- CSS para implementar a identidade visual e os layouts responsivos.

## Iniciar localmente

```bash
npm install
npm run dev
```

O terminal mostrará o endereço local para abrir no navegador.

## Preparar publicação

```bash
npm run check
npm run build
npm run preview
```

A saída estática será gerada em `dist/`.

## Prévia de teste no GitHub Pages

- Endereço: <https://lucas-duaveira.github.io/falls-records-site/>
- O repositório e esta prévia são públicos e servem apenas para avaliação do protótipo.
- Cada envio para a branch `main` inicia uma publicação automática pelo GitHub Actions.
- Para abrir o site localmente, use `npm run dev`; o endereço local não é acessível por outras pessoas.

A hospedagem definitiva, o domínio próprio e os requisitos profissionais de segurança serão escolhidos antes do lançamento oficial.
