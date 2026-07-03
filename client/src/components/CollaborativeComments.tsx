import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  avatar: string;
}

interface CollaborativeCommentsProps {
  simulationId: string;
  isShared?: boolean;
}

export default function CollaborativeComments({
  simulationId,
  isShared = false,
}: CollaborativeCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [showAuthorInput, setShowAuthorInput] = useState(!authorName);

  // Carregar comentários do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`comments_${simulationId}`);
      if (saved) {
        setComments(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
  }, [simulationId]);

  // Salvar comentários no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`comments_${simulationId}`, JSON.stringify(comments));
    } catch (error) {
      console.error('Erro ao salvar comentários:', error);
    }
  }, [comments, simulationId]);

  const getAvatarColor = (name: string) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleAddComment = () => {
    if (!authorName.trim()) {
      toast.error('Por favor, digite seu nome');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Por favor, digite um comentário');
      return;
    }

    const comment: Comment = {
      id: `${Date.now()}`,
      author: authorName,
      text: newComment,
      timestamp: Date.now(),
      avatar: getAvatarColor(authorName),
    };

    setComments([...comments, comment]);
    setNewComment('');
    toast.success('Comentário adicionado!');
  };

  const handleDeleteComment = (id: string) => {
    setComments(comments.filter((c) => c.id !== id));
    toast.success('Comentário removido');
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;

    if (diff < 60000) return 'Agora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Card className="border-l-4 border-purple-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-600" />
          Comentários Colaborativos
          {isShared && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Compartilhado</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seção de Entrada de Comentário */}
        <div className="space-y-3 p-4 bg-purple-50 rounded-lg">
          {showAuthorInput ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Seu Nome</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && authorName.trim()) {
                      setShowAuthorInput(false);
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    if (authorName.trim()) {
                      setShowAuthorInput(false);
                    }
                  }}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  OK
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full ${getAvatarColor(authorName)} flex items-center justify-center text-white text-sm font-bold`}>
                  {authorName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{authorName}</span>
                <button
                  onClick={() => setShowAuthorInput(true)}
                  className="text-xs text-purple-600 hover:text-purple-700 ml-auto"
                >
                  Alterar
                </button>
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione um comentário sobre a simulação..."
                className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                rows={3}
              />

              <Button
                onClick={handleAddComment}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Comentário
              </Button>
            </>
          )}
        </div>

        {/* Lista de Comentários */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">
              Nenhum comentário ainda. Seja o primeiro a comentar!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full ${comment.avatar} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {comment.author.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{comment.author}</span>
                      <span className="text-xs text-gray-500">{formatTime(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 break-words">{comment.text}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                    title="Remover comentário"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Informações */}
        <div className="bg-purple-50 p-3 rounded-md border border-purple-200">
          <p className="text-xs text-purple-800">
            <strong>💬 Dica:</strong> Os comentários são salvos localmente e compartilhados 
            com qualquer pessoa que acesse o link de compartilhamento.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
