import { ProjectExtractedData, ProjectType } from '../types';
import { generatePhotographicDirection } from './imageService';

export function parseQuestionnaireHeuristic(
  rawText: string,
  projectName: string,
  clientNameHint?: string,
  projectType?: ProjectType,
  additionalNotes?: string
): ProjectExtractedData {
  const text = rawText || '';
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // Helper to search for sections / questions / answers
  const findAnswerTo = (patterns: RegExp[]): string => {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pat of patterns) {
        if (pat.test(line)) {
          // If answer is on the same line after colon/dash
          const split = line.split(/[:\-–—]\s*/);
          if (split.length > 1 && split.slice(1).join(' ').trim().length > 1) {
            return split.slice(1).join(' ').trim();
          }
          // Otherwise look at following lines until next question/bullet
          const collected: string[] = [];
          let j = i + 1;
          while (j < lines.length) {
            const nextLine = lines[j];
            // Stop if next line looks like a question or new section number
            if (/^(?:\d+[\.\)]|[a-zA-ZÀ-ÿ\s]{3,30}:)/.test(nextLine) && !/^[\-\*•]/.test(nextLine)) {
              break;
            }
            collected.push(nextLine);
            j++;
          }
          if (collected.length > 0) {
            return collected.join('\n').trim();
          }
        }
      }
    }
    return '';
  };

  // 1. Client / Company Name
  let extractedClient = clientNameHint?.trim() || '';
  if (!extractedClient) {
    const nameMatch = findAnswerTo([
      /nome(?:\s+do\s+profissional|\s+da\s+empresa|\s+do\s+cliente)?/i,
      /quem\s+(?:é|somos)/i,
    ]);
    if (nameMatch) {
      extractedClient = nameMatch.split('\n')[0].replace(/^[\-\*•\s]+/, '').trim();
    }
  }
  if (!extractedClient && projectName) {
    extractedClient = projectName;
  }

  // 2. Niche & Segment
  let niche = findAnswerTo([
    /nicho|segmento|área\s+de\s+atuação|especialidade/i,
    /o\s+que\s+vocês\s+fazem/i,
    /ramo/i,
  ]);
  if (!niche) {
    if (/odonto|dentist|sorriso|lentes de contato/i.test(text)) {
      niche = 'Odontologia e Saúde Estética';
    } else if (/advoga|jurídic|direito|oab/i.test(text)) {
      niche = 'Advocacia e Assessoria Jurídica';
    } else if (/arquitet|design de interiores|urbanismo/i.test(text)) {
      niche = 'Arquitetura e Design de Interiores';
    } else if (/clínica|médic|médic[ao]|saúde|dermatolog/i.test(text)) {
      niche = 'Saúde e Medicina Especializada';
    } else if (/software|saas|tecnologia|growth|marketing|tráfego/i.test(text)) {
      niche = 'Tecnologia B2B e Growth Marketing';
    } else if (/paisagism|jardim|plantas/i.test(text)) {
      niche = 'Paisagismo e Jardinagem';
    } else {
      niche = 'Não informado';
    }
  }

  // 3. Services
  const servicesRaw = findAnswerTo([
    /principais\s+serviços|serviços(?:\s+oferecidos)?|o\s+que\s+oferece/i,
    /produtos|soluções/i,
  ]);
  const services: string[] = [];
  if (servicesRaw) {
    const items = servicesRaw
      .split(/\n|(?:\d+[\.\)]\s*)|(?:[;•\-])/)
      .map((s) => s.replace(/^[0-9\.\-\*•\s]+/, '').trim())
      .filter((s) => s.length > 2);
    services.push(...items);
  }
  if (services.length === 0) {
    // try to find lines starting with bullets or numbers
    const serviceLines = lines.filter((l) => /^[1-9]\.\s+[A-ZÀ-ÿ]|^[\-•]\s+[A-ZÀ-ÿ]/.test(l));
    if (serviceLines.length > 0 && serviceLines.length <= 8) {
      services.push(...serviceLines.map((l) => l.replace(/^[0-9\.\-\*•\s]+/, '').trim()));
    }
  }

  // 4. Target Audience
  const targetAudienceRaw = findAnswerTo([
    /público(?:\-|\s*)alvo|cliente\s+ideal|para\s+quem\s+é/i,
    /perfil\s+do\s+cliente/i,
  ]);
  const targetAudience = targetAudienceRaw || 'Não informado';

  // 5. Physical Location / Address
  const addressRaw = findAnswerTo([
    /endereço|localização|onde\s+fica|onde\s+é\s+realizado|atendimento\s+presencial/i,
    /onde\s+atendem/i,
  ]);

  const hasExplicitNoPhysical = /(?:não\s+temos\s+endereço|100%\s*remot[oa]|sem\s+ponto\s+físico|atendimento\s+em\s+domicílio|não\s+temos\s+loja\s+física|sem\s+loja\s+física|não\s+colocar\s+mapa)/i.test(
    text
  );

  let hasPhysicalLocation = false;
  let address = 'Não informado';

  if (hasExplicitNoPhysical) {
    hasPhysicalLocation = false;
    address = addressRaw || 'Operação 100% remota / Sem atendimento presencial ao público';
  } else if (addressRaw && addressRaw.length > 10 && !/não\s+temos|em\s+reforma|remoto/i.test(addressRaw)) {
    hasPhysicalLocation = true;
    address = addressRaw;
  } else if (addressRaw) {
    address = addressRaw;
  }

  // 6. Service Region
  let serviceRegion = findAnswerTo([
    /região\s+de\s+atendimento|área\s+atendida|onde\s+atende|cidades?\s+atendidas?/i,
  ]);
  if (!serviceRegion) {
    const locMatch = text.match(/(?:em|no|na)\s+([A-ZÀ-ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+)*(?:\s*-\s*[A-Z]{2})?)/);
    if (locMatch && !/Google|WhatsApp|Instagram|Linkedin/i.test(locMatch[1])) {
      serviceRegion = locMatch[1];
    } else if (/brasil/i.test(text)) {
      serviceRegion = 'Brasil (Nacional)';
    } else {
      serviceRegion = 'Não informado';
    }
  }

  // 7. WhatsApp & Phone
  const whatsappMatch = text.match(/(?:whats(?:app)?|celular|fone|tel)?[:\s]*(\+?55\s*\(?\d{2}\)?\s*9?\d{4}[-\s]?\d{4}|\(?\d{2}\)?\s*9?\d{4}[-\s]?\d{4})/i);
  let whatsapp = 'Não informado';
  let hasWhatsApp = false;
  if (whatsappMatch && whatsappMatch[1]) {
    whatsapp = whatsappMatch[1].trim();
    hasWhatsApp = true;
  }

  const phoneMatch = text.match(/(?:telefone\s+fixo|fixo|tel)[:\s]*(\(?\d{2}\)?\s*[2-5]\d{3}[-\s]?\d{4})/i);
  const phone = phoneMatch ? phoneMatch[1].trim() : 'Não informado';

  // 8. Email
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const email = emailMatch ? emailMatch[1].trim() : 'Não informado';

  // 9. Social Links
  const socialLinks: string[] = [];
  const instaMatch = text.match(/@([a-zA-Z0-9._]+)|instagram\.com\/([a-zA-Z0-9._]+)/i);
  if (instaMatch) {
    socialLinks.push(`Instagram: @${instaMatch[1] || instaMatch[2]}`);
  }
  const linkedinMatch = text.match(/linkedin\.com\/[^\s]+/i);
  if (linkedinMatch) {
    socialLinks.push(`LinkedIn: ${linkedinMatch[0]}`);
  }

  // 10. Commercial Goals
  const goalsRaw = findAnswerTo([
    /objetivos?(?:\s+comerciais)?|o\s+que\s+espera\s+do\s+site|meta/i,
  ]);
  const businessGoals: string[] = [];
  if (goalsRaw) {
    businessGoals.push(
      ...goalsRaw
        .split(/\n|(?:\d+[\.\)]\s*)|(?:[;•\-])/)
        .map((s) => s.replace(/^[0-9\.\-\*•\s]+/, '').trim())
        .filter((s) => s.length > 3)
    );
  }

  // 11. Differentials
  const diffRaw = findAnswerTo([
    /diferenciais|por\s+que\s+escolher|vantagens|diferencial/i,
  ]);
  const differentials: string[] = [];
  if (diffRaw) {
    differentials.push(
      ...diffRaw
        .split(/\n|(?:\d+[\.\)]\s*)|(?:[;•\-])/)
        .map((s) => s.replace(/^[0-9\.\-\*•\s]+/, '').trim())
        .filter((s) => s.length > 3)
    );
  }

  // 12. Audience Pain Points
  const painRaw = findAnswerTo([
    /dores|medos|objeções|desafios\s+do\s+cliente/i,
  ]);
  const audiencePainPoints: string[] = [];
  if (painRaw) {
    audiencePainPoints.push(
      ...painRaw
        .split(/\n|(?:\d+[\.\)]\s*)|(?:[;•\-])/)
        .map((s) => s.replace(/^[0-9\.\-\*•\s]+/, '').trim())
        .filter((s) => s.length > 3)
    );
  }

  // 13. Benefits & Transformation
  const benefitsRaw = findAnswerTo([
    /benefícios|transformação|resultados/i,
  ]);
  const benefitsAndTransformation: string[] = [];
  if (benefitsRaw) {
    benefitsAndTransformation.push(
      ...benefitsRaw
        .split(/\n|(?:\d+[\.\)]\s*)|(?:[;•\-])/)
        .map((s) => s.replace(/^[0-9\.\-\*•\s]+/, '').trim())
        .filter((s) => s.length > 3)
    );
  }

  // 14. Visual Identity & Preferences
  const visualRaw = findAnswerTo([
    /identidade\s+visual|cores|preferências\s+de\s+design|estilo\s+visual/i,
  ]);
  const hasLogo = /logotipo\s+já\s+existe|temos\s+logo|logo:\s*sim/i.test(text);
  const colorMatches = text.match(/(?:#[0-9a-fA-F]{3,6}|verde|dourado|azul|preto|branco|cinza|champagne|grafite|neon)[^,;\n.]*/gi);
  const primaryColors = visualRaw || (colorMatches ? colorMatches.slice(0, 4).join(', ') : 'Não informado');

  // 15. References & Inspirations
  const refsRaw = findAnswerTo([
    /referências|sites\s+que\s+gosta|inspirações/i,
  ]);
  const references: string[] = [];
  if (refsRaw) {
    references.push(
      ...refsRaw
        .split(/\n|(?:\d+[\.\)]\s*)|(?:[;•\-])/)
        .map((s) => s.trim())
        .filter((s) => s.length > 3)
    );
  }

  // 16. Mandatory Content / Regulations
  const mandatoryRaw = findAnswerTo([
    /requisitos\s+legais|regulamentação|cro|oab|crm|cnpj|registro\s+profissional/i,
  ]);
  const mandatoryContent: string[] = [];
  if (mandatoryRaw) {
    mandatoryContent.push(mandatoryRaw);
  }
  const councilMatch = text.match(/(?:CRO|CRM|OAB|CREA|COREN)[-\s]*[A-Z]{0,2}\s*[\d\.\/-]+/i);
  if (councilMatch) {
    mandatoryContent.push(`Registro Profissional Obrigatório: ${councilMatch[0]}`);
  }

  // 17. Social Proof
  const socialProofRaw = findAnswerTo([
    /provas?\s+socia(?:l|is)|depoimentos|avaliações|números/i,
  ]);
  const hasRealProof = socialProofRaw && !/ainda\s+não|não\s+temos|nenhum/i.test(socialProofRaw) ? true : false;
  const testimonials: string[] = [];
  if (hasRealProof && socialProofRaw) {
    testimonials.push(socialProofRaw);
  }

  // 18. Technical Requirements
  const technicalRequirements: string[] = [];
  if (/whatsapp/i.test(text)) technicalRequirements.push('Botão flutuante e CTA integrado direto para WhatsApp com mensagem parametrizada');
  if (hasPhysicalLocation) technicalRequirements.push('Integração de mapa interativo (Google Maps) e microdados de LocalBusiness');
  if (/formulário/i.test(text)) technicalRequirements.push('Formulário de qualificação de leads com validação client-side');
  if (/tracking|pixel|analytics|gtm/i.test(text)) technicalRequirements.push('Rastreamento de conversões com GA4 e Meta Pixel');

  // 19. Missing Fields Diagnostics
  const missingFields: string[] = [];
  if (!extractedClient || extractedClient === 'Não informado') missingFields.push('Nome do cliente / empresa');
  if (services.length === 0) missingFields.push('Lista detalhada de serviços ou produtos');
  if (targetAudience === 'Não informado') missingFields.push('Definição clara do público-alvo');
  if (!hasWhatsApp) missingFields.push('Número oficial de WhatsApp para contato');
  if (!hasPhysicalLocation && !hasExplicitNoPhysical && address === 'Não informado') {
    missingFields.push('Confirmação sobre atendimento presencial ou 100% digital');
  }
  if (!hasRealProof) missingFields.push('Depoimentos ou casos de sucesso com comprovação real');
  if (!hasLogo) missingFields.push('Arquivo vetorial do logotipo');

  // 20. Contradictions Detection
  const contradictions: string[] = [];
  if (hasExplicitNoPhysical && /visite\s+nossa\s+loja|venha\s+nos\s+visitar|estacionamento/i.test(text)) {
    contradictions.push('O cliente declarou ser 100% digital/sem loja, mas há menção de visita presencial no texto.');
  }
  if (/atendimento\s+rápido|resposta\s+imediata/i.test(text) && !hasWhatsApp && phone === 'Não informado') {
    contradictions.push('Deseja atendimento imediato, porém não disponibilizou número de WhatsApp ou telefone direto.');
  }
  if (/lentes\s+de\s+contato|procedimento\s+médico/i.test(text) && !councilMatch && !mandatoryRaw) {
    contradictions.push('Atuação na área da saúde sem indicação de número de registro no conselho profissional (CRM/CRO).');
  }

  // Detect hosting environment if mentioned
  let hostingTarget: import('../types').HostingTarget = 'hostinger_static';
  if (/hostinger\s*(?:vps|cloud|node)/i.test(text)) {
    hostingTarget = 'hostinger_vps';
  } else if (/vercel|netlify/i.test(text)) {
    hostingTarget = 'vercel_netlify';
  } else if (/cloudflare/i.test(text)) {
    hostingTarget = 'cloudflare_pages';
  }

  // Photographic Direction generation
  const photographicDirection = generatePhotographicDirection(
    niche || 'Geral',
    extractedClient || 'Empresa',
    visualRaw || '',
    primaryColors,
    services
  );

  return {
    clientName: extractedClient || 'Não informado',
    companyName: extractedClient || 'Não informado',
    niche: niche || 'Não informado',
    services: services.length > 0 ? services : ['Não informado'],
    targetAudience,
    serviceRegion,
    hasPhysicalLocation,
    address,
    hasWhatsApp,
    whatsapp,
    phone,
    email,
    socialLinks,
    businessGoals: businessGoals.length > 0 ? businessGoals : ['Não informado'],
    differentials: differentials.length > 0 ? differentials : ['Não informado'],
    audiencePainPoints: audiencePainPoints.length > 0 ? audiencePainPoints : ['Não informado'],
    benefitsAndTransformation: benefitsAndTransformation.length > 0 ? benefitsAndTransformation : ['Não informado'],
    visualIdentity: {
      logoAvailable: hasLogo,
      primaryColors,
      aestheticStyle: visualRaw || 'Não informado',
      references,
    },
    imageAssets: [],
    photographicDirection,
    preferencesEsthetic: visualRaw || 'Não informado',
    references,
    mandatoryContent: mandatoryContent.length > 0 ? mandatoryContent : ['Não informado'],
    socialProof: {
      hasRealProof,
      testimonials,
      credentials: councilMatch ? [councilMatch[0]] : [],
      cases: [],
    },
    technicalRequirements,
    hostingTarget,
    preferredFramework: 'Astro (Astro-First)',
    missingFields,
    contradictions,
    additionalNotes: additionalNotes || '',
  };
}
