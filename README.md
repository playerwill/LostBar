# Lost Bar — Controle de Fiado

Protótipo web responsivo, em português brasileiro, para apresentar o fluxo de controle de contas do Lost Bar. Construído com React e Vite, com armazenamento local no navegador e dados fictícios de demonstração.

## Rodar no computador

1. Instale Node.js 20 ou superior.
2. Extraia o ZIP e abra a pasta `lost-bar-prototipo` no terminal.
3. Execute:

```bash
npm install
npm run dev
```

4. Abra o endereço informado pelo Vite (normalmente `http://localhost:5173`).
5. Entre com usuário `christian` e senha `lostbar613`.

## Recursos para demonstrar

- Dashboard com saldos, consumos e pagamentos por período.
- Cadastro, edição, busca, bloqueio e extrato de clientes.
- Produtos com categorias, preços, ativação/desativação.
- Consumo por itens ou por valor total, com validação do limite de crédito.
- Pagamentos parciais ou quitação, sem permitir valor maior que a dívida.
- Estorno com justificativa, preservando o registro no histórico.
- Relatórios, filtro de movimentações e exportação CSV.
- Persistência no `localStorage`, responsividade e dados demonstrativos.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub e envie o conteúdo desta pasta (não o ZIP dentro de outro ZIP).
2. Em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**. O workflow `.github/workflows/deploy.yml` já está incluído.
3. Cada push na branch `main` compila e publica a aplicação. A configuração do Vite usa caminhos relativos, compatíveis com GitHub Pages em repositórios de projeto.

Para testar a compilação local:

```bash
npm run build
npm run preview
```

## Limites importantes deste protótipo

- Login demonstrativo: as credenciais estão no código do navegador; não é autenticação real.
- Os dados ficam somente no navegador/dispositivo atual. Não há sincronização, banco online nem backup; limpar os dados do site apaga os registros.
- Utilize exclusivamente dados fictícios. Não registre CPF, telefone, dívida ou dados reais de clientes.
- GitHub Pages hospeda arquivos estáticos e não protege dados financeiros. A versão de produção precisa de backend autenticado, banco (por exemplo Supabase), regras RLS e validação/auditoria no servidor. Não use este protótipo como sistema financeiro real.

Use **Restaurar demonstração** para recomeçar com os dados fictícios iniciais.
