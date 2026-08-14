import { getDb } from './db';
import { adCampaigns, adCreatives, adImpressions, adClicks, sponsors } from '../drizzle/schema';
import { eq, and, lte, gte, sql } from 'drizzle-orm';

export interface UserContext {
  city?: string;
  state?: string;
  country?: string;
  sessionId?: string;
  userId?: number;
}

export async function selectBestAdForSlot(slotCode: string, userContext: UserContext) {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();

  // Buscar campanhas ativas
  const campaigns = await db.select()
    .from(adCampaigns)
    .where(and(
      eq(adCampaigns.status, 'ACTIVE'),
      sql`(${adCampaigns.startAt} IS NULL OR ${adCampaigns.startAt} <= ${now})`,
      sql`(${adCampaigns.endAt} IS NULL OR ${adCampaigns.endAt} >= ${now})`,
      sql`${adCampaigns.impressionsCount} < ${adCampaigns.impressionLimit}`
    ));

  if (campaigns.length === 0) return null;

  const eligibleCampaigns = [];

  for (const camp of campaigns) {
    // Verificar frequency cap por sessão/dia se sessionId fornecido
    if (userContext.sessionId) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [impressionsToday] = await db.select({ count: sql<number>`count(*)` })
        .from(adImpressions)
        .where(and(
          eq(adImpressions.campaignId, camp.id),
          eq(adImpressions.sessionId, userContext.sessionId),
          gte(adImpressions.timestamp, todayStart)
        ));

      if ((impressionsToday?.count || 0) >= camp.frequencyCapPerDay) {
        continue; // Atingiu o limite de frequência diária
      }
    }

    // Calcular pontuação e relevância geográfica
    let geoScore = 10; // Nacional ou fallback
    let matchType = 'NATIONAL';

    const userCity = (userContext.city || '').trim().toLowerCase();
    const userState = (userContext.state || '').trim().toLowerCase();
    const targetCity = (camp.targetCity || '').trim().toLowerCase();
    const targetState = (camp.targetState || '').trim().toLowerCase();

    if (camp.planType === 'CITY' && targetCity && userCity && targetCity === userCity) {
      geoScore = 100;
      matchType = 'CITY';
    } else if (camp.planType === 'STATE' && targetState && userState && targetState === userState) {
      geoScore = 75;
      matchType = 'STATE';
    } else if (camp.planType === 'REGIONAL' && targetCity && userCity && targetCity === userCity) {
      geoScore = 85;
      matchType = 'REGIONAL_MATCH';
    } else if (camp.planType === 'NATIONAL') {
      geoScore = 30;
      matchType = 'NATIONAL';
    } else if (camp.planType === 'CITY' || camp.planType === 'STATE') {
      // Fora da geolocalização segmentada
      continue;
    }

    // Sponsor Score ponderado
    const score = (geoScore * 0.5) + (camp.priority * 0.3) + (Number(camp.budget) > 0 ? 20 : 0);

    eligibleCampaigns.push({
      campaign: camp,
      score,
      matchType,
    });
  }

  if (eligibleCampaigns.length === 0) return null;

  // Ordenar por score ponderado com fator de rotação aleatória ponderada
  eligibleCampaigns.sort((a, b) => {
    const randomWeightA = a.score * (0.8 + Math.random() * 0.4);
    const randomWeightB = b.score * (0.8 + Math.random() * 0.4);
    return randomWeightB - randomWeightA;
  });

  const selected = eligibleCampaigns[0];

  // Buscar criativo ativo da campanha
  const [creative] = await db.select()
    .from(adCreatives)
    .where(and(
      eq(adCreatives.campaignId, selected.campaign.id),
      eq(adCreatives.status, 'ACTIVE')
    ))
    .limit(1);

  if (!creative) return null;

  // Buscar dados do patrocinador
  const [sponsor] = await db.select()
    .from(sponsors)
    .where(eq(sponsors.id, selected.campaign.sponsorId))
    .limit(1);

  return {
    campaignId: selected.campaign.id,
    creativeId: creative.id,
    slotCode,
    title: creative.title,
    description: creative.description || sponsor?.description,
    imageUrl: creative.imageUrl,
    destinationUrl: creative.destinationUrl || sponsor?.website,
    ctaText: creative.ctaText,
    sponsorName: sponsor?.name || 'Patrocinador Oficial',
    sponsorAddress: sponsor?.address,
    sponsorPhone: sponsor?.phone,
    matchType: selected.matchType,
  };
}
