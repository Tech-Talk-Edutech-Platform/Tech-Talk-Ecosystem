import 'package:supabase_flutter/supabase_flutter.dart';

class ChatService {
  final supabase = Supabase.instance.client;

  String get currentUserId => supabase.auth.currentUser?.id ?? "";

  /// SEND MESSAGE
  Future<void> sendMessage({
    required String receiverId,
    required String text,
  }) async {
    if (text.trim().isEmpty) return;

    await supabase.from('messages').insert({
      'sender_id': currentUserId,
      'receiver_id': receiverId,
      'content': text.trim(),
      'created_at': DateTime.now().toIso8601String(),
      'is_read': false,
    });
  }

  /// REALTIME CHAT STREAM (1-1 FILTERED)
  Stream<List<Map<String, dynamic>>> messagesStream(String otherUserId) {
    return supabase
        .from('messages')
        .stream(primaryKey: ['id'])
        .order('created_at')
        .map((messages) {
          return messages.where((m) {
            final s = m['sender_id'];
            final r = m['receiver_id'];

            return (s == currentUserId && r == otherUserId) ||
                (s == otherUserId && r == currentUserId);
          }).toList();
        });
  }

  /// MARK AS READ
  Future<void> markAsRead(String otherUserId) async {
    await supabase
        .from('messages')
        .update({'is_read': true})
        .eq('receiver_id', currentUserId)
        .eq('sender_id', otherUserId)
        .eq('is_read', false);
  }
}
