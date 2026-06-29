import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:techtalk/constants/app_theme.dart';

class ChildCard extends StatefulWidget {
  final Map<String, dynamic> childData;

  const ChildCard({super.key, required this.childData});

  @override
  State<ChildCard> createState() => _ChildCardState();
}

class _ChildCardState extends State<ChildCard> {
  final supabase = Supabase.instance.client;

  List<String> assignedTeachers = [];
  Map<String, List<String>> courseTopics = {};
  Map<String, String> courseTitles = {};
  Map<String, double> courseProgress = {};

  @override
  void initState() {
    super.initState();
    _loadTeachersAndTopics();
  }

  Future<void> _loadTeachersAndTopics() async {
    final courseIds = List<String>.from(widget.childData['courseIds'] ?? []);
    final teacherIds = List<String>.from(widget.childData['teacherIds'] ?? []);

    assignedTeachers = [];

    // 🔹 Load teachers from users table
    for (final id in teacherIds) {
      final res = await supabase
          .from('users')
          .select('full_name,email')
          .eq('id', id)
          .maybeSingle();

      if (res != null) {
        assignedTeachers.add(res['email'] ?? 'Unknown');
      }
    }

    // 🔹 Load courses + topics
    for (final courseId in courseIds) {
      final course = await supabase
          .from('courses')
          .select('title')
          .eq('id', courseId)
          .maybeSingle();

      if (course != null) {
        courseTitles[courseId] = course['title'] ?? 'Untitled';
      }

      final topics = await supabase
          .from('topics')
          .select('title')
          .eq('course_id', courseId)
          .order('created_at');

      courseTopics[courseId] = (topics as List)
          .map((t) => t['title'] as String)
          .toList();

      courseProgress[courseId] =
          (widget.childData['progressMap']?[courseId] as num?)?.toDouble() ??
          0.0;
    }

    if (!mounted) return;
    setState(() {});
  }

