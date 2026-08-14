import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Image, Video, FileText, Layers, Plus, Trash2, Edit3, ExternalLink, Loader2, Sparkles, UploadCloud, X, Maximize2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface IcfWorksGalleryProps {
  isAdmin: boolean;
}

export function IcfWorksGallery({ isAdmin }: IcfWorksGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'chalet' | 'blocks' | 'folder' | 'video'>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Upload Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'chalet' | 'blocks' | 'folder' | 'video'>('chalet');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Edit states
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Lightbox state
  const [lightboxItem, setLightboxItem] = useState<any | null>(null);

  const worksQuery = trpc.admin.listWorks.useQuery(undefined, { retry: false });
  const uploadWorkMutation = trpc.admin.uploadWork.useMutation();
  const updateWorkMutation = trpc.admin.updateWork.useMutation();
  const deleteWorkMutation = trpc.admin.deleteWork.useMutation();
  const utils = trpc.useUtils();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 25 * 1024 * 1024) {
        toast.error('O arquivo é muito grande. O limite máximo é 25MB.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedFile) {
      toast.error('Preencha o título e selecione um arquivo.');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Enviando arquivo para o servidor...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Result = reader.result as string;
          const base64Data = base64Result.includes(',') ? base64Result.split(',')[1] : base64Result;

          await uploadWorkMutation.mutateAsync({
            title: title.trim(),
            description: description.trim(),
            category,
            fileName: selectedFile.name,
            fileBase64: base64Data,
            contentType: selectedFile.type || 'application/octet-stream',
          });

          await utils.admin.listWorks.invalidate();
          toast.dismiss(toastId);
          toast.success('Arquivo enviado com sucesso!');
          
          setTitle('');
          setDescription('');
          setSelectedFile(null);
          setIsAdding(false);
        } catch (err: any) {
          toast.dismiss(toastId);
          toast.error(err.message || 'Erro ao salvar o arquivo.');
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        toast.dismiss(toastId);
        toast.error('Erro ao ler o arquivo.');
        setUploading(false);
      };

      reader.readAsDataURL(selectedFile);
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message || 'Erro inesperado.');
      setUploading(false);
    }
  };

  const handleUpdateWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editTitle.trim()) return;

    try {
      await updateWorkMutation.mutateAsync({
        id: editingItem.id,
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      await utils.admin.listWorks.invalidate();
      toast.success('Item atualizado com sucesso!');
      setEditingItem(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar item.');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Portfólio & Materiais ICF
          </div>
          <h2 className="text-3xl font-black text-slate-900">Obras ICF & Galeria</h2>
          <p className="text-sm text-slate-600">Fotos de chalés, blocos EPS, folders e vídeos. Clique em qualquer foto ou vídeo para ampliar.</p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> {isAdding ? 'Fechar Formulário' : 'Adicionar Novo Arquivo'}
          </Button>
        )}
      </div>

      {/* Admin Upload Form */}
      {isAdmin && isAdding && (
        <Card className="bg-white border-emerald-300 shadow-lg">
          <CardHeader className="border-b bg-emerald-50/70">
            <CardTitle className="text-lg font-bold text-emerald-900 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-emerald-600" /> Upload Direto de Arquivo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUploadWork} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Título da Obra ou Material</label>
                  <Input
                    placeholder="Ex: Chalé A-frame 8x8m ou Bloco EPS 1.25m"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Categoria</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="chalet">Chalé A-frame (Obra Realizada)</option>
                    <option value="blocks">Blocos de EPS (Fotos)</option>
                    <option value="folder">Folders & Catálogos (PDF/Img)</option>
                    <option value="video">Vídeos Explicativos</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Selecione o Arquivo (Foto, Vídeo ou PDF)</label>
                <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/30 rounded-xl p-6 text-center hover:bg-emerald-50/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*,video/*,.pdf"
                    onChange={handleFileChange}
                    required
                    className="w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                  />
                  {selectedFile && (
                    <p className="text-xs font-semibold text-emerald-700 mt-2">
                      Selecionado: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Descrição (Opcional)</label>
                <Textarea
                  placeholder="Ex: Obra finalizada em Santa Catarina com acabamento ICFlex..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)} disabled={uploading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={uploading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 min-w-[140px]">
                  {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : 'Salvar na Galeria'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal/Card */}
      {editingItem && (
        <Card className="bg-white border-purple-300 shadow-xl">
          <CardHeader className="border-b bg-purple-50">
            <CardTitle className="text-lg font-bold text-purple-900">Editar Título / Descrição</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpdateWork} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Novo Título</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Nova Descrição</label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateWorkMutation.isPending} className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                  {updateWorkMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Salvar Alterações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar galeria por tipo de mídia">
          <button
            type="button"
            aria-pressed={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${selectedCategory === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
          >
            Todos ({works.length})
          </button>
          <button
            type="button"
            aria-pressed={selectedCategory === 'chalet'}
            onClick={() => setSelectedCategory('chalet')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${selectedCategory === 'chalet' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
          >
            <Image className="w-3.5 h-3.5" /> Chalés ICF ({works.filter((w: any) => w.category === 'chalet').length})
          </button>
          <button
            type="button"
            aria-pressed={selectedCategory === 'blocks'}
            onClick={() => setSelectedCategory('blocks')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${selectedCategory === 'blocks' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
          >
            <Layers className="w-3.5 h-3.5" /> Blocos EPS ({works.filter((w: any) => w.category === 'blocks').length})
          </button>
          <button
            type="button"
            aria-pressed={selectedCategory === 'folder'}
            onClick={() => setSelectedCategory('folder')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${selectedCategory === 'folder' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
          >
            <FileText className="w-3.5 h-3.5" /> Folders & Manuais ({works.filter((w: any) => w.category === 'folder').length})
          </button>
          <button
            type="button"
            aria-pressed={selectedCategory === 'video'}
            onClick={() => setSelectedCategory('video')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${selectedCategory === 'video' ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
          >
            <Video className="w-3.5 h-3.5" /> Vídeos ({works.filter((w: any) => w.category === 'video').length})
          </button>
        </div>
        <p className="text-xs text-slate-500" aria-live="polite">
          Exibindo <strong className="text-slate-700">{filteredWorks.length}</strong> de <strong className="text-slate-700">{works.length}</strong> arquivo(s)
          {selectedCategory !== 'all' && ' nesta categoria.'}
        </p>
      </div>

      {/* Gallery Grid */}
      {worksQuery.isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        </div>
      ) : filteredWorks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorks.map((item: any) => {
            const mediaUrl = typeof item.mediaUrl === 'string' && item.mediaUrl.trim().length > 0
              ? item.mediaUrl.trim()
              : null;
            return (
              <Card key={item.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                <div 
                  className="relative aspect-video bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer group"
                  onClick={() => setLightboxItem(item)}
                >
                  {item.category === 'video' && mediaUrl ? (
                    <video src={mediaUrl} className="w-full h-full object-cover bg-black" />
                  ) : item.category === 'folder' ? (
                    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-700 p-4 border-b">
                      <FileText className="w-12 h-12 text-emerald-600 mb-2" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">PDF / Folder</span>
                    </div>
                  ) : mediaUrl ? (
                    <img src={mediaUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="text-xs font-semibold text-slate-400">Arquivo sem imagem</div>
                  )}

                {/* Hover overlay for zoom */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold text-xs">
                  <Maximize2 className="w-5 h-5" /> Ampliar em Tela Cheia
                </div>

                <span className="absolute top-3 right-3 bg-slate-900/80 text-white px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-xs uppercase tracking-wider pointer-events-none">
                  {item.category === 'chalet' ? 'Chalé' : item.category === 'blocks' ? 'Bloco' : item.category === 'folder' ? 'Folder' : 'Vídeo'}
                </span>
              </div>

              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-base text-slate-900 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description || 'Sem descrição informada.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <a href={item.mediaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800">
                    Abrir Link <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingItem(item);
                          setEditTitle(item.title);
                          setEditDescription(item.description || '');
                        }}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-8 px-2"
                        title="Renomear / Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteWork(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-white border-dashed border-2 border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-700">Nenhum arquivo cadastrado</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isAdmin ? 'Clique em "Adicionar Novo Arquivo" para enviar fotos ou vídeos.' : 'Em breve novos arquivos serão adicionados.'}
          </p>
        </Card>
      )}

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setLightboxItem(null)}
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-5xl w-full max-h-[80vh] flex flex-col items-center justify-center">
            {lightboxItem.category === 'video' ? (
              <video src={lightboxItem.mediaUrl || undefined} controls autoPlay className="max-w-full max-h-[70vh] rounded-lg shadow-2xl bg-black" />
            ) : lightboxItem.category === 'folder' ? (
              <div className="bg-white p-12 rounded-xl text-center space-y-4 max-w-md">
                <FileText className="w-16 h-16 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-xl text-slate-900">{lightboxItem.title}</h3>
                <p className="text-sm text-slate-600">{lightboxItem.description || 'Documento PDF em formato de folder.'}</p>
                <a href={lightboxItem.mediaUrl || undefined} target="_blank" rel="noopener noreferrer" className="inline-block bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-lg shadow-md hover:bg-emerald-700">
                  Baixar / Abrir PDF em Nova Aba
                </a>
              </div>
            ) : (
              <img src={lightboxItem.mediaUrl || undefined} alt={lightboxItem.title} className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl" />
            )}

            <div className="mt-4 text-center text-white space-y-1">
              <h3 className="font-bold text-lg">{lightboxItem.title}</h3>
              {lightboxItem.description && <p className="text-sm text-slate-300">{lightboxItem.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
