import { TestScenario } from '../types';

export const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'scenario_1_professional_local',
    name: 'Cenário 1: Landing Page de Profissional Local',
    description: 'Dra. Camila Ramos — Odontologia Estética & Reabilitação Oral. Possui endereço físico presencial completo e WhatsApp comercial.',
    projectType: 'landing_page',
    targetPlatform: 'ai_site_builder',
    hostingTarget: 'hostinger_static',
    preferredFramework: 'Astro (Astro-First)',
    questionnaire: `QUESTIONÁRIO DE BRIEFING — WEBSITE / LANDING PAGE

1. Qual é o nome do profissional ou empresa?
Dra. Camila Ramos — Odontologia Estética & Reabilitação

2. Qual é o seu nicho e especialidade principal?
Odontologia estética avançada, com foco em Lentes de Contato Dental em Porcelana, Clareamento a Laser e Harmonização Orofacial.

3. Quais são os principais serviços oferecidos?
- Lentes de Contato em Cerâmica / Facetas
- Clareamento Dental de Alta Precisão (Laser / Consultório + Caseiro)
- Reabilitação Oral e Próteses Estéticas
- Check-up Preventivo e Profilaxia Digital

4. Quem é o público-alvo ideal?
Homens e mulheres de 28 a 55 anos, classes A e B, empresários, profissionais liberais e noivas que buscam excelência estética, discrição, atendimento humanizado sem dor e resultados naturais sem aspecto artificial.

5. Onde é realizado o atendimento? Possui endereço físico aberto ao público?
Sim! Atendimento presencial na clínica física:
Av. das Américas, 4200, Bloco 8, Sala 312 — Barra da Tijuca, Rio de Janeiro - RJ, CEP: 22640-102.
Estacionamento rotativo no subsolo e segurança 24h.

6. Quais são os canais de contato oficiais?
WhatsApp: (21) 98765-4321
Telefone fixo: (21) 3214-5500
E-mail: contato@dracamiladental.com.br
Instagram: @dracamiladental

7. Quais são os objetivos comerciais principais com o site?
- Atrair pacientes qualificados interessados em Lentes de Contato e Clareamento.
- Transmitir autoridade médica, calma e segurança para quem tem medo de dentista.
- Facilitar agendamento de consultas avaliativas via WhatsApp.

8. Quais são os seus grandes diferenciais em relação à concorrência?
- Tecnologia de Scanner Intraoral 3D (sem necessidade de moldagem com massa desconfortável).
- Planejamento digital do sorriso com mock-up para o paciente ver o resultado antes de iniciar o procedimento.
- Sala de atendimento com aromaterapia e fone antirruído com playlist personalizada para acolhimento de pacientes ansiosos.
- Mais de 12 anos de experiência clínica com certificação internacional na Suíça.

9. Quais as principais dores ou medos que seu paciente relata?
- Medo de dor ou desconforto durante os tratamentos.
- Receio de ficar com dentes artificiais ("sorriso de chiclete" ou excessivamente branco e plano).
- Experiências traumáticas passadas com dentistas.

10. Identidade visual e preferências de design:
Cores principais: Verde sálvia suave (#7A9A8B), dourado champagne (#D4AF37) e off-white (#FAF9F6).
Estilo: Minimalista, acolhedor, sofisticado, iluminação clara e aspecto de spa odontológico.
Logotipo já existe em alta resolução.

11. Possui provas sociais ou depoimentos?
Sim, mais de 450 sorrisos transformados e nota 4.9 no Google Meu Negócio com mais de 120 avaliações verificadas. Depoimentos em vídeo de pacientes reais disponíveis para incorporação.

12. Requisitos técnicos e legais:
- CRO: Camila Ramos — CRO-RJ 45.892 / EPAO 9821.
- Respeitar código de ética odontológico (sem promessas sensacionalistas de "antes e depois" proibidas pelo conselho regional).
- Botão direto para WhatsApp com mensagem personalizada para triagem pela secretária.`,
    notes: 'Atenção especial às regras éticas do CRO-RJ, inclusão obrigatória do endereço na Barra da Tijuca com Google Maps e rota, e destaque para o scanner 3D sem massa.'
  },
  {
    id: 'scenario_2_digital_no_location',
    name: 'Cenário 2: Empresa 100% Digital sem Endereço Físico',
    description: 'Nexus Growth — Consultoria de Mídia Paga e Growth para Startups e SaaS. Atendimento 100% remoto internacional, sem ponto presencial ao público.',
    projectType: 'service_page',
    targetPlatform: 'code_generator',
    hostingTarget: 'hostinger_static',
    preferredFramework: 'Astro (Astro-First)',
    questionnaire: `BRIEFING DO PROJETO

Nome da empresa: Nexus Growth Partners
Segmento: Growth Marketing, Gestão de Tráfego de Alta Performance e Otimização de Funil para empresas de Tecnologia e SaaS B2B.

Serviços:
1. Gestão de campanhas Google Ads e LinkedIn Ads para B2B
2. Modelagem de Atribuição e Implementação de Server-Side Tracking (GTM Server / GA4)
3. Auditoria e Otimização de Taxa de Conversão (CRO) em Páginas de Demonstração

Público-alvo:
CEOs, CMOs e VPs de Growth de empresas que já faturam acima de R$ 100 mil/mês e querem escalar aquisição de clientes com CAC controlado.

Localização física:
NÃO TEMOS endereço físico para atendimento ao público! Nossa operação é 100% remota e atendemos clientes em todo o Brasil, Portugal e Estados Unidos. Nossos contratos são assinados digitalmente e todas as reuniões acontecem via Google Meet.
NÃO colocar mapa, endereço fictício ou rua no site sob hipótese alguma!

Contatos:
E-mail: contato@nexusgrowth.io
WhatsApp corporativo: +55 (11) 97711-2233
LinkedIn: https://linkedin.com/company/nexus-growth-partners

Objetivo do site:
Geração de leads qualificados. O visitante deve preencher um formulário curto de qualificação para agendar uma Reunião Diagnóstica de 30 minutos com nossos estrategistas.

Diferenciais:
- Relatórios em tempo real no Looker Studio com acesso livre para o cliente.
- Time sênior (sem repassar conta para estagiários).
- Já gerenciamos mais de R$ 18 milhões em verba de mídia com ROAS médio de 4.2x em SaaS.

Identidade visual:
Modo escuro (Dark Tech), azul neon elétrico (#0066FF), cinza grafite (#0A0D14) e acento ciano (#00E5FF). Visual inspirado em Linear.app e Stripe.

Provas sociais:
Cases de sucesso com logos de clientes de tecnologia e gráficos de crescimento percentual autorizados.`,
    notes: 'VERIFICAÇÃO CRÍTICA: Não deve conter bloco de Google Maps nem inventar endereço físico. A copy e a estrutura devem celebrar a atuação 100% remota e global.'
  },
  {
    id: 'scenario_3_incomplete_gaps',
    name: 'Cenário 3: Questionário Incompleto com Lacunas',
    description: 'Belo Jardim Paisagismo — Questionário enviado por WhatsApp com respostas curtas, campos em branco e falta de dados fundamentais.',
    projectType: 'institutional',
    targetPlatform: 'visual_builder',
    hostingTarget: 'hostinger_static',
    preferredFramework: 'Astro (Astro-First)',
    questionnaire: `Questionário preenchido pelo cliente no WhatsApp:

Nome:
Belo Jardim Paisagismo

O que vocês fazem:
Paisagismo residencial e manutenção de jardins.

Endereço:
Ainda estamos reformando o galpão, por enquanto não temos loja física aberta para visitação. Atendemos em domicílio em Curitiba e Região Metropolitana.

Telefone / Whats:
41 99123-9988

Público:
Pessoas que tem casa com jardim grande ou condomínio fechado.

Cores:
Verde e marrom, coisas da natureza.

Logo:
Temos um desenhado, mas não sei onde tá o arquivo agora.

Depoimentos:
Ainda não pegamos depoimento gravado de ninguém, temos só elogio no WhatsApp.

Preço:
Depende do jardim, a gente vai até o local fazer o orçamento gratuito.

Fotos:
Temos fotos tiradas pelo celular das obras recentes.

Observação extra do cliente:
Preciso que o site fique pronto rápido porque a primavera tá chegando e o pessoal procura bastante.`,
    notes: 'TESTE DE CONTROLE DE QUALIDADE: Testar se o sistema sinaliza com precisão as lacunas (sem logo vetorial, sem depoimentos formais comprovados, sem endereço fixo presencial), preserva os dados existentes (Curitiba e região, atendimento em domicílio com orçamento gratuito) e não inventa dados inexistentes.'
  },
  {
    id: 'scenario_4_advogado_individual_lp',
    name: 'Dr. Rafael Nogueira — Advogado Individual (LP)',
    description: 'Dr. Rafael Nogueira (OAB/SP 384.910) — Advocacia Trabalhista e Previdenciária. Landing Page pessoal focada em atendimento direto e ética OAB.',
    projectType: 'professional',
    targetPlatform: 'ai_site_builder',
    hostingTarget: 'hostinger_static',
    preferredFramework: 'Astro (Astro-First)',
    questionnaire: `QUESTIONÁRIO DE BRIEFING — ADVOGADO INDIVIDUAL (LANDING PAGE)

1. Nome profissional completo, OAB e especialidade principal:
Dr. Rafael Nogueira — OAB/SP 384.910 — Advogado Especialista em Direito Trabalhista e Previdenciário.

2. Principal segurança ou solução entregue ao cliente (Headline Hero):
Atuação jurídica estratégica na defesa de trabalhadores e segurados do INSS, com análise transparente e atendimento direto com o advogado titular.

3. Cliente ideal e problema mais urgente:
Profissionais CLT, bancários e segurados do INSS entre 28 e 60 anos que sofreram demissão irregular, não receberam horas extras ou tiveram aposentadoria negada ou calculada abaixo do devido.

4. Principais causas e serviços jurídicos prioritários:
1. Revisão de Rescisão e Reconhecimento de Vínculo Trabalhista
2. Cobrança de Horas Extras Bancárias e Adicional de Insalubridade/Periculosidade
3. Planejamento, Concessão e Revisão de Aposentadoria e Auxílio-Doença no INSS
4. Acidente de Trabalho e Indenização por Danos Morais

5. Trajetória e formação acadêmica:
Advogado atuante há 12 anos, graduado pela USP e pós-graduado em Direito e Processo do Trabalho pela PUC-SP, com mais de 600 atendimentos realizados e atendimento conduzido pessoalmente do início ao fim.

6. Passo a passo do atendimento e tempo de resposta:
1. Clique no WhatsApp para triagem rápida em até 15 minutos no horário comercial;
2. Envio seguro de documentos digitais (CTPS, holerites ou CNIS);
3. Reunião individual por videoconferência ou presencial com parecer técnico claro sobre viabilidade e próximos passos.

7. Formato de atendimento e endereço físico:
Atendimento presencial com hora marcada na Av. Paulista, 1439, Conj. 84 — Bela Vista, São Paulo/SP, CEP 01311-200, e atendimento 100% digital em todo o Brasil via processo eletrônico (PJe).

8. Diferenciais éticos conforme Código de Ética da OAB:
Atendimento direto com o Dr. Rafael sem repassar para terceiros, linguagem simples sem juridiquês, atualizações proativas a cada movimentação relevante e sigilo profissional absoluto (sem promessas de causa ganha).

9. Provas sociais e credibilidade pública:
Avaliação média 5.0 no Google Meu Negócio com mais de 85 comentários elogiando transparência e agilidade, além de artigos publicados em portais jurídicos.

10. Dúvidas frequentes (FAQ):
- Preciso ir presencialmente? Não, todo o atendimento pode ser feito online com segurança jurídica.
- A empresa onde trabalho saberá da consulta? Não, todo contato é protegido pelo sigilo da advocacia.
- Como funciona a consulta jurídica? Analisamos documentos e explicamos honorários de forma clara conforme a tabela da OAB.

11. Contatos oficiais e CTA:
WhatsApp: (11) 98765-4321 | E-mail: contato@rafaelnogueira.adv.br | Seg a Sex, 08:30 às 18:30 | Botão principal: "Falar com o Dr. Rafael no WhatsApp".

12. Identidade visual e materiais:
Azul Marinho (#0F1E36), Dourado acetinado (#C9A24D) e Off-White (#F8F7F4). Estilo editorial minimalista. Possui 4 fotos profissionais em estúdio e logotipo vetorial.`,
    notes: 'Respeitar integralmente o Provimento 205/2021 da OAB (sem promessas de resultado garantido ou captação mercantilista), destacar a OAB/SP 384.910 no topo e no rodapé e manter foco no atendimento pessoal pelo Dr. Rafael.'
  }
];
