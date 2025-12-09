import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Avatar } from 'react-native-paper';
import { useChat } from '../../hooks/useChat';
import { LoadingScreen } from '../../components/LoadingScreen';

interface ChatScreenProps {
  navigation: any;
  route: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { chatId, otherUser } = route.params;
  const { messagesQuery, sendMessage, sendMessageLoading } = useChat();
  const [messageText, setMessageText] = useState('');

  const messagesData = messagesQuery(chatId);
  const messages = messagesData.data || [];

  useEffect(() => {
    navigation.setOptions({
      title: otherUser?.name || 'Chat',
    });
  }, [navigation, otherUser]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    sendMessage(
      { chatId, message: messageText },
      {
        onSuccess: () => {
          setMessageText('');
          messagesData.refetch();
        },
      }
    );
  };

  if (messagesData.isLoading) {
    return <LoadingScreen message="Carregando mensagens..." />;
  }

  const renderMessage = ({ item }: { item: any }) => {
    const isOwn = item.sender_id === otherUser?.id;
    const messageTime = new Date(item.created_at).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
        <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
            {item.body}
          </Text>
          <Text style={[styles.messageTime, isOwn ? styles.ownTime : styles.otherTime]}>
            {messageTime}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Avatar.Image size={60} source={{ uri: otherUser?.avatar_url }} />
          <Text style={styles.emptyText}>Comece uma conversa com {otherUser?.name}</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.messagesContent}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Digite uma mensagem..."
          value={messageText}
          onChangeText={setMessageText}
          style={styles.input}
          editable={!sendMessageLoading}
          multiline
        />
        <Button
          mode="contained"
          onPress={handleSendMessage}
          loading={sendMessageLoading}
          disabled={sendMessageLoading || !messageText.trim()}
          style={styles.sendButton}
        >
          Enviar
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContent: {
    padding: 12,
  },
  messageContainer: {
    marginBottom: 8,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
  },
  otherBubble: {
    backgroundColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 14,
  },
  ownText: {
    color: '#fff',
  },
  otherText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  ownTime: {
    color: '#ccc',
  },
  otherTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    paddingHorizontal: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    textAlign: 'center',
  },
});
