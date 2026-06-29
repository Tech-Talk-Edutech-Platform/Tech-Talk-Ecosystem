// /*
//   SUPABASE CHAT SERVICE + CHAT UI
//   --------------------------------
//   - 1-on-1 messaging
//   - realtime updates
//   - unread tracking
//   - seen status
// */

// import 'package:flutter/material.dart';
// import 'package:supabase_flutter/supabase_flutter.dart';
// import 'package:techtalk/constants/app_theme.dart';

// /// ======================
// /// CHAT SERVICE
// /// ======================
// // class ChatService {
// //   final supabase = Supabase.instance.client;

// //   String get currentUserId => supabase.auth.currentUser?.id ?? "";

// //   /// SEND MESSAGE
// //   Future<void> sendMessage({
// //     required String receiverId,
// //     required String text,
// //   }) async {
// //     if (text.trim().isEmpty) return;

// //     await supabase.from('messages').insert({
// //       'sender_id': currentUserId,
// //       'receiver_id': receiverId,
// //       'content': text.trim(),
// //       'is_read': false,
// //     });
// //   }

// //   /// REALTIME MESSAGE STREAM
// //   Stream<List<Map<String, dynamic>>> messagesStream(String otherUserId) {
// //     return supabase
// //         .from('messages')
// //         .stream(primaryKey: ['id'])
// //         .order('created_at')
// //         .map((messages) {
// //           return messages.where((msg) {
// //             final sender = msg['sender_id'];
// //             final receiver = msg['receiver_id'];

// //             return (sender == currentUserId && receiver == otherUserId) ||
// //                 (sender == otherUserId && receiver == currentUserId);
// //           }).toList();
// //         });
// //   }

// //   /// MARK AS READ
// //   Future<void> markAsRead(String otherUserId) async {
// //     await supabase
// //         .from('messages')
// //         .update({'is_read': true})
// //         .eq('receiver_id', currentUserId)
// //         .eq('sender_id', otherUserId)
// //         .eq('is_read', false);
// //   }
// // }

// // import 'package:supabase_flutter/supabase_flutter.dart';

// class ChatService {
//   final supabase = Supabase.instance.client;

//   String get currentUserId => supabase.auth.currentUser?.id ?? "";

//   /// SEND MESSAGE
//   Future<void> sendMessage({
//     required String receiverId,
//     required String text,
//   }) async {
//     if (text.trim().isEmpty) return;

//     await supabase.from('messages').insert({
//       'sender_id': currentUserId,
//       'receiver_id': receiverId,
//       'content': text.trim(),
//       'created_at': DateTime.now().toIso8601String(),
//       'is_read': false,
//     });
//   }

//   /// REALTIME CHAT STREAM (1-1 FILTERED)
//   Stream<List<Map<String, dynamic>>> messagesStream(String otherUserId) {
//     return supabase
//         .from('messages')
//         .stream(primaryKey: ['id'])
//         .order('created_at')
//         .map((messages) {
//           return messages.where((m) {
//             final s = m['sender_id'];
//             final r = m['receiver_id'];

//             return (s == currentUserId && r == otherUserId) ||
//                 (s == otherUserId && r == currentUserId);
//           }).toList();
//         });
//   }

//   /// MARK AS READ
//   Future<void> markAsRead(String otherUserId) async {
//     await supabase
//         .from('messages')
//         .update({'is_read': true})
//         .eq('receiver_id', currentUserId)
//         .eq('sender_id', otherUserId)
//         .eq('is_read', false);
//   }
// }

// /// ======================
// /// CHAT SCREEN
// /// ======================
// class ParentChatScreen extends StatefulWidget {
//   final String otherUserId;
//   final String otherUserName;

//   const ParentChatScreen({
//     super.key,
//     required this.otherUserId,
//     required this.otherUserName,
//   });

//   @override
//   State<ParentChatScreen> createState() => _ParentChatScreenState();
// }

// class _ParentChatScreenState extends State<ParentChatScreen> {
//   final ChatService service = ChatService();

