import React from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Award, MapPin, Phone, Globe } from 'lucide-react';

export function SponsorsSidebar() {
  const { data: sponsors = [], isLoading } = trpc.admin.listSponsors.useQuery();

  if (isLoading || sponsors.length === 0) {
    return null;
  }

  return (
    <aside className="w-full xl:w-80 flex-shrink-0 space-y-4">
      <div className="bg-gradient-to-r from-emerald-700 to-green-800 text-white p-3 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          <h3 className="font-bold text-sm tracking-tight">Parceiros Oficiais</h3>
        </div>
        <span className="text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">
          Patrocínio
        </span>
      </div>

      <div className="space-y-4">
        {sponsors.map((sponsor: any) => {
          const cardContent = (
            <Card className="bg-white border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden flex flex-col">
              {sponsor.imageUrl && (
                <div className="relative h-36 bg-white border-b border-slate-100 flex items-center justify-center p-3">
                  <img
                    src={sponsor.imageUrl}
                    alt={sponsor.title}
                    className="max-h-full max-w-full object-contain object-center"
                  />
                  <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {sponsor.name}
                  </div>
                </div>
              )}
              <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  {!sponsor.imageUrl && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full inline-block mb-1.5">
                      {sponsor.name}
                    </span>
                  )}
                  <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2">{sponsor.title}</h4>
                  {sponsor.description && (
                    <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed mb-2">{sponsor.description}</p>
                  )}

                  <div className="space-y-1 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    {sponsor.address && (
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-emerald-700 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{sponsor.address}</span>
                      </div>
                    )}
                    {sponsor.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-700 shrink-0" />
                        <span>{sponsor.phone}</span>
                      </div>
                    )}
                    {sponsor.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-emerald-700 shrink-0" />
                        <span className="truncate text-emerald-700 font-medium">{sponsor.website}</span>
                      </div>
                    )}
                  </div>
                </div>

                {sponsor.externalLink && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 pt-2 border-t border-slate-100">
                    <span>Acessar parceiro</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                )}
              </CardContent>
            </Card>
          );

          if (sponsor.externalLink) {
            return (
              <a
                key={sponsor.id}
                href={sponsor.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-2xl"
              >
                {cardContent}
              </a>
            );
          }

          return <div key={sponsor.id}>{cardContent}</div>;
        })}
      </div>
    </aside>
  );
}
