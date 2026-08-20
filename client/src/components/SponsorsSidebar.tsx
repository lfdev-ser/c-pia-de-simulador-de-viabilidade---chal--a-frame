import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Award, MapPin, Phone, Globe, Loader2 } from 'lucide-react';

export function SponsorsSidebar() {
  // Estado para controlar quantos slots carregar progressivamente (lazy loading conforme o relatório)
  const [visibleSlots, setVisibleSlots] = useState<string[]>(['RIGHT_SLOT_001', 'RIGHT_SLOT_002']);
  const [sessionId] = useState(() => `sess_${Math.random().toString(36).substring(2)}`);

  // Ouvir o evento de scroll para carregar novos slots progressivamente
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 300;
      if (scrollPosition >= threshold) {
        // Adicionar novos slots progressivamente se houver menos de 5 carregados
        setVisibleSlots(prev => {
          if (prev.length < 5) {
            const nextIndex = prev.length + 1;
            return [...prev, `RIGHT_SLOT_00${nextIndex}`];
          }
          return prev;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <aside className="w-full xl:w-80 flex-shrink-0 space-y-4">
      <div className="bg-gradient-to-r from-emerald-700 to-green-800 text-white p-3 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          <h3 className="font-bold text-sm tracking-tight">Inventário Publicitário</h3>
        </div>
        <span className="text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">
          Patrocinado
        </span>
      </div>

      <div className="space-y-4">
        {visibleSlots.map((slotCode, index) => (
          <AdSlotCard key={slotCode} slotCode={slotCode} sessionId={sessionId} priorityIndex={index + 1} />
        ))}
      </div>
    </aside>
  );
}

function AdSlotCard({ slotCode, sessionId, priorityIndex }: { slotCode: string; sessionId: string; priorityIndex: number }) {
  const utils = trpc.useUtils();
  const { data: ad, isLoading } = trpc.ads.getSlotAd.useQuery({
    slotCode,
    sessionId,
  });

  const recordImpressionMutation = trpc.ads.recordImpression.useMutation();
  const recordClickMutation = trpc.ads.recordClick.useMutation();

  useEffect(() => {
    if (ad && ad.campaignId && ad.creativeId) {
      recordImpressionMutation.mutate({
        campaignId: ad.campaignId,
        creativeId: ad.creativeId,
        slotCode,
        sessionId,
      });
    }
  }, [ad?.campaignId]);

  if (isLoading) {
    return (
      <Card className="bg-white border-slate-200 rounded-2xl p-6 flex items-center justify-center min-h-[220px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </Card>
    );
  }

  if (!ad) {
    // Fallback para patrocinador padrão caso o ad manager não retorne anúncio ativo
    return (
      <Card className="bg-slate-50 border-dashed border-slate-200 rounded-2xl p-5 text-center text-slate-400">
        <p className="text-xs">Espaço Publicitário Disponível ({slotCode})</p>
        <p className="text-[10px] text-slate-400 mt-1">Anuncie sua marca aqui</p>
      </Card>
    );
  }

  const handleClick = () => {
    recordClickMutation.mutate({
      campaignId: ad.campaignId,
      creativeId: ad.creativeId,
      slotCode,
      sessionId,
    });
  };

  const rawImageUrl = typeof ad.imageUrl === 'string' && ad.imageUrl.trim().length > 0
    ? ad.imageUrl.trim()
    : null;
  const imageUrl = rawImageUrl ? encodeURI(rawImageUrl) : null;

  return (
    <Card className="bg-white border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden flex flex-col">
      <div className="relative h-36 bg-white border-b border-slate-100 flex items-center justify-center p-3">
        {imageUrl ? (
          ad.destinationUrl ? (
            <a 
              href={ad.destinationUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full h-full flex items-center justify-center cursor-pointer group"
              title={`Visitar site de ${ad.sponsorName}`}
            >
              <img
                src={imageUrl}
                alt={ad.title}
                className="max-h-full max-w-full object-contain object-center group-hover:scale-105 transition-transform duration-200"
              />
            </a>
          ) : (
            <img
              src={imageUrl}
              alt={ad.title}
              className="max-h-full max-w-full object-contain object-center"
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">
            Imagem não cadastrada
          </div>
        )}
        <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
          Patrocinado • {ad.sponsorName}
        </div>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2">{ad.title}</h4>
          {ad.description && (
            <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed mb-2">{ad.description}</p>
          )}

          <div className="space-y-1 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            {ad.sponsorAddress && (
              <div className="flex items-start gap-1">
                <MapPin className="w-3 h-3 text-emerald-700 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{ad.sponsorAddress}</span>
              </div>
            )}
            {ad.sponsorPhone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-700 shrink-0" />
                <span>{ad.sponsorPhone}</span>
              </div>
            )}
          </div>
        </div>

        {ad.destinationUrl && (
          <a
            href={ad.destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            <span>{ad.ctaText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}