//   final TextEditingController _messageController = TextEditingController();

//   final ScrollController _scrollController = ScrollController();

//   late String currentUserId;

//   @override
//   void initState() {
//     super.initState();

//     currentUserId = service.currentUserId;

//     service.markAsRead(widget.otherUserId);
//   }

//   Future<void> _sendMessage() async {
//     await service.sendMessage(
//       receiverId: widget.otherUserId,
//       text: _messageController.text,
//     );

//     _messageController.clear();

//     if (_scrollController.hasClients) {
//       _scrollController.animateTo(
//         _scrollController.position.maxScrollExtent + 100,
//         duration: const Duration(milliseconds: 300),
//         curve: Curves.easeOut,
//       );
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       backgroundColor: AppTheme.backgroundColor,

//       appBar: AppBar(
//         backgroundColor: AppTheme.primaryColor,
//         title: Text(widget.otherUserName),
//       ),

//       body: Column(
//         children: [
//           /// ======================
//           /// MESSAGES
//           /// ======================
//           Expanded(
//             child: StreamBuilder<List<Map<String, dynamic>>>(
//               stream: service.messagesStream(widget.otherUserId),
//               builder: (context, snapshot) {
//                 if (!snapshot.hasData) {
//                   return const Center(child: CircularProgressIndicator());
//                 }

//                 final messages = snapshot.data!;

//                 return ListView.builder(
//                   controller: _scrollController,
//                   itemCount: messages.length,
//                   itemBuilder: (context, index) {
//                     final msg = messages[index];

//                     final isMe = msg['sender_id'] == currentUserId;

//                     return Align(
//                       alignment: isMe
//                           ? Alignment.centerRight
//                           : Alignment.centerLeft,

//                       child: Container(
//                         margin: const EdgeInsets.symmetric(
//                           horizontal: 10,
//                           vertical: 5,
//                         ),

//                         padding: const EdgeInsets.symmetric(
//                           horizontal: 14,
//                           vertical: 10,
//                         ),

//                         decoration: BoxDecoration(
//                           color: isMe
//                               ? AppTheme.primaryColor
//                               : AppTheme.receivedMessageColor,

//                           borderRadius: BorderRadius.circular(14),
//                         ),

//                         child: Text(
//                           msg['content'] ?? '',
//                           style: TextStyle(
//                             color: isMe ? Colors.white : AppTheme.textColor,
//                           ),
//                         ),
//                       ),
//                     );
//                   },
//                 );
//               },
//             ),
//           ),

//           /// ======================
//           /// INPUT
//           /// ======================
//           Container(
//             padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),

//             color: AppTheme.backgroundColor,

//             child: Row(
//               children: [
//                 Expanded(
//                   child: TextField(
//                     controller: _messageController,

//                     decoration: InputDecoration(
//                       hintText: "Type a message...",
//                       border: InputBorder.none,
//                       hintStyle: TextStyle(color: AppTheme.textColor),
//                     ),

//                     onChanged: (_) => setState(() {}),
//                   ),
//                 ),

//                 IconButton(
//                   icon: Icon(
//                     Icons.send,
//                     color: _messageController.text.trim().isEmpty
//                         ? Colors.grey
//                         : AppTheme.primaryColor,
//                   ),

//                   onPressed: _messageController.text.trim().isEmpty
//                       ? null
//                       : _sendMessage,
//                 ),
//               ],
//             ),
//           ),
//         ],
//       ),
//     );
//   }
// }
// // /*
// //   Firestore Chat Service + Chat UI
// //   --------------------------------
// //   - Handles 1-on-1 messaging between parents and teachers.
// //   - Tracks unread message counts.
// //   - Sends real-time messages with seen status.
// //   - Designed for integration into ParentDashboard.
// // */

// // import 'package:flutter/material.dart';
// // import 'package:cloud_firestore/cloud_firestore.dart';
// // import 'package:firebase_auth/firebase_auth.dart';
// // import 'package:techtalk/constants/app_theme.dart';

