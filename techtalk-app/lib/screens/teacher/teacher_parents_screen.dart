// lib/screens/teacher/teacher_parents_screen.dart

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:techtalk/models/chat_screen.dart';
// import 'package:techtalk/widgets/child_card.dart';

class TeacherParentsScreen extends StatefulWidget {
  final String teacherId;

  const TeacherParentsScreen({super.key, required this.teacherId});

  @override
  State<TeacherParentsScreen> createState() => _TeacherParentsScreenState();
}

class _TeacherParentsScreenState extends State<TeacherParentsScreen> {
  final supabase = Supabase.instance.client;

  bool _loading = true;

  List<Map<String, dynamic>> _parents = [];

  Map<String, int> _unreadMap = {};

  @override
  void initState() {
    super.initState();

    _loadParents();
    _listenUnreadMessages();
  }

  Future<void> _loadParents() async {
    try {
      final students = await supabase
          .from('users')
          .select()
          .contains('teacher_ids', [widget.teacherId])
          .eq('role', 'student');

      final studentIds = students
          .map<String>((e) => e['id'].toString())
          .toList();

      if (studentIds.isEmpty) {
        setState(() {
          _parents = [];
          _loading = false;
        });
        return;
      }

      final parents = await supabase
          .from('users')
          .select()
          .eq('role', 'parent');

      List<Map<String, dynamic>> matchedParents = [];

      for (final parent in parents) {
        final childrenIds = List<String>.from(parent['children_ids'] ?? []);

        final hasChild = childrenIds.any((id) => studentIds.contains(id));

        if (hasChild) {
          matchedParents.add(parent);
        }
      }

      setState(() {
        _parents = matchedParents;
        _loading = false;
      });
    } catch (e) {
      debugPrint('LOAD PARENTS ERROR: $e');

      setState(() {
        _loading = false;
      });
    }
  }

  void _listenUnreadMessages() {
    supabase.from('messages').stream(primaryKey: ['id']).listen((messages) {
      final Map<String, int> unread = {};

      for (final msg in messages) {
        final senderId = msg['sender_id'];
        final receiverId = msg['receiver_id'];

        if (receiverId != widget.teacherId) continue;

        final isRead = msg['is_read'] ?? false;

        if (!isRead) {
          unread[senderId] = (unread[senderId] ?? 0) + 1;
        }
      }

      if (mounted) {
        setState(() {
          _unreadMap = unread;
        });
      }
    });
  }

  Future<List<Map<String, dynamic>>> _getChildren(
    List<dynamic> childrenIds,
  ) async {
    if (childrenIds.isEmpty) return [];

    final children = await supabase
        .from('users')
        .select()
        .inFilter('id', childrenIds);

    return List<Map<String, dynamic>>.from(children);
  }

  Future<List<Map<String, dynamic>>> _getCourses(
    List<dynamic> courseIds,
  ) async {
    if (courseIds.isEmpty) return [];

    final courses = await supabase
        .from('courses')
        .select()
        .inFilter('id', courseIds);

    return List<Map<String, dynamic>>.from(courses);
  }

