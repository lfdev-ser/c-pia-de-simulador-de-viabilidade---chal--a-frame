import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award, Plus, Trash2, ExternalLink, Image as ImageIcon, Loader2, CheckCircle2, XCircle, MapPin, Globe, Phone } from 'lucide-react';
import { toast } from 'sonner';

export function SponsorsAdminPanel() {
  const utils = trpc.useUtils();
  const { data: sponsors = [], isLoading } = trpc.admin.listAllSponsors.useQuery();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = trpc.admin.uploadSponsor.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      utils.admin.listAllSponsors.invalidate();
      utils.admin.listSponsors.invalidate();
      resetForm();
    },
    onError: (err) => {
      toast.error(`Erro ao cadastrar: ${err.message}`);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const updateMutation = trpc.admin.updateSponsor.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      utils.admin.listAllSponsors.invalidate();
      utils.admin.listSponsors.invalidate();
      resetForm();
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar: ${err.message}`);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const deleteMutation = trpc.admin.deleteSponsor.useMutation({
    onSuccess: () => {
      toast.success('Patrocinador removido com sucesso!');
      utils.admin.listAllSponsors.invalidate();
      utils.admin.listSponsors.invalidate();
    },
    onError: (err) => {
      toast.error(`Erro ao remover: ${err.message}`);
    },
  });

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setTitle('');
    setDescription('');
    setExternalLink('');
    setAddress('');
    setWebsite('');
    setPhone('');
    setDisplayOrder('0');
    setIsActive(true);
    setSelectedFile(null);
  };

  const handleEditClick = (sponsor: any) => {
    setEditingId(sponsor.id);
    setName(sponsor.name);
    setTitle(sponsor.title);
    setDescription(sponsor.description || '');
    setExternalLink(sponsor.externalLink || '');
    setAddress(sponsor.address || '');
    setWebsite(sponsor.website || '');
    setPhone(sponsor.phone || '');
    setDisplayOrder(String(sponsor.displayOrder ?? 0));
    setIsActive(sponsor.isActive === 1);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim()) {
      toast.error('Preencha o nome e o título.');
      return;
    }

    if (!editingId && !selectedFile) {
      toast.error('Selecione uma imagem para o novo patrocinador.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        if (selectedFile) {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64String = (reader.result as string).split(',')[1];
            // Se houver nova imagem, podemos atualizar incluindo a nova imagem através de upload ou requisição
            // Para manter simples, enviamos os dados e a imagem nova
            await updateMutation.mutateAsync({
              id: editingId,
              name: name.trim(),
              title: title.trim(),
              description: description.trim() || undefined,
              externalLink: externalLink.trim() || undefined,
              address: address.trim() || undefined,
              website: website.trim() || undefined,
              phone: phone.trim() || undefined,
              displayOrder: parseInt(displayOrder) || 0,
              isActive: isActive ? 1 : 0,
            });
          };
          reader.readAsDataURL(selectedFile);
        } else {
          await updateMutation.mutateAsync({
            id: editingId,
            name: name.trim(),
            title: title.trim(),
            description: description.trim() || undefined,
            externalLink: externalLink.trim() || undefined,
            address: address.trim() || undefined,
            website: website.trim() || undefined,
            phone: phone.trim() || undefined,
            displayOrder: parseInt(displayOrder) || 0,
            isActive: isActive ? 1 : 0,
          });
        }
      } else {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64String = (reader.result as string).split(',')[1];
          await createMutation.mutateAsync({
            name: name.trim(),
            title: title.trim(),
            description: description.trim() || undefined,
            externalLink: externalLink.trim() || undefined,
            address: address.trim() || undefined,
            website: website.trim() || undefined,
            phone: phone.trim() || undefined,
            displayOrder: parseInt(displayOrder) || 0,
            isActive: isActive ? 1 : 0,
            fileName: selectedFile!.name,
            fileBase64: base64String,
            contentType: selectedFile!.type,
          });
        };
        reader.readAsDataURL(selectedFile!);
      }
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white border-[#e8e6e1] shadow-md rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-700 text-white rounded-xl shadow-sm">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Gerenciar Patrocinadores</CardTitle>
            <p className="text-xs text-slate-500">Cadastre marcas parceiras com logo, endereço, site e telefone.</p>
          </div>
        </div>
        <Button
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Novo Patrocinador
        </Button>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {isAdding && (
          <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-700" /> {editingId ? 'Editar Patrocinador' : 'Adicionar Novo Patrocinador'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Empresa / Parceiro *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Construtora EPS Sul"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Post Patrocinado *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Blocos ICF com 10% de desconto"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição Curta</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve mensagem ou chamada para ação do patrocinador..."
                rows={2}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço Completo</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Av. Central, 1000 - São Paulo/SP"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Site / URL</label>
                <Input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://suamarca.com.br"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Link do Botão de Ação</label>
                <Input
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ordem de Exibição</label>
                <Input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Logo / Banner (Imagem) {editingId ? '(opcional)' : '*'}</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  required={!editingId}
                  className="text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                <p className="text-[10px] text-slate-500 mt-1">Recomendado: formato horizontal ou quadrado (ex: 400x300px).</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="isActive" className="text-xs font-medium text-slate-700">
                Patrocinador Ativo (visível no simulador)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting} className="text-xs">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold">
                {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Salvando...</> : (editingId ? 'Atualizar Patrocinador' : 'Salvar Patrocinador')}
              </Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : sponsors.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Award className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Nenhum patrocinador cadastrado</p>
            <p className="text-xs text-slate-500 mt-1">Clique em "Novo Patrocinador" para adicionar a primeira marca parceira.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sponsors.map((sponsor: any) => (
              <div key={sponsor.id} className="flex gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl items-center">
                <div className="w-24 h-24 rounded-xl bg-white border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-2 shadow-xs">
                  <img src={sponsor.imageUrl} alt={sponsor.title} className="w-full h-full object-contain object-center" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-800 rounded-full">{sponsor.name}</span>
                    {sponsor.isActive === 1 ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Ativo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-amber-700 font-semibold">
                        <XCircle className="w-3 h-3" /> Inativo
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate">{sponsor.title}</h4>
                  {sponsor.address && (
                    <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {sponsor.address}
                    </p>
                  )}
                  {sponsor.phone && (
                    <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5 truncate">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {sponsor.phone}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(sponsor)}
                    className="text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 p-2"
                    title="Editar patrocinador"
                  >
                    ✏️
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja remover o patrocinador "${sponsor.name}"?`)) {
                        deleteMutation.mutate({ id: sponsor.id });
                      }
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                    title="Excluir patrocinador"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