// // /// ----------------------
// // /// Chat Service
// // /// ----------------------
// // class ChatService {
// //   final FirebaseFirestore _db = FirebaseFirestore.instance;

// //   String get currentUserEmail =>
// //       FirebaseAuth.instance.currentUser?.email ?? "unknown";

// //   String getChatId(String a, String b) =>
// //       (a.compareTo(b) < 0) ? "${a}_$b" : "${b}_$a";

// //   /// Send a message
// //   Future<void> sendMessage({
// //     required String chatId,
// //     required String receiver,
// //     required String text,
// //   }) async {
// //     if (text.trim().isEmpty) return;

// //     final message = {
// //       'sender': currentUserEmail,
// //       'receiver': receiver,
// //       'message': text.trim(),
// //       'timestamp': FieldValue.serverTimestamp(),
// //       'seen': false,
// //     };

// //     await _db
// //         .collection('chats')
// //         .doc(chatId)
// //         .collection('messages')
// //         .add(message);
// //   }

// //   /// Stream messages for a given chatId
// //   Stream<QuerySnapshot> messagesStream(String chatId) {
// //     return _db
// //         .collection('chats')
// //         .doc(chatId)
// //         .collection('messages')
// //         .orderBy('timestamp')
// //         .snapshots();
// //   }

// //   /// Stream unread messages for a given chatId
// //   Stream<QuerySnapshot> unreadMessagesStream(String chatId) {
// //     return _db
// //         .collection('chats')
// //         .doc(chatId)
// //         .collection('messages')
// //         .where('receiver', isEqualTo: currentUserEmail)
// //         .where('seen', isEqualTo: false)
// //         .snapshots();
// //   }

// //   /// Mark messages as seen
// //   Future<void> markMessagesAsSeen(QuerySnapshot snapshot) async {
// //     for (var doc in snapshot.docs) {
// //       if (doc['receiver'] == currentUserEmail && doc['seen'] == false) {
// //         await doc.reference.update({'seen': true});
// //       }
// //     }
// //   }
// // }

// // /// ----------------------
// // /// Chat Screen
// // /// ----------------------
// // class ParentChatScreen extends StatefulWidget {
// //   final String otherUserEmail;
// //   const ParentChatScreen({super.key, required this.otherUserEmail});

// //   @override
// //   State<ParentChatScreen> createState() => _ParentChatScreenState();
// // }

// // class _ParentChatScreenState extends State<ParentChatScreen> {
// //   final TextEditingController _messageController = TextEditingController();
// //   final ScrollController _scrollController = ScrollController();
// //   final ChatService service = ChatService();

// //   late String currentUserEmail;
// //   late String chatId;

// //   @override
// //   void initState() {
// //     super.initState();
// //     currentUserEmail = service.currentUserEmail;
// //     chatId = service.getChatId(currentUserEmail, widget.otherUserEmail);
// //   }

// //   Future<void> _sendMessage() async {
// //     await service.sendMessage(
// //       chatId: chatId,
// //       receiver: widget.otherUserEmail,
// //       text: _messageController.text,
// //     );
// //     _messageController.clear();

// //     if (!mounted) return;
// //     if (_scrollController.hasClients) {
// //       _scrollController.animateTo(
// //         _scrollController.position.maxScrollExtent + 60,
// //         duration: const Duration(milliseconds: 300),
// //         curve: Curves.easeOut,
// //       );
// //     }
// //   }

// //   @override
// //   Widget build(BuildContext context) {
// //     return Scaffold(
// //       appBar: AppBar(
// //         title: Text("Chat with ${widget.otherUserEmail}"),
// //         backgroundColor: AppTheme.primaryColor,
// //       ),
// //       body: Column(
// //         children: [
// //           Expanded(
// //             child: StreamBuilder<QuerySnapshot>(
// //               stream: service.messagesStream(chatId),
// //               builder: (context, snapshot) {
// //                 if (!snapshot.hasData) {
// //                   return const Center(child: CircularProgressIndicator());
// //                 }

// //                 service.markMessagesAsSeen(snapshot.data!);
// //                 final messages = snapshot.data!.docs;

