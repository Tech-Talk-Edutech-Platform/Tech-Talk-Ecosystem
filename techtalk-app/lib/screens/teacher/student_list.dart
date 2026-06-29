import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// import 'package:techtalk/screens/chat/chat_screen.dart';

class TeacherStudentMessagingScreen extends StatefulWidget {
  final String teacherId;

  const TeacherStudentMessagingScreen({super.key, required this.teacherId});

  @override
  State<TeacherStudentMessagingScreen> createState() =>
      _TeacherStudentMessagingScreenState();
}

class _TeacherStudentMessagingScreenState
    extends State<TeacherStudentMessagingScreen> {
  final supabase = Supabase.instance.client;

  bool _loading = true;

  String? _selectedCourseId;
  String _sortField = 'full_name';
  bool _ascending = true;

  List<Map<String, dynamic>> _students = [];
  List<Map<String, dynamic>> _courses = [];

  // courseId -> title
  Map<String, String> _courseMap = {};

  // studentId -> unread count
  Map<String, int> _unreadMap = {};

  RealtimeChannel? _studentsChannel;
  RealtimeChannel? _messagesChannel;

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  @override
  void dispose() {
    if (_studentsChannel != null) {
      supabase.removeChannel(_studentsChannel!);
    }

    if (_messagesChannel != null) {
      supabase.removeChannel(_messagesChannel!);
    }

    super.dispose();
  }

  Future<void> _initialize() async {
    await Future.wait([_loadCourses(), _loadStudents(), _loadUnreadMessages()]);

    _listenStudentsRealtime();
    _listenMessagesRealtime();

    if (mounted) {
      setState(() => _loading = false);
    }
  }

  Future<void> _loadCourses() async {
    try {
      final response = await supabase
          .from('courses')
          .select('id, title')
          .order('title');

      final courses = List<Map<String, dynamic>>.from(response);

      final map = <String, String>{};

      for (final course in courses) {
        map[course['id']] = course['title'] ?? '-';
      }

      if (mounted) {
        setState(() {
          _courses = courses;
          _courseMap = map;
        });
      }
    } catch (e) {
      debugPrint("Error loading courses: $e");
    }
  }

  Future<void> _loadStudents() async {
    try {
      final response = await supabase
          .from('student_teacher_courses')
          .select('''
            student_id,
            course_id,
            profiles!student_teacher_courses_student_id_fkey (
              id,
              full_name,
              email,
              avatar_url
            )
          ''')
          .eq('teacher_id', widget.teacherId);

      final rows = List<Map<String, dynamic>>.from(response);

      final Map<String, Map<String, dynamic>> grouped = {};

      for (final row in rows) {
        final profile = row['profiles'];

        if (profile == null) continue;

        final studentId = profile['id'];

        if (!grouped.containsKey(studentId)) {
          grouped[studentId] = {
            'id': studentId,
            'name': profile['full_name'] ?? 'Unknown',
            'email': profile['email'] ?? '',
            'avatar': profile['avatar_url'],
            'courseIds': <String>[],
          };
        }

        grouped[studentId]!['courseIds'].add(row['course_id']);
      }

      final students = grouped.values.toList();

      students.sort((a, b) {
        final aVal = (a[_sortField == 'email' ? 'email' : 'name'] ?? '')
            .toString();
        final bVal = (b[_sortField == 'email' ? 'email' : 'name'] ?? '')
            .toString();

        return _ascending ? aVal.compareTo(bVal) : bVal.compareTo(aVal);
      });

      if (mounted) {
        setState(() {
          _students = students;
        });
      }
    } catch (e) {
      debugPrint("Error loading students: $e");
    }
  }

  Future<void> _loadUnreadMessages() async {
    try {
      final response = await supabase
          .from('messages')
          .select('sender_id, read_by')
          .eq('receiver_id', widget.teacherId)
          .eq('is_read', false);

      final messages = List<Map<String, dynamic>>.from(response);

      final map = <String, int>{};

      for (final msg in messages) {
        final senderId = msg['sender_id'];

        map[senderId] = (map[senderId] ?? 0) + 1;
      }

      if (mounted) {
        setState(() {
          _unreadMap = map;
        });
      }
    } catch (e) {
      debugPrint("Error loading unread messages: $e");
    }
  }

  void _listenStudentsRealtime() {
    _studentsChannel = supabase
        .channel('teacher-students')
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'student_teacher_courses',
          callback: (payload) async {
            await _loadStudents();
          },
        )
        .subscribe();
  }

  void _listenMessagesRealtime() {
    _messagesChannel = supabase
        .channel('teacher-messages')
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'messages',
          callback: (payload) async {
            await _loadUnreadMessages();
          },
        )
        .subscribe();
  }

  Future<void> _openChat(String studentId, String studentName) async {
    try {
      await supabase
          .from('messages')
          .update({
            'is_read': true,
            'read_at': DateTime.now().toIso8601String(),
          })
          .eq('sender_id', studentId)
          .eq('receiver_id', widget.teacherId)
          .eq('is_read', false);

      setState(() {
        _unreadMap.remove(studentId);
      });

      // Navigator.push(
      //   context,
      //   MaterialPageRoute(
      //     builder: (_) => ChatScreen(
      //       teacherId: widget.teacherId,
      //       studentId: studentId,
      //       studentName: studentName,
      //     ),
      //   ),
      // );
    } catch (e) {
      debugPrint("Error opening chat: $e");
    }
  }

  List<Map<String, dynamic>> get _filteredStudents {
    if (_selectedCourseId == null) return _students;

    return _students.where((student) {
      final courseIds = List<String>.from(student['courseIds'] ?? []);

      return courseIds.contains(_selectedCourseId);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("My Students"),
        backgroundColor: Colors.orangeAccent,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                _buildFilters(),
                Expanded(
                  child: _filteredStudents.isEmpty
                      ? const Center(child: Text("No students found."))
                      : RefreshIndicator(
                          onRefresh: _initialize,
                          child: ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: _filteredStudents.length,
                            itemBuilder: (context, index) {
                              final student = _filteredStudents[index];

                              final studentId = student['id'];

                              final courseTitles = List<String>.from(
                                student['courseIds'] ?? [],
                              ).map((id) => _courseMap[id] ?? '-').toList();

                              return Card(
                                margin: const EdgeInsets.symmetric(vertical: 6),
                                elevation: 2,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: ListTile(
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 14,
                                    vertical: 10,
                                  ),
                                  leading: CircleAvatar(
                                    radius: 24,
                                    backgroundColor:
                                        Colors.orangeAccent.shade100,
                                    backgroundImage: student['avatar'] != null
                                        ? NetworkImage(student['avatar'])
                                        : null,
                                    child: student['avatar'] == null
                                        ? Text(
                                            student['name']
                                                .toString()
                                                .substring(0, 1)
                                                .toUpperCase(),
                                            style: const TextStyle(
                                              color: Colors.black,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          )
                                        : null,
                                  ),
                                  title: Text(
                                    student['name'],
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  subtitle: Padding(
                                    padding: const EdgeInsets.only(top: 6),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(student['email']),
                                        const SizedBox(height: 6),
                                        Wrap(
                                          spacing: 6,
                                          runSpacing: 4,
                                          children: courseTitles
                                              .map(
                                                (title) => Chip(
                                                  label: Text(
                                                    title,
                                                    style: const TextStyle(
                                                      fontSize: 11,
                                                    ),
                                                  ),
                                                  backgroundColor: Colors
                                                      .orangeAccent
                                                      .shade100,
                                                ),
                                              )
                                              .toList(),
                                        ),
                                      ],
                                    ),
                                  ),
                                  trailing: Stack(
                                    clipBehavior: Clip.none,
                                    children: [
                                      IconButton(
                                        icon: const Icon(
                                          Icons.message,
                                          color: Colors.blue,
                                        ),
                                        onPressed: () => _openChat(
                                          studentId,
                                          student['name'],
                                        ),
                                      ),
                                      if (_unreadMap[studentId] != null &&
                                          _unreadMap[studentId]! > 0)
                                        Positioned(
                                          top: -2,
                                          right: -2,
                                          child: CircleAvatar(
                                            radius: 9,
                                            backgroundColor: Colors.red,
                                            child: Text(
                                              _unreadMap[studentId].toString(),
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                ),
              ],
            ),
    );
  }

  Widget _buildFilters() {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          Expanded(
            child: DropdownButtonFormField<String>(
              initialValue: _selectedCourseId,
              decoration: InputDecoration(
                hintText: "Filter by course",
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 10,
                ),
              ),
              items: [
                const DropdownMenuItem<String>(
                  value: null,
                  child: Text("All Courses"),
                ),
                ..._courses.map(
                  (course) => DropdownMenuItem<String>(
                    value: course['id'],
                    child: Text(course['title'] ?? '-'),
                  ),
                ),
              ],
              onChanged: (value) {
                setState(() {
                  _selectedCourseId = value;
                });
              },
            ),
          ),
          const SizedBox(width: 10),
          DropdownButton<String>(
            value: _sortField,
            borderRadius: BorderRadius.circular(12),
            items: const [
              DropdownMenuItem(value: 'full_name', child: Text("Name")),
              DropdownMenuItem(value: 'email', child: Text("Email")),
            ],
            onChanged: (value) async {
              if (value == null) return;

              setState(() {
                _sortField = value;
              });

              await _loadStudents();
            },
          ),
          IconButton(
            icon: Icon(
              _ascending
                  ? Icons.arrow_upward_rounded
                  : Icons.arrow_downward_rounded,
            ),
            onPressed: () async {
              setState(() {
                _ascending = !_ascending;
              });

              await _loadStudents();
            },
          ),
        ],
      ),
    );
  }
}
// import 'package:flutter/material.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:techtalk/widgets/child_card.dart';

// class TeacherStudentMessagingScreen extends StatefulWidget {
//   final String teacherId;
//   const TeacherStudentMessagingScreen({super.key, required this.teacherId});

//   @override
//   State<TeacherStudentMessagingScreen> createState() =>
//       _TeacherStudentMessagingScreenState();
// }

// class _TeacherStudentMessagingScreenState
//     extends State<TeacherStudentMessagingScreen> {
//   final FirebaseFirestore _firestore = FirebaseFirestore.instance;

//   String? _selectedCourseId;
//   String _sortField = 'name';
//   bool _ascending = true;

//   Map<String, String> _courseMap = {};
//   Map<String, int> _unreadMap = {}; // studentId -> unread count

//   @override
//   void initState() {
//     super.initState();
//     _loadCourses();
//     _loadUnreadMessages();
//   }

//   void _loadCourses() {
//     _firestore.collection('courses').snapshots().listen((snapshot) {
//       final Map<String, String> map = {
//         for (var doc in snapshot.docs) doc.id: (doc.data())['title'] ?? '-'
//       };
//       setState(() => _courseMap = map);
//     });
//   }

//   void _loadUnreadMessages() {
//     _firestore.collection('chats').snapshots().listen((snapshot) {
//       final Map<String, int> map = {};
//       for (var doc in snapshot.docs) {
//         final data = doc.data();
//         final participants = List<String>.from(data['participants'] ?? []);
//         if (!participants.contains(widget.teacherId)) continue;

//         final messages = List<Map<String, dynamic>>.from(data['messages'] ?? []);
//         for (var msg in messages) {
//           final senderId = msg['senderId'];
//           if (senderId != widget.teacherId &&
//               !(msg['readBy'] ?? []).contains(widget.teacherId)) {
//             map[senderId] = (map[senderId] ?? 0) + 1;
//           }
//         }
//       }
//       setState(() => _unreadMap = map);
//     });
//   }

//   Query _buildQuery() {
//     var query = _firestore
//         .collection('users')
//         .where('role', isEqualTo: 'student')
//         .where('teacherIds', arrayContains: widget.teacherId);
//     query = query.orderBy(_sortField, descending: !_ascending);
//     return query;
//   }

//   void _openChat(String studentId, String studentName) async {
//     // Navigate to ChatScreen
//     Navigator.push(
//       context,
//       MaterialPageRoute(
//         builder: (_) => ChatScreen(chatId: '', teacherEmail: '',
//           // teacherId: widget.teacherId,
//           // studentId: studentId,
//           // studentName: studentName,
//         ),
//       ),
//     );

//     // Mark unread messages as read in Firestore
//     final chatQuery = await _firestore
//         .collection('chats')
//         .where('participants', arrayContains: widget.teacherId)
//         .get();

//     for (var doc in chatQuery.docs) {
//       final data = doc.data();
//       if ((data['participants'] as List).contains(studentId)) {
//         final messages = List<Map<String, dynamic>>.from(data['messages'] ?? []);
//         for (var i = 0; i < messages.length; i++) {
//           final msg = messages[i];
//           final readBy = List<String>.from(msg['readBy'] ?? []);
//           if (!readBy.contains(widget.teacherId)) {
//             readBy.add(widget.teacherId);
//             messages[i]['readBy'] = readBy;
//           }
//         }
//         await doc.reference.update({'messages': messages});
//       }
//     }

//     // Update local unread map immediately
//     setState(() {
//       _unreadMap.remove(studentId);
//     });
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text("My Students"),
//         backgroundColor: Colors.orangeAccent,
//       ),
//       body: Column(
//         children: [
//           _buildFilters(),
//           Expanded(
//             child: StreamBuilder<QuerySnapshot>(
//               stream: _buildQuery().snapshots(),
//               builder: (context, snapshot) {
//                 if (!snapshot.hasData) {
//                   return const Center(child: CircularProgressIndicator());
//                 }

//                 final students = snapshot.data!.docs.map((doc) {
//                   final data = doc.data() as Map<String, dynamic>;
//                   return {
//                     'id': doc.id,
//                     'name': data['name'] ?? '-',
//                     'email': data['email'] ?? '-',
//                     'courseIds': data['teacherIdsMap']?[widget.teacherId] ?? [],
//                   };
//                 }).toList();

//                 final filteredStudents = _selectedCourseId == null
//                     ? students
//                     : students
//                         .where((s) =>
//                             (s['courseIds'] as List).contains(_selectedCourseId))
//                         .toList();

//                 if (filteredStudents.isEmpty) {
//                   return const Center(child: Text('No students found.'));
//                 }

//                 return ListView.builder(
//                   padding: const EdgeInsets.all(12),
//                   itemCount: filteredStudents.length,
//                   itemBuilder: (context, index) {
//                     final s = filteredStudents[index];
//                     final studentId = s['id'];
//                     final courseTitles = (s['courseIds'] as List)
//                         .map((id) => _courseMap[id] ?? '-')
//                         .toList();

//                     return Card(
//                       margin: const EdgeInsets.symmetric(vertical: 6),
//                       shape: RoundedRectangleBorder(
//                           borderRadius: BorderRadius.circular(12)),
//                       child: ListTile(
//                         title: Text(s['name']),
//                         subtitle: courseTitles.isEmpty
//                             ? Text(s['email'])
//                             : Wrap(
//                                 spacing: 6,
//                                 runSpacing: 4,
//                                 children: [
//                                   Text(s['email']),
//                                   ...courseTitles
//                                       .map((t) => Chip(
//                                             label: Text(t,
//                                                 style: const TextStyle(
//                                                     fontSize: 12)),
//                                             backgroundColor:
//                                                 Colors.orangeAccent.shade100,
//                                           ))

//                                 ],
//                               ),
//                         trailing: Stack(
//                           clipBehavior: Clip.none,
//                           children: [
//                             IconButton(
//                               icon: const Icon(Icons.message, color: Colors.blue),
//                               onPressed: () => _openChat(studentId, s['name']),
//                             ),
//                             if (_unreadMap[studentId] != null &&
//                                 _unreadMap[studentId]! > 0)
//                               Positioned(
//                                 top: -2,
//                                 left: -2,
//                                 child: CircleAvatar(
//                                   radius: 8,
//                                   backgroundColor: Colors.red,
//                                   child: Text(
//                                     _unreadMap[studentId]!.toString(),
//                                     style: const TextStyle(
//                                         color: Colors.white, fontSize: 10),
//                                   ),
//                                 ),
//                               ),
//                           ],
//                         ),
//                       ),
//                     );
//                   },
//                 );
//               },
//             ),
//           ),
//         ],
//       ),
//     );
//   }

//   Widget _buildFilters() {
//     return Padding(
//       padding: const EdgeInsets.all(12),
//       child: Row(
//         children: [
//           Expanded(
//             child: DropdownButtonFormField<String>(
//               initialValue: _selectedCourseId,
//               hint: const Text("Filter by course"),
//               items: [
//                 const DropdownMenuItem(value: null, child: Text("All Courses")),
//                 ..._courseMap.entries
//                     .map((e) =>
//                         DropdownMenuItem(value: e.key, child: Text(e.value)))
//               ],
//               onChanged: (val) {
//                 setState(() => _selectedCourseId = val);
//               },
//             ),
//           ),
//           const SizedBox(width: 12),
//           DropdownButton<String>(
//             value: _sortField,
//             items: const [
//               DropdownMenuItem(value: 'name', child: Text("Sort by Name")),
//               DropdownMenuItem(value: 'email', child: Text("Sort by Email")),
//             ],
//             onChanged: (val) {
//               if (val != null) setState(() => _sortField = val);
//             },
//           ),
//           IconButton(
//             icon: Icon(_ascending ? Icons.arrow_upward : Icons.arrow_downward),
//             onPressed: () => setState(() => _ascending = !_ascending),
//           )
//         ],
//       ),
//     );
//   }
// }