  Future<void> _openChat(String parentId, String parentName) async {
    await supabase
        .from('messages')
        .update({'is_read': true})
        .eq('receiver_id', widget.teacherId)
        .eq('sender_id', parentId);

    if (mounted) {
      setState(() {
        _unreadMap[parentId] = 0;
      });
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) =>
            ParentChatScreen(otherUserId: parentId, otherUserName: parentName),
      ),
    );
  }
  //   Navigator.push(
  //     context,
  //     MaterialPageRoute(builder: (_) => ChildCard(childData: {})),
  //   );
  // }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('👨‍👩‍👧 Parents'),
        backgroundColor: Colors.orangeAccent,
      ),

      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _parents.isEmpty
          ? const Center(child: Text('No parents found'))
          : ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: _parents.length,

              itemBuilder: (context, index) {
                final parent = _parents[index];

                final parentId = parent['id'].toString();

                final parentName = parent['name'] ?? parent['email'] ?? '-';

                final childrenIds = List<dynamic>.from(
                  parent['children_ids'] ?? [],
                );

                return Card(
                  margin: const EdgeInsets.symmetric(vertical: 6),

                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),

                  child: ExpansionTile(
                    title: Text(
                      parentName,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),

                    trailing: Stack(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.message, color: Colors.blue),

                          onPressed: () {
                            _openChat(parentId, parentName);
                          },
                        ),

                        if ((_unreadMap[parentId] ?? 0) > 0)
                          Positioned(
                            right: 0,
                            top: 0,
                            child: Container(
                              width: 12,
                              height: 12,

                              decoration: const BoxDecoration(
                                color: Colors.red,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                      ],
                    ),

                    children: [
                      FutureBuilder<List<Map<String, dynamic>>>(
                        future: _getChildren(childrenIds),

                        builder: (context, snapshot) {
                          if (!snapshot.hasData) {
                            return const Padding(
                              padding: EdgeInsets.all(12),
                              child: CircularProgressIndicator(),
                            );
                          }

                          final children = snapshot.data!;

                          return Column(
                            children: children.map((child) {
                              final childName =
                                  child['name'] ?? child['email'] ?? '-';

                              final courseIds = List<dynamic>.from(
                                child['course_ids'] ?? [],
                              );

                              return FutureBuilder<List<Map<String, dynamic>>>(
                                future: _getCourses(courseIds),

                                builder: (context, courseSnap) {
                                  if (!courseSnap.hasData) {
                                    return const SizedBox();
                                  }

                                  final courses = courseSnap.data!;

                                  return Padding(
                                    padding: const EdgeInsets.only(
                                      left: 16,
                                      right: 16,
                                      bottom: 12,
                                    ),

                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,

                                      children: [
                                        Text(
                                          childName,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),

                                        const SizedBox(height: 6),

                                        Wrap(
                                          spacing: 6,
                                          runSpacing: 6,

                                          children: courses.map((course) {
                                            return Chip(
                                              label: Text(
                                                course['title'] ?? '-',

                                                style: const TextStyle(
                                                  fontSize: 12,
                                                ),
                                              ),
                                            );
                                          }).toList(),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              );
                            }).toList(),
                          );
                        },
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:flutter/material.dart';
// import 'package:techtalk/models/chat_screen.dart';
// import 'package:techtalk/widgets/child_card.dart';

// class TeacherParentsScreen extends StatefulWidget {
//   final String teacherId;
//   const TeacherParentsScreen({super.key, required this.teacherId});

//   @override
//   State<TeacherParentsScreen> createState() => _TeacherParentsScreenState();
// }

// class _TeacherParentsScreenState extends State<TeacherParentsScreen> {
//   final _firestore = FirebaseFirestore.instance;
//   Map<String, int> _unreadMap = {};

//   @override
//   void initState() {
//     super.initState();
//     _fetchUnreadMessages();
//   }

//   void _fetchUnreadMessages() {
//     _firestore.collection('chats').snapshots().listen((snapshot) {
//       final Map<String, int> map = {};
//       for (var doc in snapshot.docs) {
//         final data = doc.data();
//         final participants = List<String>.from(data['participants'] ?? []);
//         if (!participants.contains(widget.teacherId)) continue;

//         final messages = List<Map<String, dynamic>>.from(
//           data['messages'] ?? [],
//         );
//         for (var msg in messages) {
//           if (msg['senderId'] != widget.teacherId &&
//               !(msg['readBy'] ?? []).contains(widget.teacherId)) {
//             final parentId = msg['senderId'];
//             map[parentId] = (map[parentId] ?? 0) + 1;
//           }
//         }
//       }
//       setState(() => _unreadMap = map);
//     });
//   }

//   Future<List<DocumentSnapshot>> _getParents() async {
//     final parentSnap = await _firestore
//         .collection('users')
//         .where('role', isEqualTo: 'parent')
//         .get();
//     final parents = <DocumentSnapshot>[];

//     for (var parent in parentSnap.docs) {
//       final childrenIds = (parent['childrenIds'] as List<dynamic>? ?? [])
//           .cast<String>();
//       final childrenDocs = await Future.wait(
//         childrenIds.map((id) => _firestore.collection('users').doc(id).get()),
//       );
//       final relevantChildren = childrenDocs.where((childDoc) {
//         final teacherIds = (childDoc['teacherIds'] as List<dynamic>? ?? [])
//             .cast<String>();
//         return teacherIds.contains(widget.teacherId);
//       }).toList();

//       if (relevantChildren.isNotEmpty) {
//         parents.add(parent);
//       }
//     }
//     return parents;
//   }

//   Future<List<DocumentSnapshot>> _getChildCourses(
//     DocumentSnapshot childDoc,
//   ) async {
//     final courseIds = (childDoc['courseIds'] as List<dynamic>? ?? [])
//         .cast<String>();
//     final coursesDocs = await Future.wait(
//       courseIds.map((cid) => _firestore.collection('courses').doc(cid).get()),
//     );
//     return coursesDocs.where((courseDoc) {
//       final teacherIds = (childDoc['teacherIds'] as List<dynamic>? ?? [])
//           .cast<String>();
//       return teacherIds.contains(widget.teacherId);
//     }).toList();
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('👨‍👩‍👧 Parents'),
//         backgroundColor: Colors.orangeAccent,
//       ),
//       body: FutureBuilder<List<DocumentSnapshot>>(
//         future: _getParents(),
//         builder: (context, snapshot) {
//           if (!snapshot.hasData)
//             return const Center(child: CircularProgressIndicator());
//           final parents = snapshot.data!;
//           if (parents.isEmpty)
//             return const Center(child: Text('No parents yet.'));

//           return ListView.builder(
//             padding: const EdgeInsets.all(12),
//             itemCount: parents.length,
//             itemBuilder: (context, index) {
//               final parent = parents[index];
//               final parentId = parent.id;
//               final parentName = parent['name'] ?? parent['email'] ?? '-';
//               final childrenIds =
//                   (parent['childrenIds'] as List<dynamic>? ?? [])
//                       .cast<String>();

//               return Card(
//                 margin: const EdgeInsets.symmetric(vertical: 6),
//                 shape: RoundedRectangleBorder(
//                   borderRadius: BorderRadius.circular(12),
//                 ),
//                 child: ExpansionTile(
//                   title: Text(
//                     parentName,
//                     style: const TextStyle(fontWeight: FontWeight.bold),
//                   ),
//                   trailing: Stack(
//                     children: [
//                       IconButton(
//                         icon: const Icon(Icons.message, color: Colors.blue),
//                         onPressed: () {
//                           Navigator.push(
//                             context,
//                             MaterialPageRoute(
//                               builder: (_) => const ParentChatScreen(
//                                 chatId: '',
//                                 teacherEmail: '',
//                               ),
//                             ),
//                           );
//                         },
//                       ),
//                       if (_unreadMap[parentId] != null &&
//                           _unreadMap[parentId]! > 0)
//                         Positioned(
//                           right: 4,
//                           top: 4,
//                           child: Container(
//                             width: 10,
//                             height: 10,
//                             decoration: const BoxDecoration(
//                               color: Colors.red,
//                               shape: BoxShape.circle,
//                             ),
//                           ),
//                         ),
//                     ],
//                   ),
//                   children: childrenIds.map((childId) {
//                     return FutureBuilder<DocumentSnapshot>(
//                       future: _firestore.collection('users').doc(childId).get(),
//                       builder: (context, childSnap) {
//                         if (!childSnap.hasData) return const SizedBox();
//                         final childData = childSnap.data!;
//                         final childName =
//                             childData['name'] ?? childData['email'] ?? '-';

//                         return FutureBuilder<List<DocumentSnapshot>>(
//                           future: _getChildCourses(childData),
//                           builder: (context, coursesSnap) {
//                             if (!coursesSnap.hasData) return const SizedBox();
//                             final courses = coursesSnap.data!;

//                             return Padding(
//                               padding: const EdgeInsets.only(left: 16),
//                               child: Column(
//                                 crossAxisAlignment: CrossAxisAlignment.start,
//                                 children: [
//                                   Text(
//                                     childName,
//                                     style: const TextStyle(
//                                       fontWeight: FontWeight.bold,
//                                     ),
//                                   ),
//                                   Wrap(
//                                     spacing: 6,
//                                     children: courses.map((course) {
//                                       final title = course['title'] ?? '-';
//                                       return Chip(
//                                         label: Text(
//                                           title,
//                                           style: const TextStyle(fontSize: 12),
//                                         ),
//                                       );
//                                     }).toList(),
//                                   ),
//                                   const SizedBox(height: 8),
//                                 ],
//                               ),
//                             );
//                           },
//                         );
//                       },
//                     );
//                   }).toList(),
//                 ),
//               );
//             },
//           );
//         },
//       ),
//     );
//   }
// }