// //                 return ListView.builder(
// //                   controller: _scrollController,
// //                   itemCount: messages.length,
// //                   itemBuilder: (context, index) {
// //                     final msg = messages[index];
// //                     final isMe = msg['sender'] == currentUserEmail;
// //                     return Align(
// //                       alignment:
// //                           isMe ? Alignment.centerRight : Alignment.centerLeft,
// //                       child: Container(
// //                         padding: const EdgeInsets.symmetric(
// //                           vertical: 8,
// //                           horizontal: 12,
// //                         ),
// //                         margin: const EdgeInsets.symmetric(
// //                           vertical: 4,
// //                           horizontal: 8,
// //                         ),
// //                         decoration: BoxDecoration(
// //                           color: isMe
// //                               ? AppTheme.primaryColor
// //                               : AppTheme.receivedMessageColor,
// //                           borderRadius: BorderRadius.circular(12),
// //                         ),
// //                         child: Text(
// //                           msg['message'] ?? '',
// //                           style: TextStyle(
// //                             color: isMe ? Colors.white : AppTheme.textColor,
// //                           ),
// //                         ),
// //                       ),
// //                     );
// //                   },
// //                 );
// //               },
// //             ),
// //           ),
// //           const Divider(height: 1),
// //           Container(
// //             color: AppTheme.backgroundColor,
// //             padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
// //             child: Row(
// //               children: [
// //                 Expanded(
// //                   child: TextField(
// //                     controller: _messageController,
// //                     decoration: InputDecoration(
// //                       hintText: "Type a message...",
// //                       border: InputBorder.none,
// //                       hintStyle: TextStyle(color: AppTheme.textColor),
// //                     ),
// //                     onChanged: (_) => setState(() {}),
// //                   ),
// //                 ),
// //                 IconButton(
// //                   icon: Icon(Icons.send,
// //                       color: _messageController.text.trim().isEmpty
// //                           ? Colors.grey
// //                           : AppTheme.primaryColor),
// //                   onPressed: _messageController.text.trim().isEmpty
// //                       ? null
// //                       : _sendMessage,
// //                 ),
// //               ],
// //             ),
// //           ),
// //         ],
// //       ),
// //     );
// //   }
// // }

// // // UNFILTERED
// // /*
// //   Chat and User List Screens with Firestore Integration

// //   - Displays a list of users (teachers/parents) with unread message badges.
// //   - Enables 1-on-1 chat with real-time messaging, timestamps, and read receipts.
// //   - Sends and receives messages using Firestore, marking messages as seen when viewed.
// //   - Disables send button if message input is empty.
// //   - Supports tapping messages to view details.
// //   - Includes placeholders for emoji reactions and attachments.
// //   - Abstracts Firestore logic into a ChatService for cleaner code.
// // */
// // import 'package:coursebuddy/constants/app_theme.dart';
// // import 'package:flutter/material.dart';
// // import 'package:cloud_firestore/cloud_firestore.dart';
// // import 'package:firebase_auth/firebase_auth.dart';

// // /// ----------------------
// // /// Chat Service
// // /// ----------------------
// // /// - Encapsulates Firestore read/write for chats
// // /// - Used by both UserListScreen and ChatScreen
// // class ChatService {
// //   final FirebaseFirestore _db = FirebaseFirestore.instance;

// //   String get currentUserEmail =>
// //       FirebaseAuth.instance.currentUser?.email ?? "unknown";

// //   String getChatId(String a, String b) =>
// //       (a.compareTo(b) < 0) ? "${a}_$b" : "${b}_$a";

// //   /// Send a message
// //   Future<void> sendMessage({
// //     required String chatId,
// //     required String receiver,
// //     required String text,
// //   }) async {
// //     if (text.trim().isEmpty) return;

// //     final message = {
// //       'sender': currentUserEmail,
// //       'receiver': receiver,
// //       'message': text.trim(),
// //       'timestamp': FieldValue.serverTimestamp(),
// //       'seen': false,
// //     };

