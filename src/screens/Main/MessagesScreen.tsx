import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Avatar, Card } from 'react-native-paper';
import { useChat } from '../../hooks/useChat';
import { LoadingScreen } from '../../components/LoadingScreen';

interface MessagesScreenProps {
  navigation: any;
}

export const MessagesScreen: React.FC<MessagesScreenProps> = ({ navigation }) => {
  const { chats, chatsLoading } = useChat();

  if (chatsLoading) {
    return <LoadingScreen message="Carregando conversas..." />;
  }

  const renderChatItem = ({ item }: { item: any }) => {
    const otherUser = item.user1_id === item.user1_id ? item.user2 : item.user1;
    const lastMessage = item.messages?.[item.messages.length - 1];
    const lastMessageText = lastMessage?.body || 'Nenhuma mensagem';
    const lastMessageTime = lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';

    return (
      <TouchableOpacity onPress={() => navigation.navigate('Chat', { chatId: item.id, otherUser })}>
        <Card style={styles.chatCard}>
          <Card.Content style={styles.chatContent}>
            <Avatar.Image size={50} source={{ uri: otherUser?.avatar_url }} />
            <View style={styles.chatInfo}>
              <Text variant="bodyMedium" style={styles.chatName}>
                {otherUser?.name}
              </Text>
              <Text variant="bodySmall" numberOfLines={1}>
                {lastMessageText}
              </Text>
            </View>
            <Text variant="bodySmall">{lastMessageTime}</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {chats.length === 0 ? (
        <View style={styles.emptyState}>
          <Text>Nenhuma conversa ainda</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 12,
  },
  chatCard: {
    marginBottom: 8,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatName: {
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
