import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase, Chat, Message } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useChat = () => {
  const { user } = useAuth();

  // Buscar lista de conversas do usuário
  const fetchChats = async (): Promise<Chat[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('chats')
      .select(`
        *,
        user1:user1_id(id, name, username, avatar_url),
        user2:user2_id(id, name, username, avatar_url),
        messages(id, body, created_at, sender_id)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const chatsQuery = useQuery({
    queryKey: ['chats', user?.id],
    queryFn: fetchChats,
    enabled: !!user,
  });

  // Buscar mensagens de um chat
  const fetchMessages = async (chatId: string): Promise<Message[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const messagesQuery = (chatId: string) =>
    useQuery({
      queryKey: ['messages', chatId],
      queryFn: () => fetchMessages(chatId),
    });

  // Criar ou obter chat existente
  const getOrCreateChat = async (otherUserId: string): Promise<Chat> => {
    if (!user) throw new Error('Usuário não autenticado');

    // Verificar se chat já existe
    const { data: existingChat, error: fetchError } = await supabase
      .from('chats')
      .select('*')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
      .single();

    if (existingChat) return existingChat;

    // Criar novo chat
    const { data: newChat, error: createError } = await supabase
      .from('chats')
      .insert({
        user1_id: user.id,
        user2_id: otherUserId,
      })
      .select()
      .single();

    if (createError) throw createError;
    return newChat;
  };

  // Enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async ({ chatId, message }: { chatId: string; message: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          body: message,
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar timestamp do chat
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

      return data;
    },
    onSuccess: () => {
      chatsQuery.refetch();
    },
  });

  return {
    chats: chatsQuery.data || [],
    chatsLoading: chatsQuery.isLoading,
    chatsError: chatsQuery.error,
    messagesQuery,
    getOrCreateChat,
    sendMessage: sendMessageMutation.mutate,
    sendMessageLoading: sendMessageMutation.isPending,
  };
};