// //     await _db
// //         .collection('chats')
// //         .doc(chatId)
// //         .collection('messages')
// //         .add(message);
// //   }

// //   /// Stream all users except the current one
// //   Stream<QuerySnapshot> usersStream() {
// //     return _db.collection('users').snapshots();
// //   }

// //   /// Stream messages for a given chatId
// //   Stream<QuerySnapshot> messagesStream(String chatId) {
// //     return _db
// //         .collection('chats')
// //         .doc(chatId)
// //         .collection('messages')
// //         .orderBy('timestamp')
// //         .snapshots();
// //   }

// //   /// Stream unread messages for a given chatId
// //   Stream<QuerySnapshot> unreadMessagesStream(String chatId) {
// //     return _db
// //         .collection('chats')
// //         .doc(chatId)
// //         .collection('messages')
// //         .where('receiver', isEqualTo: currentUserEmail)
// //         .where('seen', isEqualTo: false)
// //         .snapshots();
// //   }

// //   /// Mark messages as seen
// //   Future<void> markMessagesAsSeen(QuerySnapshot snapshot) async {
// //     for (var doc in snapshot.docs) {
// //       if (doc['receiver'] == currentUserEmail && doc['seen'] == false) {
// //         await doc.reference.update({'seen': true});
// //       }
// //     }
// //   }
// // }

// // /// ----------------------
// // /// User List Screen
// // /// ----------------------
// // class UserListScreen extends StatelessWidget {
// //   const UserListScreen({super.key});

// //   @override
// //   Widget build(BuildContext context) {
// //     final service = ChatService();
// //     final currentUserEmail = service.currentUserEmail;

// //     return Scaffold(
// //       appBar: AppBar(
// //         title: const Text("Messages"),
// //         backgroundColor: AppTheme.primaryColor,
// //       ),
// //       body: StreamBuilder<QuerySnapshot>(
// //         stream: service.usersStream(),
// //         builder: (context, snapshot) {
// //           if (!snapshot.hasData) {
// //             return const Center(child: CircularProgressIndicator());
// //           }

// //           final users = snapshot.data!.docs
// //               .where((doc) => doc['email'] != currentUserEmail)
// //               .toList();

// //           if (users.isEmpty) {
// //             return const Center(child: Text("No other users found"));
// //           }

// //           return ListView.builder(
// //             itemCount: users.length,
// //             itemBuilder: (context, index) {
// //               final user = users[index];
// //               final otherUserEmail = user['email'];
// //               final chatId =
// //                   service.getChatId(currentUserEmail, otherUserEmail);

// //               return StreamBuilder<QuerySnapshot>(
// //                 stream: service.unreadMessagesStream(chatId),
// //                 builder: (context, msgSnapshot) {
// //                   final unreadCount =
// //                       msgSnapshot.hasData ? msgSnapshot.data!.docs.length : 0;

// //                   return ListTile(
// //                     leading: const CircleAvatar(child: Icon(Icons.person)),
// //                     title: Text(otherUserEmail),
// //                     trailing: unreadCount > 0
// //                         ? CircleAvatar(
// //                             radius: 12,
// //                             backgroundColor: Colors.red,
// //                             child: Text(
// //                               unreadCount.toString(),
// //                               style: const TextStyle(
// //                                 color: Colors.white,
// //                                 fontSize: 12,
// //                               ),
// //                             ),
// //                           )
// //                         : null,
// //                     onTap: () {
// //                       Navigator.push(
// //                         context,
// //                         MaterialPageRoute(
// //                           builder: (_) =>
// //                               ChatScreen(otherUserEmail: otherUserEmail),
// //                         ),
// //                       );
// //                     },
// //                   );
// //                 },
// //               );
// //             },
// //           );
// //         },
// //       ),
// //     );
// //   }
// // }

// // /// ----------------------
// // /// Chat Screen
// // /// ----------------------
// // class ChatScreen extends StatefulWidget {
// //   final String otherUserEmail; // teacher or parent
// //   const ChatScreen({super.key, required this.otherUserEmail});