  /// 🔹 Supabase chat (messages table)
  Future<void> _openChat(String teacherEmail) async {
    final user = supabase.auth.currentUser;
    if (user == null) return;

    final teacher = await supabase
        .from('users')
        .select('id,email')
        .eq('email', teacherEmail)
        .maybeSingle();

    if (teacher == null) return;

    final receiverId = teacher['id'];

    if (!mounted) return;

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) =>
            ChatScreen(receiverId: receiverId, teacherEmail: teacherEmail),
      ),
    );
  }

  void _showTeacherSelector() {
    if (assignedTeachers.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("No teacher assigned yet.")));
      return;
    }

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Select Teacher"),
        content: SingleChildScrollView(
          child: Column(
            children: assignedTeachers.map((email) {
              return ListTile(
                leading: const Icon(Icons.person),
                title: Text(email),
                onTap: () {
                  Navigator.pop(ctx);
                  _openChat(email);
                },
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  Future<void> _exportToPDF() async {
    final name = widget.childData['name'] ?? 'Unnamed';
    final parent = widget.childData['parentName'] ?? 'Unknown';

    final pdf = pw.Document();

    pdf.addPage(
      pw.MultiPage(
        build: (ctx) {
          final content = <pw.Widget>[
            pw.Text("Child Profile", style: pw.TextStyle(fontSize: 22)),
            pw.SizedBox(height: 10),
            pw.Text("Name: $name"),
            pw.Text("Parent: $parent"),
            pw.SizedBox(height: 10),
            pw.Text("Teachers:"),
            ...assignedTeachers.map((t) => pw.Bullet(text: t)),
            pw.SizedBox(height: 10),
          ];

          courseTitles.forEach((id, title) {
            content.add(pw.Text(title, style: pw.TextStyle(fontSize: 18)));

            final topics = courseTopics[id] ?? [];
            content.addAll(topics.map((t) => pw.Bullet(text: t)));
            content.add(pw.SizedBox(height: 10));
          });

          return content;
        },
      ),
    );

    await Printing.layoutPdf(onLayout: (format) async => pdf.save());
  }

  @override
  Widget build(BuildContext context) {
    final name = widget.childData['name'] ?? 'Unnamed';

    return Card(
      elevation: 4,
      margin: const EdgeInsets.symmetric(vertical: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              name,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 12),

            Text(
              assignedTeachers.isEmpty
                  ? 'No teacher assigned'
                  : assignedTeachers.join(', '),
            ),

            const SizedBox(height: 12),

            ...courseTitles.entries.map((e) {
              final topics = courseTopics[e.key] ?? [];

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    e.value,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Wrap(
                    spacing: 6,
                    children: topics.take(4).map((t) {
                      return Chip(label: Text(t));
                    }).toList(),
                  ),
                  const SizedBox(height: 8),
                ],
              );
            }),

            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                ElevatedButton.icon(
                  icon: const Icon(Icons.chat),
                  label: const Text("Chat"),
                  onPressed: _showTeacherSelector,
                ),
                const SizedBox(width: 10),
                ElevatedButton.icon(
                  icon: const Icon(Icons.picture_as_pdf),
                  label: const Text("PDF"),
                  onPressed: _exportToPDF,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class ChatScreen extends StatefulWidget {
  final String receiverId;
  final String teacherEmail;

  const ChatScreen({
    super.key,
    required this.receiverId,
    required this.teacherEmail,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final supabase = Supabase.instance.client;
  final controller = TextEditingController();

  Future<void> sendMessage() async {
    final user = supabase.auth.currentUser;
    if (user == null || controller.text.trim().isEmpty) return;

    await supabase.from('messages').insert({
      'sender_id': user.id,
      'receiver_id': widget.receiverId,
      'content': controller.text.trim(),
    });

    controller.clear();
  }

  @override
  Widget build(BuildContext context) {
    final user = supabase.auth.currentUser;

    final stream = supabase
        .from('messages')
        .stream(primaryKey: ['id'])
        .order('created_at');

    return Scaffold(
      appBar: AppBar(title: Text("Chat with ${widget.teacherEmail}")),
      body: Column(
        children: [
          Expanded(
            child: StreamBuilder(
              stream: stream,
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }

                final messages = snapshot.data!;

                final filtered = messages.where(
                  (m) =>
                      (m['sender_id'] == user?.id &&
                          m['receiver_id'] == widget.receiverId) ||
                      (m['sender_id'] == widget.receiverId &&
                          m['receiver_id'] == user?.id),
                );

                return ListView(
                  children: filtered.map((m) {
                    final isMe = m['sender_id'] == user?.id;

                    return Align(
                      alignment: isMe
                          ? Alignment.centerRight
                          : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.all(8),
                        padding: const EdgeInsets.all(10),
                        color: isMe ? Colors.blue[100] : Colors.grey[200],
                        child: Text(m['content'] ?? ''),
                      ),
                    );
                  }).toList(),
                );
              },
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: controller,
                    decoration: const InputDecoration(hintText: "Message..."),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// import 'package:flutter/material.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:pdf/widgets.dart' as pw;
// import 'package:printing/printing.dart';
// import 'package:techtalk/constants/app_theme.dart';

// class ChildCard extends StatefulWidget {
//   final Map<String, dynamic> childData;

//   const ChildCard({super.key, required this.childData});

//   @override
//   State<ChildCard> createState() => _ChildCardState();
// }

// class _ChildCardState extends State<ChildCard> {
//   List<String> assignedTeachers = [];
//   Map<String, List<String>> courseTopics = {}; // courseId -> topics
//   Map<String, String> courseTitles = {};       // courseId -> title
//   Map<String, double> courseProgress = {};     // courseId -> progress

//   @override
//   void initState() {
//     super.initState();
//     _loadTeachersAndTopics();
//   }

//   /// Load assigned teachers and topics for all courses
//   Future<void> _loadTeachersAndTopics() async {
//     final courseIds = List<String>.from(widget.childData['courseIds'] ?? []);
//     assignedTeachers = [];

//     // Load teachers
//     final teacherIds = List<String>.from(widget.childData['teacherIds'] ?? []);
//     for (String teacherId in teacherIds) {
//       final doc = await FirebaseFirestore.instance.collection('users').doc(teacherId).get();
//       if (doc.exists) assignedTeachers.add(doc['email'] ?? 'Unknown');
//     }

//     // Load topics for each course
//     for (String courseId in courseIds) {
//       // Course title
//       final courseDoc = await FirebaseFirestore.instance.collection('courses').doc(courseId).get();
//       if (courseDoc.exists) courseTitles[courseId] = courseDoc['title'] ?? 'Untitled';

//       // Topics
//       final topicSnap = await FirebaseFirestore.instance
//           .collection('topics')
//           .where('courseId', isEqualTo: courseId)
//           .orderBy('order')
//           .get();

//       courseTopics[courseId] = topicSnap.docs.map((t) => t['title'] as String).toList();

//       // Optional: per-course progress (if stored)
//       courseProgress[courseId] = (widget.childData['progressMap']?[courseId] as num?)?.toDouble() ?? 0.0;
//     }

//     if (!mounted) return;
//     setState(() {});
//   }

//   /// Open chat with a teacher
//   Future<void> _openChat(String teacherEmail) async {
//     final currentUser = FirebaseAuth.instance.currentUser;
//     if (currentUser == null) return;

//     final chats = FirebaseFirestore.instance.collection('chats');
//     final chatId = "${currentUser.uid}_$teacherEmail";
//     final chatDoc = chats.doc(chatId);

//     final docSnapshot = await chatDoc.get();
//     if (!docSnapshot.exists) {
//       await chatDoc.set({
//         'participants': [currentUser.email, teacherEmail],
//         'createdAt': FieldValue.serverTimestamp(),
//       });
//     }

//     if (!mounted) return;
//     Navigator.push(
//       context,
//       MaterialPageRoute(
//         builder: (_) => ChatScreen(chatId: chatId, teacherEmail: teacherEmail),
//       ),
//     );
//   }

//   /// Show teacher selection dialog
//   void _showTeacherSelector() {
//     if (assignedTeachers.isEmpty) {
//       ScaffoldMessenger.of(context).showSnackBar(
//         const SnackBar(content: Text("No teacher assigned yet.")),
//       );
//       return;
//     }

//     showDialog(
//       context: context,
//       builder: (ctx) => AlertDialog(
//         title: const Text("Select Teacher"),
//         content: SingleChildScrollView(
//           child: Column(
//             children: assignedTeachers.map((teacherEmail) {
//               return ListTile(
//                 leading: const Icon(Icons.person),
//                 title: Text(teacherEmail),
//                 onTap: () {
//                   Navigator.pop(ctx);
//                   _openChat(teacherEmail);
//                 },
//               );
//             }).toList(),
//           ),
//         ),
//       ),
//     );
//   }

//   /// Export all child info as PDF
//   Future<void> _exportToPDF() async {
//     final name = widget.childData['name'] ?? 'Unnamed';
//     final parent = widget.childData['parentName'] ?? 'Unknown Parent';
//     final emergency = widget.childData['emergencyContact'] ?? 'N/A';

//     final pdf = pw.Document();
//     pdf.addPage(
//       pw.MultiPage(
//         build: (ctx) {
//           final content = <pw.Widget>[
//             pw.Text("Child Profile", style: pw.TextStyle(fontSize: 22, fontWeight: pw.FontWeight.bold)),
//             pw.SizedBox(height: 10),
//             pw.Text("Name: $name"),
//             pw.Text("Parent: $parent"),
//             pw.Text("Emergency Contact: $emergency"),
//             pw.SizedBox(height: 10),
//             pw.Text("Assigned Teachers:"),
//             ...assignedTeachers.map((t) => pw.Bullet(text: t)),
//             pw.SizedBox(height: 10),
//           ];

//           courseTitles.forEach((courseId, title) {
//             content.add(pw.Text("Course: $title", style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)));
//             final topics = courseTopics[courseId] ?? [];
//             if (topics.isNotEmpty) {
//               content.add(pw.Text("Topics:"));
//               content.addAll(topics.map((t) => pw.Bullet(text: t)));
//             }
//             content.add(pw.SizedBox(height: 10));
//           });

//           return content;
//         },
//       ),
//     );

//     await Printing.layoutPdf(onLayout: (format) async => pdf.save());
//   }

//   @override
//   Widget build(BuildContext context) {
//     final name = widget.childData['name'] ?? 'Unnamed';

//     return Card(
//       elevation: 4,
//       margin: const EdgeInsets.symmetric(vertical: 8),
//       shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
//       child: Padding(
//         padding: const EdgeInsets.all(16),
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             // Header
//             Row(
//               mainAxisAlignment: MainAxisAlignment.spaceBetween,
//               children: [
//                 Text(name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
//               ],
//             ),
//             const SizedBox(height: 12),

//             // Teachers
//             Row(
//               crossAxisAlignment: CrossAxisAlignment.start,
//               children: [
//                 const Icon(Icons.person_outline, size: 20, color: Colors.black54),
//                 const SizedBox(width: 6),
//                 Expanded(
//                   child: Text(
//                     assignedTeachers.isEmpty ? 'No teacher assigned' : assignedTeachers.join(', '),
//                     style: const TextStyle(color: Colors.black87),
//                   ),
//                 ),
//               ],
//             ),
//             const SizedBox(height: 12),

//             // Courses & Topics preview
//             ...courseTitles.entries.map((entry) {
//               final courseId = entry.key;
//               final title = entry.value;
//               final topics = courseTopics[courseId] ?? [];

//               return Column(
//                 crossAxisAlignment: CrossAxisAlignment.start,
//                 children: [
//                   Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
//                   const SizedBox(height: 4),
//                   if (topics.isNotEmpty)
//                     Wrap(
//                       spacing: 6,
//                       runSpacing: -4,
//                       children: topics.take(4).map((topic) => Chip(
//                         label: Text(topic, style: const TextStyle(fontSize: 12)),
//                         backgroundColor: Colors.blue.shade50,
//                         side: BorderSide(color: Colors.blue.shade100),
//                       )).toList(),
//                     ),
//                   if (topics.length > 4)
//                     Text("+${topics.length - 4} more...", style: const TextStyle(fontSize: 12, color: Colors.grey)),
//                   const SizedBox(height: 8),
//                 ],
//               );
//             }),

//             // Buttons
//             Row(
//               mainAxisAlignment: MainAxisAlignment.end,
//               children: [
//                 ElevatedButton.icon(
//                   icon: const Icon(Icons.chat_bubble_outline),
//                   label: const Text("Chat"),
//                   onPressed: _showTeacherSelector,
//                   style: ElevatedButton.styleFrom(
//                     backgroundColor: AppTheme.secondaryColor,
//                     foregroundColor: Colors.white,
//                     shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
//                   ),
//                 ),
//                 const SizedBox(width: 10),
//                 ElevatedButton.icon(
//                   icon: const Icon(Icons.picture_as_pdf),
//                   label: const Text("Export PDF"),
//                   onPressed: _exportToPDF,
//                   style: ElevatedButton.styleFrom(
//                     backgroundColor: Colors.redAccent,
//                     foregroundColor: Colors.white,
//                     shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
//                   ),
//                 ),
//               ],
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }

// /// Dummy ChatScreen
// class ChatScreen extends StatelessWidget {
//   final String chatId;
//   final String teacherEmail;

//   const ChatScreen({super.key, required this.chatId, required this.teacherEmail});

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(title: Text("Chat with $teacherEmail")),
//       body: Center(child: Text("Chat screen for $chatId")),
//     );
//   }
// }
