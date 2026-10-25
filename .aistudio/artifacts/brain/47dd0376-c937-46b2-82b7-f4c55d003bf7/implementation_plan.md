# Master Site Prompt Studio — Fechador de Vendas & Atualizações da Plataforma

## Resumo das Entregas Implementadas

### 1. Novo Espaço Dedicado: Fechador de Vendas & Objeções (`sales_closer`)
Criado um espaço completo e de alto padrão acessível pelo menu lateral (**Fechador de Vendas**), pelo topo da aplicação e por um banner em destaque no Painel Geral.

#### A. Gerador de Script de Abordagem & Diferenciais Únicos
- **Entradas**: Nome do potencial cliente, Nome da empresa/estabelecimento, Nicho/segmento (com botões de preenchimento rápido para Saúde, Odonto, Advocacia, Imobiliária, Estética, Gastronomia, Construção, etc.), Solução Ofertada (Combo Ouro: GMN 100/100 + Site Completo, Landing Page + SEO Local, Site Institucional) e Região/Cidade.
- **Diferenciais Enfatizados**:
  1. **SEO Nota 100 no Google**: Ranqueamento orgânico real na 1ª página, arquitetura semântica, Schema.org, Lighthouse 98-100 e velocidade < 1.2s, para o cliente não ficar refém de pagar anúncios o tempo todo para ser encontrado.
  2. **Design que Encanta e Cativa**: Visual construído sob as 56 diretrizes do Master Prompt 7.0 World-Class, transmitindo sofisticação, credibilidade imediata e distanciando totalmente de amadores.
  3. **A Dobradinha Imbatível (Google Meu Negócio + Site/Landing Page Completa)**: Explicação cirúrgica de que o GMN capta a demanda local no Google Maps ("perto de mim"), enquanto o Site valida autoridade e fecha o contrato no WhatsApp. Ter só o GMN perde mais de 60% das vendas porque os clientes de maior ticket clicam no site antes de ligar. Ter só o site sem GMN perde toda a busca geolocalizada. Juntos, dominam a busca de ponta a ponta!
  4. **Conversão Cirúrgica para WhatsApp**: Botões inteligentes e CTAs de alta conversão.
- **Formatos Gerados**:
  - **Script de WhatsApp**: Mensagem formatada com quebras de linha, emojis moderados e pergunta de fechamento.
  - **Roteiro de Áudio de 45 a 60 segundos**: Roteiro falado natural pronto para gravar e enviar no WhatsApp (converte 3x mais que texto frio).
  - **Proposta Executiva / E-mail**: Estrutura corporativa completa para clientes formais.
  - **Quebra Preventiva de Objeções**: 4 objeções clássicas já neutralizadas no próprio script.

#### B. Contra-Ataque de Objeções ("O Que Responder ao Cliente")
- **Entrada**: Campo de texto para colar a mensagem ou resposta exata que o cliente deu (ex: *"Achei caro"*, *"Já tenho Instagram"*, *"Um amigo faz por R$ 300"*, *"Vou falar com meu sócio"*).
- **Arsenal Rápido de 8 Objeções em 1 Clique**: Botões para simular ou resolver na hora as principais travas comerciais.
- **Resultado Calculado**:
  - **Tag da Objeção & Psicologia do Cliente**: Análise da real trava e como desarmá-la.
  - **Mensagem Pronta para o WhatsApp**: Resposta empática com contraste de custo vs valor e pergunta de fechamento.
  - **Roteiro de Áudio (35 a 50 segundos)** para mandar no WhatsApp.
  - **Argumento Matemático de ROI**: Prova numérica de que 1 ou 2 novos clientes pagam o site integralmente.
  - **Gatilho de Urgência & Bônus de Fechamento**: Oferta da otimização 100/100 do Google Meu Negócio inclusa grátis para fechamento até determinado prazo.
  - **Plano de Follow-up** para as próximas 24 horas.

---

### 2. Utilitários de Cópia e Exclusão Revisados
- **Cópia Segura**: `copyToClipboard` com API Navigator Clipboard assíncrona e fallback robusto para iframes via `document.execCommand`.
- **Botões de Exclusão**: Todos os `window.confirm()` bloqueantes foram substituídos por modais modernos e responsivos com backdrop e confirmação explícita.
- **Prevenção de Cliques Acidentais**: Inclusão de `e.stopPropagation()` nos botões de cópia e exclusão de cartões.

---

### 3. Cadastro Único do Administrador & Recuperação
- **Cadastro Único**: O sistema verifica tanto no servidor (`/api/auth/status`) quanto no localStorage (`master_site_admin_*_v3`). Após o primeiro cadastro, o formulário de cadastro é travado permanentemente, exigindo apenas a senha.
- **Recuperação de Senha**: Envio de código de 6 dígitos para o e-mail cadastrado (`pclc36@gmail.com`) com redefinição segura de senha.
- **Botão de Emergência**: Opção de reset mestre local para reinicialização rápida caso necessário.

---

### 4. Questionários Limpos & Formulário Interativo em HTML
- **Questionários sem Poluição**: Removidos todos os asteriscos (`*`), ponteiros (`👉`), dicas e rótulos desnecessários em `DedicatedQuestionnairesHub.tsx`. O formato agora é estritamente: número da pergunta e texto da pergunta.
- **HTML Interativo para o Cliente**:
  - Geração de formulário HTML mobile-first standalone com botão de envio direto para o WhatsApp do desenvolvedor: `86 99498-8349` (`5586994988349`).
  - Botões para baixar o arquivo `.html`, abrir prévia interativa ou importar respostas preenchidas.
