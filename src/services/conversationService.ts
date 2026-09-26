import api from './api';
import type { ChatMessage } from '../types/ai';

export interface ConversationMessageDto {
  id: string;
  episodeId: string;
  role: 'user' | 'assistant';
  content: string;
  status: string;
  createdAt: string;
}

function toLocal(dto: ConversationMessageDto): ChatMessage {
  return {
    id: dto.id,
    role: dto.role,
    content: dto.content,
    status: dto.status as ChatMessage['status'],
    timestamp: new Date(dto.createdAt),
  };
}

export const conversationService = {
  async getByEpisode(episodeId: string): Promise<ChatMessage[]> {
    const { data } = await api.get<ConversationMessageDto[]>(
      '/episodes/' + episodeId + '/conversation',
    );
    return data.map(toLocal);
  },

  async append(
    episodeId: string,
    msg: Pick<ChatMessage, 'role' | 'content' | 'status'>,
  ): Promise<ConversationMessageDto> {
    const { data } = await api.post<ConversationMessageDto>(
      '/episodes/' + episodeId + '/conversation',
      { role: msg.role, content: msg.content, status: msg.status },
    );
    return data;
  },

  async clear(episodeId: string): Promise<void> {
    await api.delete('/episodes/' + episodeId + '/conversation');
  },
};