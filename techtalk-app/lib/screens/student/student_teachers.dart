import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:techtalk/constants/app_theme.dart';
import 'package:techtalk/models/chat_screen.dart';
// import 'package:techtalk/widgets/child_card.dart'; //*****

class StudentTeachersScreen extends StatefulWidget {
  const StudentTeachersScreen({super.key, required String studentId});

  @override
  State<StudentTeachersScreen> createState() => _StudentTeachersScreenState();
}

class _StudentTeachersScreenState extends State<StudentTeachersScreen> {
  final _firestore = FirebaseFirestore.instance;

  List<String> _teacherIds = [];
  Map<String, String> _courseTitles = {};

  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final user = FirebaseAuth.instance.currentUser!;
    final doc = await _firestore.collection('users').doc(user.uid).get();

    final data = doc.data() ?? {};

    _teacherIds = List<String>.from(data['teacherIds'] ?? []);

    final courses = await _firestore.collection('courses').get();

    _courseTitles = {for (var c in courses.docs) c.id: c['title'] ?? c.id};

    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_teacherIds.isEmpty) {
      return const Scaffold(body: Center(child: Text("No teachers")));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text("Teachers"),
        backgroundColor: AppTheme.primaryColor,
      ),
      body: StreamBuilder(
        stream: _firestore
            .collection('users')
            .where(FieldPath.documentId, whereIn: _teacherIds)
            .snapshots(),
        builder: (c, snap) {
          if (!snap.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          final teachers = snap.data!.docs;

          return ListView(
            children: teachers.map((t) {
              final courseIds = List<String>.from(t['courses'] ?? []);

              return Card(
                margin: const EdgeInsets.all(10),
                child: ListTile(
                  title: Text(t['name'] ?? ''),
                  subtitle: Text(t['email'] ?? ''),
                  trailing: IconButton(
                    icon: const Icon(Icons.chat),
                    onPressed: () {
                      final studentId = FirebaseAuth.instance.currentUser!.uid;

                      final chatId = studentId.compareTo(t.id) < 0
                          ? '${studentId}_${t.id}'
                          : '${t.id}_$studentId';

                      // Navigator.push(
                      //   context,
                      //   MaterialPageRoute(
                      //     builder: (_) => ChatService(
                      //       chatId: chatId,
                      //       teacherEmail: t['email'],
                      //     ),
                      //   ),
                      // );
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => ParentChatScreen(
                            otherUserId: t.id,
                            otherUserName: t['email'],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              );
            }).toList(),
          );
        },
      ),
    );
  }
}
// import 'package:flutter/material.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:techtalk/constants/app_theme.dart';
// import 'package:techtalk/widgets/child_card.dart';

// class StudentTeachersScreen extends StatefulWidget {
//   const StudentTeachersScreen({super.key, required String studentId});

//   @override
//   State<StudentTeachersScreen> createState() => _StudentTeachersScreenState();
// }

// class _StudentTeachersScreenState extends State<StudentTeachersScreen> {
//   final _firestore = FirebaseFirestore.instance;
//   List<String> _teacherIds = [];
//   Map<String, String> _courseTitles = {}; // courseId -> title
//   bool _isLoading = true;

//   @override
//   void initState() {
//     super.initState();
//     _loadTeacherIdsAndCourses();
//   }

//   Future<void> _loadTeacherIdsAndCourses() async {
//     try {
//       final user = FirebaseAuth.instance.currentUser!;
//       final userDoc = await _firestore.collection('users').doc(user.uid).get();
//       final data = userDoc.data();

//       _teacherIds = List<String>.from(data?['teacherIds'] ?? []);

//       // Load all courses (for title lookup)
//       final coursesSnap = await _firestore.collection('courses').get();
//       _courseTitles = {
//         for (var doc in coursesSnap.docs) doc.id: (doc['title'] ?? doc.id).toString(),
//       };
//     } catch (e) {
//       // silently ignore errors for now
//     }

//     setState(() => _isLoading = false);
//   }

//   @override
//   Widget build(BuildContext context) {
//     if (_isLoading) {
//       return const Scaffold(
//         body: Center(child: CircularProgressIndicator()),
//       );
//     }

//     if (_teacherIds.isEmpty) {
//       return const Scaffold(
//         body: Center(child: Text('No teachers assigned yet.')),
//       );
//     }

//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('👩‍🏫 My Teachers'),
//         backgroundColor: AppTheme.primaryColor,
//         foregroundColor: Colors.white,
//       ),
//       body: StreamBuilder<QuerySnapshot>(
//         stream: _firestore
//             .collection('users')
//             .where(FieldPath.documentId, whereIn: _teacherIds)
//             .where('role', isEqualTo: 'teacher')
//             .snapshots(),
//         builder: (context, snapshot) {
//           if (snapshot.connectionState == ConnectionState.waiting) {
//             return const Center(child: CircularProgressIndicator());
//           }
//           if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
//             return const Center(child: Text('No teachers found.'));
//           }

//           final teachers = snapshot.data!.docs;

//           return ListView.builder(
//             itemCount: teachers.length,
//             padding: const EdgeInsets.all(16),
//             itemBuilder: (context, index) {
//               final teacher = teachers[index];
//               final teacherId = teacher.id;
//               final name = teacher['name'] ?? 'Unnamed Teacher';
//               final email = teacher['email'] ?? '';
//               final courseIds = List<String>.from(teacher['courses'] ?? []);
//               final validCourseTitles = courseIds
//                   .map((id) => _courseTitles[id] ?? id)
//                   .toList();

//               return Container(
//                 margin: const EdgeInsets.symmetric(vertical: 10),
//                 padding: const EdgeInsets.all(16),
//                 decoration: BoxDecoration(
//                   // color: Colors.white,
//                   color: Color(0xFFFDF4E3), // soft cream tone
//                   borderRadius: BorderRadius.circular(20),
//                   boxShadow: [
//                     BoxShadow(
//                       color: Colors.black.withOpacity(0.08),
//                       blurRadius: 8,
//                       offset: const Offset(0, 3),
//                     ),
//                   ],
//                 ),
//                 child: Column(
//                   crossAxisAlignment: CrossAxisAlignment.start,
//                   children: [
//                     Row(
//                       crossAxisAlignment: CrossAxisAlignment.center,
//                       children: [
//                         CircleAvatar(
//                           backgroundColor: AppTheme.secondaryColor,
//                           child: const Icon(Icons.person, color: Colors.white),
//                         ),
//                         const SizedBox(width: 12),
//                         Expanded(
//                           child: Column(
//                             crossAxisAlignment: CrossAxisAlignment.start,
//                             children: [
//                               Text(
//                                 name,
//                                 style: const TextStyle(
//                                   fontWeight: FontWeight.bold,
//                                   fontSize: 16,
//                                   color: Colors.black87,
//                                 ),
//                               ),
//                               const SizedBox(height: 2),
//                               Text(
//                                 email,
//                                 style: const TextStyle(
//                                   color: Colors.black54,
//                                   fontSize: 13,
//                                 ),
//                               ),
//                             ],
//                           ),
//                         ),
//                         IconButton(
//                           icon: const Icon(Icons.message, color: Colors.blueAccent),
//                           onPressed: () {
//                             final studentId = FirebaseAuth.instance.currentUser!.uid;
//                             final chatId = studentId.compareTo(teacherId) < 0
//                                 ? '${studentId}_$teacherId'
//                                 : '${teacherId}_$studentId';

//                             Navigator.push(
//                               context,
//                               MaterialPageRoute(
//                                 builder: (_) => ChatScreen(
//                                   chatId: chatId,
//                                   teacherEmail: email,
//                                 ),
//                               ),
//                             );
//                           },
//                         ),
//                       ],
//                     ),
//                     const SizedBox(height: 10),
//                     const Text(
//                       "Courses:",
//                       style: TextStyle(
//                         fontWeight: FontWeight.w600,
//                         color: Colors.black87,
//                       ),
//                     ),
//                     const SizedBox(height: 6),
//                     Wrap(
//                       spacing: 8,
//                       runSpacing: 8,
//                       children: validCourseTitles.map((title) {
//                         return Container(
//                           padding: const EdgeInsets.symmetric(
//                             horizontal: 12,
//                             vertical: 6,
//                           ),
//                           decoration: BoxDecoration(
//                             color: AppTheme.secondaryColor.withOpacity(0.15),
//                             borderRadius: BorderRadius.circular(20),
//                             border: Border.all(
//                               color: AppTheme.secondaryColor.withOpacity(0.4),
//                             ),
//                           ),
//                           child: Row(
//                             mainAxisSize: MainAxisSize.min,
//                             children: [
//                               const Icon(Icons.circle_outlined,
//                                   color: Colors.grey, size: 13),
//                               const SizedBox(width: 6),
//                               Text(
//                                 title,
//                                 style: const TextStyle(
//                                   fontSize: 13,
//                                   color: Colors.black87,
//                                 ),
//                               ),
//                             ],
//                           ),
//                         );
//                       }).toList(),
//                     ),
//                   ],
//                 ),
//               );
//             },
//           );
//         },
//       ),
//     );
//   }
// }
