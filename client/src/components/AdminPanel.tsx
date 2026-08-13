import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, UserCheck, UserX, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminPanel({ open, onOpenChange }: AdminPanelProps) {
  const usersQuery = trpc.admin.listUsers.useQuery(undefined, { enabled: open, retry: false });
  const updateRoleMutation = trpc.admin.updateRole.useMutation();
  const utils = trpc.useUtils();

  const handleRoleChange = async (userId: number, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
      await utils.admin.listUsers.invalidate();
      toast.success(`Permissão do usuário atualizada para ${newRole}.`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar permissão do usuário.');
    }
  };

  const users = usersQuery.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Shield className="w-6 h-6 text-emerald-600" /> Painel Administrativo — Gerenciamento de Usuários
          </DialogTitle>
        </DialogHeader>

        {usersQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-3 mt-4">
            <p className="text-sm text-gray-600 mb-2">
              Total de usuários cadastrados: <strong>{users.length}</strong>
            </p>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <th className="p-3">Nome</th>
                    <th className="p-3">E-mail</th>
                    <th className="p-3">Cargo</th>
                    <th className="p-3">Confirmação</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{u.name || 'Sem nome'}</td>
                      <td className="p-3 text-gray-600">{u.email}</td>
                      <td className="p-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        {u.emailVerified === 1 ? (
                          <span className="text-green-600 flex items-center gap-1 text-xs font-semibold">
                            <UserCheck className="w-4 h-4" /> Confirmado
                          </span>
                        ) : (
                          <span className="text-amber-600 flex items-center gap-1 text-xs font-semibold">
                            <UserX className="w-4 h-4" /> Pendente
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRoleChange(u.id, u.role)}
                          disabled={updateRoleMutation.isPending}
                        >
                          Tornar {u.role === 'admin' ? 'Usuário' : 'Admin'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Nenhum usuário encontrado no banco de dados.
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
