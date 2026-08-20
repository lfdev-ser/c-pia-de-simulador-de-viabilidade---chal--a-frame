import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Award, MapPin, Globe, Phone } from 'lucide-react';

function SponsorCarouselCard({ sponsor }: { sponsor: any }) {
  const [imgError, setImgError] = useState(false);
  const rawImageUrl = typeof sponsor.imageUrl === 'string' && sponsor.imageUrl.trim().length > 0
    ? sponsor.imageUrl.trim()
    : null;
  const imageUrl = !imgError && rawImageUrl ? encodeURI(rawImageUrl) : 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=640&q=80';
  const targetUrl = sponsor.website || sponsor.externalLink;
  const tooltipText = targetUrl ? `Visitar site de ${sponsor.name} - ${targetUrl}` : `Patrocínio de ${sponsor.name}`;

  const cardInner = (
    <Card className="h-full bg-white border-emerald-100 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 rounded-2xl overflow-hidden flex flex-col group/card">
      <div className="relative h-48 bg-slate-50 border-b border-slate-100 overflow-hidden flex items-center justify-center p-4">
        {targetUrl ? (
          <div className="w-full h-full flex items-center justify-center relative group">
            <img
              src={imageUrl}
              alt={sponsor.title}
              onError={() => setImgError(true)}
              className="max-h-full max-w-full object-contain object-center group-hover/card:scale-105 transition-transform duration-300 shadow-sm rounded"
            />
            <div className="absolute inset-0 bg-emerald-900/10 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="bg-slate-900/90 text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg backdrop-blur-sm">
                Visitar Site Oficial ↗
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative group">
            <img
              src={imageUrl}
              alt={sponsor.title}
              onError={() => setImgError(true)}
              className="max-h-full max-w-full object-contain object-center shadow-sm rounded"
            />
          </div>
        )}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
          {sponsor.name}
        </div>
      </div>
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h4 className="font-bold text-slate-900 text-base mb-1.5 line-clamp-1 group-hover/card:text-emerald-700 transition-colors">{sponsor.title}</h4>
          {sponsor.description && (
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">{sponsor.description}</p>
          )}

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
            {sponsor.address && (
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{sponsor.address}</span>
              </div>
            )}
            {sponsor.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>{sponsor.phone}</span>
              </div>
            )}
            {sponsor.website && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="truncate text-emerald-700 font-medium">{sponsor.website}</span>
              </div>
            )}
          </div>
        </div>

        {targetUrl && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 group-hover/card:underline pt-2 border-t border-slate-100 mt-auto">
            <span>Visitar site parceiro</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (targetUrl) {
    return (
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-2xl"
        title={tooltipText}
      >
        {cardInner}
      </a>
    );
  }

  return <div title={tooltipText}>{cardInner}</div>;
}

export function SponsorsCarousel() {
  const { data: sponsors = [], isLoading } = trpc.admin.listSponsors.useQuery();

  if (isLoading || sponsors.length === 0) {
    return null;
  }

  return (
    <section className="my-12 py-8 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border border-emerald-100 rounded-3xl px-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-700 text-white rounded-2xl shadow-sm">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Parceiros e Patrocinadores Oficiais</h3>
            <p className="text-sm text-slate-600">Conheça as marcas que apoiam este simulador e tornam a plataforma gratuita.</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
          Espaço Patrocinado
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sponsors.map((sponsor: any) => (
          <SponsorCarouselCard key={sponsor.id} sponsor={sponsor} />
        ))}
      </div>
    </section>
  );
}
