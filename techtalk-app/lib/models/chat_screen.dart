import 'package:flutter/material.dart';
import 'package:techtalk/constants/app_theme.dart';
import 'chat_service.dart';

class ParentChatScreen extends StatefulWidget {
  final String otherUserId;
  final String otherUserName;

  const ParentChatScreen({
    super.key,
    required this.otherUserId,
    required this.otherUserName,
  });

  @override
  State<ParentChatScreen> createState() => _ParentChatScreenState();
}

class _ParentChatScreenState extends State<ParentChatScreen> {
  final ChatService service = ChatService();
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  late String currentUserId;

  @override
  void initState() {
    super.initState();
    currentUserId = service.currentUserId;

    service.markAsRead(widget.otherUserId);
  }

  Future<void> _send() async {
    await service.sendMessage(
      receiverId: widget.otherUserId,
      text: _controller.text,
    );

    _controller.clear();

    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent + 100,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,

      appBar: AppBar(
        backgroundColor: AppTheme.primaryColor,
        title: Text(widget.otherUserName),
      ),

      body: Column(
        children: [
          /// MESSAGES
          Expanded(
            child: StreamBuilder<List<Map<String, dynamic>>>(
              stream: service.messagesStream(widget.otherUserId),
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }

                final messages = snapshot.data!;

                return ListView.builder(
                  controller: _scrollController,
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final msg = messages[index];
                    final isMe = msg['sender_id'] == currentUserId;

                    return Align(
                      alignment: isMe
                          ? Alignment.centerRight
                          : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 5,
                        ),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isMe
                              ? AppTheme.primaryColor
                              : AppTheme.receivedMessageColor,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Text(
                          msg['content'] ?? '',
                          style: TextStyle(
                            color: isMe ? Colors.white : AppTheme.textColor,
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),

          /// INPUT
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            color: AppTheme.backgroundColor,
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(
                      hintText: "Type a message...",
                      border: InputBorder.none,
                    ),
                  ),
                ),
                IconButton(
                  icon: Icon(
                    Icons.send,
                    color: _controller.text.trim().isEmpty
                        ? Colors.grey
                        : AppTheme.primaryColor,
                  ),
                  onPressed: _controller.text.trim().isEmpty ? null : _send,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
