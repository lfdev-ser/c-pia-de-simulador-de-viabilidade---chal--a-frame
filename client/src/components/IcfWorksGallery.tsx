import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Image, Video, FileText, Layers, Plus, Trash2, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface IcfWorksGalleryProps {
  isAdmin: boolean;
}

export function IcfWorksGallery({ isAdmin }: IcfWorksGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'chalet' | 'blocks' | 'folder' | 'video'>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form states for admin
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'chalet' | 'blocks' | 'folder' | 'video'>('chalet');
  const [mediaUrl, setMediaUrl] = useState('');

  const worksQuery = trpc.admin.listWorks.useQuery(undefined, { retry: false });
  const createWorkMutation = trpc.admin.createWork.useMutation();
  const deleteWorkMutation = trpc.admin.deleteWork.useMutation();
  const utils = trpc.useUtils();

  const handleCreateWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !mediaUrl) {
      toast.error('Preencha o título e a URL da mídia.');
      return;
    }
    try {
      await createWorkMutation.mutateAsync({
        title,
        description,
        category,
        mediaUrl,
      });
      await utils.admin.listWorks.invalidate();
      toast.success('Obra/Mídia adicionada com sucesso!');
      setTitle('');
      setDescription('');
      setMediaUrl('');
      setIsAdding(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar obra/mídia.');
    }
  };

  const handleDeleteWork = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja remover este item da galeria?')) return;
    try {
      await deleteWorkMutation.mutateAsync({ id });
      await utils.admin.listWorks.invalidate();
      toast.success('Item removido com sucesso.');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover item.');
    }
  };

  const works = worksQuery.data ?? [];
  const filteredWorks = selectedCategory === 'all' 
    ? works 
    : works.filter((w: any) => w.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Portfólio & Materiais ICF
          </div>
          <h2 className="text-3xl font-black text-slate-900">Obras ICF & Galeria</h2>
          <p className="text-sm text-slate-600">Explore chalés realizados, fotos dos blocos EPS, folders técnicos e vídeos explicativos.</p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> {isAdding ? 'Cancelar' : 'Adicionar Nova Mídia'}
          </Button>
        )}
      </div>

      {/* Admin Add Form Modal/Card */}
      {isAdmin && isAdding && (
        <Card className="bg-white border-emerald-200 shadow-md">
          <CardHeader className="border-b bg-emerald-50/50">
            <CardTitle className="text-lg font-bold text-emerald-900">Cadastrar Novo Item na Galeria</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateWork} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Título da Obra / Mídia</label>
                  <Input
                    placeholder="Ex: Chalé A-frame Serra 8x8m"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Categoria</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="chalet">Chalé A-frame (Obra)</option>
                    <option value="blocks">Blocos de EPS (Fotos)</option>
                    <option value="folder">Folders & Catálogos (PDF/Img)</option>
                    <option value="video">Vídeos Explicativos</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">URL da Mídia (Imagem, Vídeo ou Folder)</label>
                <Input
                  placeholder="https://exemplo.com/imagem.jpg ou link do YouTube/S3"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Descrição (Opcional)</label>
                <Textarea
                  placeholder="Detalhes sobre a obra, especificações dos blocos ou resumo do folder..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createWorkMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
                >
                  {createWorkMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Salvar na Galeria
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${selectedCategory === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
        >
          Todos os Itens ({works.length})
        </button>
        <button
          onClick={() => setSelectedCategory('chalet')}
          className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${selectedCategory === 'chalet' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
        >
          <Image className="w-3.5 h-3.5" /> Chalés ICF
        </button>
        <button
          onClick={() => setSelectedCategory('blocks')}
          className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${selectedCategory === 'blocks' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
        >
          <Layers className="w-3.5 h-3.5" /> Blocos EPS
        </button>
        <button
          onClick={() => setSelectedCategory('folder')}
          className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${selectedCategory === 'folder' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
        >
          <FileText className="w-3.5 h-3.5" /> Folders & Manuais
        </button>
        <button
          onClick={() => setSelectedCategory('video')}
          className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${selectedCategory === 'video' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
        >
          <Video className="w-3.5 h-3.5" /> Vídeos
        </button>
      </div>

      {/* Gallery Grid */}
      {worksQuery.isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        </div>
      ) : filteredWorks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorks.map((item: any) => (
            <Card key={item.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="relative aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                {item.category === 'video' ? (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white relative">
                    <Video className="w-12 h-12 text-emerald-400 mb-2" />
                    <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-xs font-semibold">Vídeo Explicativo</span>
                  </div>
                ) : item.category === 'folder' ? (
                  <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-700 p-4 border-b">
                    <FileText className="w-12 h-12 text-emerald-600 mb-2" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Folder Técnico</span>
                  </div>
                ) : (
                  <img
                    src={item.mediaUrl}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback se imagem falhar
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
                <span className="absolute top-3 right-3 bg-slate-900/80 text-white px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-xs uppercase tracking-wider">
                  {item.category === 'chalet' ? 'Chalé' : item.category === 'blocks' ? 'Bloco EPS' : item.category === 'folder' ? 'Folder' : 'Vídeo'}
                </span>
              </div>

              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-base text-slate-900 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description || 'Sem descrição informada para este item.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <a
                    href={item.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    Acessar Mídia <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteWork(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white border-dashed border-2 border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-700">Nenhuma obra ou mídia cadastrada nesta categoria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isAdmin ? 'Utilize o botão "Adicionar Nova Mídia" acima para cadastrar fotos de blocos EPS, chalés ou folders.' : 'Em breve novos conteúdos serão adicionados pela administração.'}
          </p>
        </Card>
      )}
    </div>
  );
}
