# Falls Records Site

Site oficial da Falls Records para apresentar a gravadora, artistas e lançamentos.

## Estado do projeto

- Esta é a cópia de trabalho conectada ao GitHub (`main` / `origin`). Faça alterações nesta pasta; `github-upload-staging/` é uma cópia antiga e não publica o site.
- A página inicial em construção está em `src/pages/index.astro`.
- O layout compartilhado está em `src/layouts/BaseLayout.astro`.
- `prototype-v0/` guarda a primeira versão estática como referência; não é a versão ativa.
- O conteúdo e os estilos estão em `src/`; os arquivos públicos ficam em `public/assets/`.
- Mantenha os originais no Google Drive e, se necessário, temporariamente em `media-source/` (pasta local ignorada pelo Git e pelo site). Em `public/assets/`, coloque apenas cópias aprovadas, otimizadas e prontas para publicação; tudo nessa pasta é incluído no site público.
- Prefira imagens responsivas em WebP. Otimize e redimensione antes de publicar: a logo e a imagem de destaque já são servidas em WebP; as capas de lançamento devem usar dimensões próximas ao tamanho em que aparecem na página.
- Pastas de mídia: `images/artists/`, `images/releases/`, `images/carousel/`, `logos/` e `audio/`. Use nomes descritivos, minúsculos e sem espaços (por exemplo, `rise-rise-forks-live.jpg`).
- A página mantém apenas informações já identificadas; perfis e lançamentos serão completados com nomes, textos, imagens autorizadas e links oficiais fornecidos pela gravadora.
- O catálogo começa simples, em arquivos do projeto; um CMS pode ser avaliado mais adiante.

O manual de marca atual é provisório. A logo otimizada está aplicada no cabeçalho; confirme se é a versão final da marca. Confirme também as licenças de uso das fontes.

## Atenção aos arquivos de mídia atuais

Os PNGs originais recebidos ficam em `media-source/` e não são enviados ao GitHub nem copiados para o site. A imagem otimizada atual está na faixa de artistas em `public/assets/images/carousel/`; a logo otimizada está em `public/assets/logos/`. Confirme autorização para publicar as imagens.

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

## Rádio Falls

A seção Rádio usa a capa da Falls Records enviada para o site e incorpora a playlist pública “Falls Records — Rádio” pelo player oficial compacto do Spotify. O botão **Ouvir boas-vindas** narra uma apresentação curta usando a voz em português disponível no navegador; ele não inicia nem controla a música. A pessoa inicia a playlist separadamente pelo botão de play do Spotify.

Esta prévia usa um texto de boas-vindas fixo e síntese de voz do navegador, não geração de falas por IA. Um apresentador que gere textos dinâmicos com IA poderá ser adicionado depois por meio de um serviço protegido no servidor, sem expor chaves no site estático.

As capas dos lançamentos são buscadas automaticamente no catálogo público do Apple Music, consultando as faixas associadas ao artista e comparando o título da música. Se um lançamento não estiver nesse catálogo ou a imagem não carregar, o site mantém o monograma Falls como alternativa. A busca não altera nem controla o player do Spotify.

Os perfis dos artistas exibem imagens públicas dos perfis oficiais no Spotify e no Linktree, além de links para seus canais oficiais e plataformas de música. A capa de “Well...” usa a imagem do lançamento disponível diretamente no Spotify, pois esse single não aparece no catálogo Apple Music consultado.

## Prévia de teste no GitHub Pages

- Endereço: <https://lucas-duaveira.github.io/falls-records-site/>
- O repositório e esta prévia são públicos e servem apenas para avaliação do protótipo.
- Cada envio para a branch `main` inicia uma publicação automática pelo GitHub Actions.
- Para abrir o site localmente, use `npm run dev`; o endereço local não é acessível por outras pessoas.

A hospedagem definitiva, o domínio próprio e os requisitos profissionais de segurança serão escolhidos antes do lançamento oficial.