// //   @override
// //   State<ChatScreen> createState() => _ChatScreenState();
// // }

// // class _ChatScreenState extends State<ChatScreen> {
// //   final TextEditingController _messageController = TextEditingController();
// //   final ScrollController _scrollController = ScrollController();
// //   late String currentUserEmail;
// //   late String chatId;
// //   final ChatService service = ChatService();

// //   @override
// //   void initState() {
// //     super.initState();
// //     currentUserEmail = service.currentUserEmail;
// //     chatId = service.getChatId(currentUserEmail, widget.otherUserEmail);
// //   }

// //   Future<void> _sendMessage() async {
// //     await service.sendMessage(
// //       chatId: chatId,
// //       receiver: widget.otherUserEmail,
// //       text: _messageController.text,
// //     );

// //     _messageController.clear();
// //     if (!mounted) return;
// //     if (_scrollController.hasClients) {
// //       _scrollController.animateTo(
// //         _scrollController.position.maxScrollExtent + 60,
// //         duration: const Duration(milliseconds: 300),
// //         curve: Curves.easeOut,
// //       );
// //     }
// //   }

// //   @override
// //   Widget build(BuildContext context) {
// //     return Scaffold(
// //       appBar: AppBar(
// //         title: Text("Chat with ${widget.otherUserEmail}"),
// //         backgroundColor: AppTheme.primaryColor,
// //       ),
// //       body: Column(
// //         children: [
// //           Expanded(
// //             child: StreamBuilder<QuerySnapshot>(
// //               stream: service.messagesStream(chatId),
// //               builder: (context, snapshot) {
// //                 if (!snapshot.hasData) {
// //                   return const Center(child: CircularProgressIndicator());
// //                 }

// //                 service.markMessagesAsSeen(snapshot.data!);
// //                 final messages = snapshot.data!.docs;

// //                 return ListView.builder(
// //                   controller: _scrollController,
// //                   itemCount: messages.length,
// //                   itemBuilder: (context, index) {
// //                     final msg = messages[index];
// //                     final isMe = msg['sender'] == currentUserEmail;
// //                     return Align(
// //                       alignment:
// //                           isMe ? Alignment.centerRight : Alignment.centerLeft,
// //                       child: Container(
// //                         padding: const EdgeInsets.symmetric(
// //                           vertical: 8,
// //                           horizontal: 12,
// //                         ),
// //                         margin: const EdgeInsets.symmetric(
// //                           vertical: 4,
// //                           horizontal: 8,
// //                         ),
// //                         decoration: BoxDecoration(
// //                           color: isMe
// //                               ? AppTheme.primaryColor
// //                               : AppTheme.receivedMessageColor,
// //                           borderRadius: BorderRadius.circular(12),
// //                         ),
// //                         child: Text(
// //                           msg['message'] ?? '',
// //                           style: TextStyle(
// //                             color: isMe ? Colors.white : AppTheme.textColor,
// //                           ),
// //                         ),
// //                       ),
// //                     );
// //                   },
// //                 );
// //               },
// //             ),
// //           ),
// //           const Divider(height: 1),
// //           Container(
// //             color: AppTheme.backgroundColor,
// //             padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
// //             child: Row(
// //               children: [
// //                 Expanded(
// //                   child: TextField(
// //                     controller: _messageController,
// //                     decoration: InputDecoration(
// //                       hintText: "Type a message...",
// //                       hintStyle: TextStyle(color: AppTheme.textColor),
// //                       border: InputBorder.none,
// //                     ),
// //                   ),
// //                 ),
// //                 IconButton(
// //                   icon: Icon(Icons.send, color: AppTheme.primaryColor),
// //                   onPressed: _messageController.text.trim().isEmpty
// //                       ? null
// //                       : _sendMessage,
// //                 ),

// //                 // IconButton(
// //                 //   icon: Icon(Icons.send, color: AppTheme.primaryColor),
// //                 //   onPressed: _sendMessage,
// //                 // ),
// //               ],
// //             ),
// //           ),
// //         ],
// //       ),
// //     );
// //   }
// // }
