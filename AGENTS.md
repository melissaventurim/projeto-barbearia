<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Padrão visual

- Tema escuro fixo. A classe `dark` fica no `<html>` em `app/layout.tsx`; não existe tema claro.
- Cores sempre por token: `bg-background`, `text-foreground`, `bg-card`, `border-border`, `bg-primary`, `text-muted-foreground`, `text-destructive`. Nunca `bg-blue-600`, `text-gray-400` ou hex.
- A cor primária (latão) é só para botão primário, foco e link.
- Componentes de UI vêm de `components/ui` (shadcn sobre Radix). Para adicionar: `npx shadcn@latest add <componente>`. Não escrever botão, campo, diálogo ou seletor à mão.
- `font-heading` (Bevan) só em título de página. O resto herda Archivo. Sem caixa alta em rótulo.
- Cabeçalho: `SiteHeader` de `components/site-header.tsx`. Container: `mx-auto w-full max-w-3xl px-6`.
