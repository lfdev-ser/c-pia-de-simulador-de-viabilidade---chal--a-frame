import { getDb } from './db';
import { adCampaigns, adCreatives, adImpressions, adFrequencyLogs, sponsors } from '../drizzle/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

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

  if (campaigns.length === 0) {
    // Fallback inteligente: se não houver campanhas ativas no ad engine, buscar patrocinadores ativos diretamente cadastrados
    const activeSponsors = await db.select()
      .from(sponsors)
      .where(eq(sponsors.isActive, 1))
      .orderBy(sponsors.displayOrder);

    if (activeSponsors.length > 0) {
      // Selecionar de forma determinística/pseudorrandômica baseada no slotCode ou índice
      const slotIndex = parseInt(slotCode.replace(/\D/g, ''), 10) || 1;
      const sponsor = activeSponsors[(slotIndex - 1) % activeSponsors.length];
      return {
        campaignId: 999999,
        creativeId: 999999,
        slotCode,
        title: sponsor.title,
        description: sponsor.description,
        imageUrl: sponsor.imageUrl && sponsor.imageUrl.trim().length > 0 
          ? sponsor.imageUrl 
          : 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=640&q=80',
        destinationUrl: sponsor.website || sponsor.externalLink,
        ctaText: "Visite o Site",
        sponsorName: sponsor.name,
        sponsorAddress: sponsor.address,
        sponsorPhone: sponsor.phone,
        matchType: "DIRECT_FALLBACK",
      };
    }

    return null;
  }

  const eligibleCampaigns = [];

  for (const camp of campaigns) {
    const sessionId = userContext.sessionId || 'default_session';

    // 1. Frequency Capping rigoroso (diário por sessão)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [impressionsToday] = await db.select({ count: sql<number>`count(*)` })
      .from(adFrequencyLogs)
      .where(and(
        eq(adFrequencyLogs.campaignId, camp.id),
        eq(adFrequencyLogs.sessionId, sessionId),
        gte(adFrequencyLogs.timestamp, todayStart)
      ));

    if ((impressionsToday?.count || 0) >= camp.frequencyCapPerDay) {
      continue; // Atingiu o limite diário de frequência
    }

    // 2. Geolocalização e Planos (CITY, REGIONAL, STATE, NATIONAL)
    let geoScore = 10;
    let matchType = 'NATIONAL';

    const userCity = (userContext.city || '').trim().toLowerCase();
    const userState = (userContext.state || '').trim().toLowerCase();
    const targetCity = (camp.targetCity || '').trim().toLowerCase(); // Pode conter cidades separadas por vírgula para REGIONAL
    const targetState = (camp.targetState || '').trim().toLowerCase();

    if (camp.planType === 'CITY' && targetCity && userCity && targetCity === userCity) {
      geoScore = 100;
      matchType = 'CITY';
    } else if (camp.planType === 'REGIONAL' && targetCity) {
      const citiesList = targetCity.split(',').map(c => c.trim().toLowerCase());
      if (userCity && citiesList.includes(userCity)) {
        geoScore = 90;
        matchType = 'REGIONAL_MATCH';
      } else {
        continue; // Fora das cidades regionais contratadas
      }
    } else if (camp.planType === 'STATE' && targetState && userState && targetState === userState) {
      geoScore = 75;
      matchType = 'STATE';
    } else if (camp.planType === 'NATIONAL') {
      geoScore = 40;
      matchType = 'NATIONAL';
    } else if (camp.planType === 'CITY' || camp.planType === 'STATE' || camp.planType === 'REGIONAL') {
      // Fora da geolocalização segmentada exigida
      continue;
    }

    // 3. Sponsor Score / Ranking ponderado (Geolocalização 50%, Prioridade 30%, Orçamento 20%)
    const budgetBonus = Number(camp.budget) > 0 ? 20 : 0;
    const score = (geoScore * 0.5) + (camp.priority * 0.3) + budgetBonus;

    eligibleCampaigns.push({
      campaign: camp,
      score,
      matchType,
    });
  }

  if (eligibleCampaigns.length === 0) return null;

  // 4. Rotação ponderada (introduz fator estocástico suave para distribuição justa)
  eligibleCampaigns.sort((a, b) => {
    const randomA = a.score * (0.85 + Math.random() * 0.3);
    const randomB = b.score * (0.85 + Math.random() * 0.3);
    return randomB - randomA;
  });

  const selected = eligibleCampaigns[0];

  // Buscar criativo ativo
  const [creative] = await db.select()
    .from(adCreatives)
    .where(and(
      eq(adCreatives.campaignId, selected.campaign.id),
      eq(adCreatives.status, 'ACTIVE')
    ))
    .limit(1);

  if (!creative) return null;

  // Buscar patrocinador
  const [sponsor] = await db.select()
    .from(sponsors)
    .where(eq(sponsors.id, selected.campaign.sponsorId))
    .limit(1);

  // Registrar log de frequência para o cap
  await db.insert(adFrequencyLogs).values({
    campaignId: selected.campaign.id,
    sessionId: userContext.sessionId || 'default_session',
    slotCode,
  });

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
