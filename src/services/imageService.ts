import { ImageAsset, ImageCategory, PhotographicDirection } from '../types';

/**
 * Generates tailored photographic direction & prompt templates
 * adapted to the specific niche, brand tone, and visual identity.
 */
export function generatePhotographicDirection(
  niche: string,
  companyName: string,
  style: string,
  primaryColors: string,
  services: string[]
): PhotographicDirection {
  const nicheLower = (niche + ' ' + companyName).toLowerCase();

  let styleGuidelines = '';
  let lightingAndMood = '';
  let prohibitedElements: string[] = [];
  let recommendedPrompts: PhotographicDirection['recommendedPrompts'] = [];

  if (nicheLower.includes('odonto') || nicheLower.includes('dentist') || nicheLower.includes('saúde') || nicheLower.includes('clínic')) {
    styleGuidelines = 'Fotografia editorial clínica e humana contemporânea. Foco em naturalidade dos sorrisos, texturas reais de pele e esmalte dental sem aspecto plástico ou alisamento digital excessivo. Ambiente acolhedor com toque de spa moderno.';
    lightingAndMood = 'Iluminação suave difusa (softbox 5500K balanceada com luz natural de janela), sombras sutis, tons quentes e limpos inspirados em verde sálvia e champagne.';
    prohibitedElements = [
      'Modelos com sorrisos artificiais exagerados de banco de imagem barato',
      'Pessoas vestindo jaleco branco brilhante em poses teatrais',
      'Iluminação fria hospitalar azulada ou ambiente estéril',
      'Efeito de lente olho de peixe ou granulação artificial pesada',
    ];
    recommendedPrompts = [
      {
        section: 'Hero Banner Principal',
        promptText: `Cinematic editorial photograph of a modern aesthetic dental clinic lounge in Rio de Janeiro, subtle sage green and warm champagne tones, soft sunlight streaming through floor-to-ceiling windows, minimalist Scandinavian furniture, living indoor plants, elegant architectural design, shot on Hasselblad H6D-100c, 50mm f/2.0, natural depth of field --ar 16:9 --style raw --v 6.1`,
        aspectRatio: '16:9',
        suggestedModel: 'Midjourney v6.1 / FLUX.1',
      },
      {
        section: 'Retrato da Fundadora / Profissional',
        promptText: `Sophisticated professional portrait of an accomplished female dentist in her late 30s, natural warm smile, elegant charcoal scrub with discreet tailored cut, welcoming posture, blurred modern clinic background with soft warm lighting, realistic skin texture with visible pores, no plastic retouching, 85mm portrait lens, f/1.8 --ar 4:5 --style raw --v 6.1`,
        aspectRatio: '4:5',
        suggestedModel: 'Midjourney v6.1 / FLUX.1',
      },
      {
        section: 'Tecnologia & Procedimento (Scanner 3D)',
        promptText: `Close-up macro shot of modern dental 3D intraoral scanner pen resting on minimalist matte table, ambient glowing screen in soft focus, pristine clean clinical aesthetic, luxury medical photography, sharp focus, 100mm macro lens --ar 1:1 --v 6.1`,
        aspectRatio: '1:1',
        suggestedModel: 'FLUX.1 / Midjourney v6.1',
      },
    ];
  } else if (nicheLower.includes('growth') || nicheLower.includes('tecnologia') || nicheLower.includes('saas') || nicheLower.includes('software')) {
    styleGuidelines = 'Estética contemporânea dark-mode refinada inspirada em Vercel e Stripe. Composições com luz ambiente controlada, monitores de alta resolução e interação analítica real.';
    lightingAndMood = 'Luz indireta azul cobalto e ciano escuro contrastando com tons grafite profundo (#0A0F1D) e iluminação de contorno sutil.';
    prohibitedElements = [
      'Gente apontando para gráficos impressos em pranchetas',
      'Robôs 3D flutuantes brilhantes de stock slop',
      'Pessoas com fones de telemarketing genéricas',
      'Aperto de mão corporativo sobre mesas de vidro',
    ];
    recommendedPrompts = [
      {
        section: 'Hero Banner Principal',
        promptText: `Moody atmospheric photograph of a high-tech strategy war room at dusk, sleek dark carbon minimalist desks, ultrawide curved monitors displaying subtle financial analytics graphs in cyan and indigo, soft atmospheric ambient glow, cinematic composition, shot on Leica SL2, 35mm f/1.4 --ar 16:9 --style raw --v 6.1`,
        aspectRatio: '16:9',
        suggestedModel: 'Midjourney v6.1 / FLUX.1',
      },
      {
        section: 'Equipe de Estratégia',
        promptText: `Authentic candid photograph of two senior software and growth engineers collaborating over laptop in modern architectural loft, genuine concentration, stylish casual tech attire, volumetric soft rim lighting, editorial documentary photography style --ar 3:2 --v 6.1`,
        aspectRatio: '3:2',
        suggestedModel: 'FLUX.1 / Midjourney v6.1',
      },
    ];
  } else if (nicheLower.includes('advoca') || nicheLower.includes('jurídic') || nicheLower.includes('direito')) {
    styleGuidelines = 'Fotografia institucional sóbria, elegante e imponente. Valorização de materiais nobres (madeira maciça, couro escuro, acabamento em latão escovado e estantes de livros encadernados).';
    lightingAndMood = 'Iluminação suave direcional, contraste cinematográfico controlado, tons quentes e neutros transmitindo solidez e confidencialidade.';
    prohibitedElements = [
      'Martelos de juiz de madeira baratos em poses forçadas',
      'Balança da justiça genérica em 3D brilhante',
      'Advogados engravatados com braços cruzados olhando bravos para a câmera',
    ];
    recommendedPrompts = [
      {
        section: 'Hero Banner Principal',
        promptText: `Architectural photograph of a distinguished law firm partner meeting room overlooking city skyline at golden hour, dark walnut conference table, subtle leather armchairs, quiet luxury aesthetic, soft natural light, Hasselblad 45mm, high dynamic range --ar 16:9 --v 6.1`,
        aspectRatio: '16:9',
        suggestedModel: 'Midjourney v6.1 / FLUX.1',
      },
    ];
  } else {
    // Default universal premium
    styleGuidelines = `Direção fotográfica com autenticidade documental para ${companyName}. Priorizar profissionais reais no exercício de suas atividades, planos médios com profundidade de campo agradável e paleta coerente com ${primaryColors || 'a marca'}.`;
    lightingAndMood = 'Iluminação natural limpa, sombras suaves, temperatura de cor neutra (5000K), saturação equilibrada sem superexposição.';
    prohibitedElements = [
      'Fotos genéricas de banco de imagens desprovidas de contexto real',
      'Sorrisos artificiais congelados e poses plásticas',
      'Filtros de saturação excessiva ou vinhetas escuras artificiais',
    ];
    recommendedPrompts = [
      {
        section: 'Hero Banner Principal',
        promptText: `Editorial environmental photograph representing ${companyName} in ${niche}, authentic setting with natural sunlight, refined color harmony featuring ${primaryColors || 'neutral and elegant tones'}, professional framing, shot on Sony A7R V, 35mm f/1.8, cinematic documentary feel --ar 16:9 --v 6.1`,
        aspectRatio: '16:9',
        suggestedModel: 'Midjourney v6.1 / FLUX.1',
      },
    ];
  }

  return {
    styleGuidelines,
    lightingAndMood,
    aspectRatios: ['16:9 para Hero e Banners', '4:5 para Retratos e Fundadores', '1:1 para Cards de Serviços', '3:2 para Galeria de Espaço/Produtos'],
    prohibitedElements,
    recommendedPrompts,
  };
}

/**
 * Compresses an image client-side using an HTML5 Canvas to keep
 * file size minimal (typically 40-120KB) so localStorage doesn't bloat.
 */
export async function processAndCompressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.82): Promise<{ dataUrl: string; width: number; height: number; sizeFormatted: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagem inválido'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Resize proportionally if dimensions exceed max
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível inicializar canvas 2D'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use image/webp if supported, or image/jpeg
        const mimeType = 'image/webp';
        let dataUrl = canvas.toDataURL(mimeType, quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Format approx size in KB
        const approxBytes = Math.round((dataUrl.length * 3) / 4);
        const sizeFormatted = approxBytes > 1024 * 1024 ? `${(approxBytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(approxBytes / 1024)} KB`;

        resolve({ dataUrl, width, height, sizeFormatted });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
