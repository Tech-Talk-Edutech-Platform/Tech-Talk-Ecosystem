import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class UserListScreen extends StatefulWidget {
  const UserListScreen({super.key});

  @override
  State<UserListScreen> createState() => _UserListScreenState();
}

class _UserListScreenState extends State<UserListScreen> {
  final supabase = Supabase.instance.client;

  String _filterRole = 'all';
  String _search = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Users")),
      body: FutureBuilder(
        future: supabase.from('users').select(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          List users = snapshot.data as List;

          // filter role
          if (_filterRole != 'all') {
            users = users.where((u) => u['role'] == _filterRole).toList();
          }

          // search
          if (_search.isNotEmpty) {
            users = users.where((u) {
              final email = (u['email'] ?? '').toString().toLowerCase();
              final name = (u['full_name'] ?? '').toString().toLowerCase();
              return email.contains(_search) || name.contains(_search);
            }).toList();
          }

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(8),
                child: TextField(
                  decoration: const InputDecoration(
                    hintText: "Search users",
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (v) => setState(() => _search = v.toLowerCase()),
                ),
              ),

              DropdownButton<String>(
                value: _filterRole,
                items: const [
                  DropdownMenuItem(value: 'all', child: Text('All')),
                  DropdownMenuItem(value: 'student', child: Text('Students')),
                  DropdownMenuItem(value: 'teacher', child: Text('Teachers')),
                  DropdownMenuItem(value: 'parent', child: Text('Parents')),
                ],
                onChanged: (v) => setState(() => _filterRole = v!),
              ),

              Expanded(
                child: ListView.builder(
                  itemCount: users.length,
                  itemBuilder: (context, i) {
                    final u = users[i];

                    return Card(
                      child: ListTile(
                        title: Text(u['email'] ?? ''),
                        subtitle: Text(u['role'] ?? ''),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete),
                          onPressed: () async {
                            await supabase
                                .from('users')
                                .delete()
                                .eq('id', u['id']);
                          },
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

// // // lib/screens/user_list_screen.dart
// import 'package:flutter/material.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';

// class UserListScreen extends StatefulWidget {
//   const UserListScreen({super.key});

//   @override
//   State<UserListScreen> createState() => _UserListScreenState();
// }

// class _UserListScreenState extends State<UserListScreen> {
//   final _firestore = FirebaseFirestore.instance;
//   String _filterRole = 'all';
//   String _searchQuery = '';

//   Map<String, String> _courseMap = {};
//   Map<String, String> _userEmailMap = {};

//   Stream<QuerySnapshot>? _userStream;

//   @override
//   void initState() {
//     super.initState();
//     _initStreams();
//   }

//   void _initStreams() {
//     // Users stream - used to resolve emails for related IDs (parents, teachers, children)
//     _firestore.collection('users').snapshots().listen((snapshot) {
//       final Map<String, String> newMap = {
//         for (var doc in snapshot.docs)
//           doc.id: (doc.data())['email']?.toString() ?? '-'
//       };
//       setState(() => _userEmailMap = newMap);
//     });

//     // Courses stream - id -> title
//     _firestore.collection('courses').snapshots().listen((snapshot) {
//       final Map<String, String> newMap = {
//         for (var doc in snapshot.docs)
//           doc.id: (doc.data())['title']?.toString() ?? doc.id
//       };
//       setState(() => _courseMap = newMap);
//     });

//     _updateUserStream();
//   }

//   void _updateUserStream() {
//     _userStream = _filterRole == 'all'
//         ? _firestore.collection('users').orderBy('email').snapshots()
//         : _firestore.collection('users').where('role', isEqualTo: _filterRole).orderBy('email').snapshots();
//     setState(() {});
//   }

//   void _onFilterChanged(String? val) {
//     if (val == null) return;
//     setState(() {
//       _filterRole = val;
//       _updateUserStream();
//     });
//   }

//   bool _matchesSearch(Map<String, dynamic> data) {
//     if (_searchQuery.isEmpty) return true;
//     final query = _searchQuery.toLowerCase();

//     final email = (data['email'] ?? '').toString().toLowerCase();
//     final name = (data['name'] ?? '').toString().toLowerCase();
//     final role = (data['role'] ?? '').toString().toLowerCase();

//     if (email.contains(query) || name.contains(query) || role.contains(query)) return true;

//     if (role == 'student') {
//       final courseIds = (data['courseIds'] as List<dynamic>? ?? []);
//       for (var cid in courseIds) {
//         final course = (_courseMap[cid.toString()] ?? '').toLowerCase();
//         if (course.contains(query)) return true;
//       }
//       final parentIds = (data['parentIds'] as List<dynamic>? ?? []);
//       for (var pid in parentIds) {
//         final pEmail = (_userEmailMap[pid.toString()] ?? '').toLowerCase();
//         if (pEmail.contains(query)) return true;
//       }
//     }

//     if (role == 'teacher') {
//       final courses = (data['courses'] as List<dynamic>? ?? []);
//       for (var c in courses) {
//         final courseName = (_courseMap[c.toString()] ?? '').toLowerCase();
//         if (courseName.contains(query)) return true;
//       }
//     }

//     if (role == 'parent') {
//       final children = (data['children'] as List<dynamic>? ?? []);
//       for (var cid in children) {
//         final cEmail = (_userEmailMap[cid.toString()] ?? '').toLowerCase();
//         if (cEmail.contains(query)) return true;
//       }
//     }

//     return false;
//   }

//   TextSpan _highlightAll(String text) {
//     if (_searchQuery.isEmpty) return TextSpan(text: text, style: const TextStyle(color: Colors.black));
//     final query = _searchQuery.toLowerCase();
//     final lowerText = text.toLowerCase();
//     final spans = <TextSpan>[];
//     int start = 0;

//     while (true) {
//       final index = lowerText.indexOf(query, start);
//       if (index < 0) {
//         spans.add(TextSpan(text: text.substring(start)));
//         break;
//       }
//       if (index > start) spans.add(TextSpan(text: text.substring(start, index)));
//       spans.add(TextSpan(
//           text: text.substring(index, index + query.length),
//           style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)));
//       start = index + query.length;
//     }

//     return TextSpan(children: spans, style: const TextStyle(color: Colors.black));
//   }

//   Future<Map<String, dynamic>> _fetchStudentProgressAndSubmissions(String studentId, List<dynamic> courseIds) async {
//     final Map<String, dynamic> out = {'courses': {}};

//     for (var c in courseIds) {
//       final courseId = c.toString();
//       final courseDoc = await _firestore.collection('courses').doc(courseId).get();
//       final courseTitle = (courseDoc.data()?['title'] ?? courseId).toString();

//       final Map<String, dynamic> courseMap = {
//         'title': courseTitle,
//         'topics': <Map<String, dynamic>>[],
//         'projects': <Map<String, dynamic>>[]
//       };

//       // Topics
//       final topicsSnap = await _firestore.collection('courses').doc(courseId).collection('topics').get();
//       for (var t in topicsSnap.docs) {
//         final tData = t.data();
//         final progress = tData['progress'];
//         Map<String, dynamic>? progressForStudent;

//         if (progress is Map) {
//           if (progress.containsKey(studentId)) {
//             if (progress[studentId] is Map) progressForStudent = Map<String, dynamic>.from(progress[studentId]);
//           } else {
//             progressForStudent = Map<String, dynamic>.from(progress);
//           }
//         }

//         (courseMap['topics'] as List).add({
//           'id': t.id,
//           'title': tData['title'] ?? t.id,
//           'progress': progressForStudent,
//         });
//       }

//       // Projects
//       final projectsQuery = await _firestore.collection('projects').where('courseId', isEqualTo: courseId).get();
//       for (var p in projectsQuery.docs) {
//         final pData = p.data();
//         final submissionDoc = await p.reference.collection('submissions').doc(studentId).get();
//         (courseMap['projects'] as List).add({
//           'projectId': p.id,
//           'title': pData['title'] ?? '',
//           'submitted': submissionDoc.exists,
//           'submission': submissionDoc.exists ? submissionDoc.data() : null,
//         });
//       }

//       out['courses'][courseId] = courseMap;
//     }

//     return out;
//   }

//   Future<void> _showStudentDetails(BuildContext context, String userId, Map<String, dynamic> userData) async {
//     final courseIds = (userData['courseIds'] as List<dynamic>? ?? []);
//     final details = await _fetchStudentProgressAndSubmissions(userId, courseIds);

//     if (!mounted) return;
//     showDialog(
//       context: context,
//       builder: (_) {
//         return AlertDialog(
//           title: Text("Student details: ${userData['email'] ?? userId}"),
//           content: SizedBox(
//             width: double.maxFinite,
//             child: SingleChildScrollView(
//               child: Column(
//                 children: [
//                   if (courseIds.isEmpty) const Text("No courses assigned."),
//                   ...courseIds.map((cId) {
//                     final course = details['courses'][cId.toString()] as Map<String, dynamic>?;
//                     if (course == null) {
//                       return ListTile(
//                         title: Text(cId.toString()),
//                         subtitle: const Text("No details found"),
//                       );
//                     }
//                     final topics = course['topics'] as List<dynamic>;
//                     final projects = course['projects'] as List<dynamic>;
//                     return Column(
//                       crossAxisAlignment: CrossAxisAlignment.start,
//                       children: [
//                         ListTile(
//                           contentPadding: EdgeInsets.zero,
//                           title: Text(course['title'] ?? cId.toString(),
//                               style: const TextStyle(fontWeight: FontWeight.bold)),
//                           subtitle: Text("Course ID: ${cId.toString()}"),
//                         ),
//                         const SizedBox(height: 6),
//                         const Text("Topics:", style: TextStyle(fontWeight: FontWeight.w600)),
//                         ...topics.map((t) {
//                           final prog = t['progress'] as Map<String, dynamic>?;
//                           final completed = prog != null ? (prog['completed'] == true) : false;
//                           final xp = prog != null ? (prog['totalXp']?.toString() ?? '-') : '-';
//                           final level = prog != null ? (prog['level']?.toString() ?? '-') : '-';
//                           final badges = prog != null
//                               ? (prog['badges'] is List
//                                   ? (prog['badges'] as List).join(', ')
//                                   : prog['badges']?.toString() ?? '-')
//                               : '-';
//                           final lastUpdated = prog != null ? (prog['lastUpdated']?.toString() ?? '-') : '-';
//                           return ListTile(
//                             dense: true,
//                             title: Text(t['title'] ?? t['id']),
//                             subtitle: Text(
//                                 "Completed: $completed • XP: $xp • Level: $level\nBadges: $badges\nLast: $lastUpdated"),
//                           );
//                         }),
//                         const SizedBox(height: 8),
//                         const Text("Projects:", style: TextStyle(fontWeight: FontWeight.w600)),
//                         ...projects.map((p) {
//                           final submitted = p['submitted'] == true;
//                           final submission = p['submission'];
//                           return ListTile(
//                             dense: true,
//                             title: Text(p['title'] ?? p['projectId']),
//                             subtitle: Text(submitted
//                                 ? "Submitted: ${submission?['submittedAt'] ?? '-'}\n${submission?['githubUrl'] ?? ''}"
//                                 : "Not submitted"),
//                             trailing: submitted
//                                 ? IconButton(
//                                     icon: const Icon(Icons.open_in_new),
//                                     onPressed: () {},
//                                   )
//                                 : null,
//                           );
//                         }),
//                         const Divider(),
//                       ],
//                     );
//                   }),
//                 ],
//               ),
//             ),
//           ),
//           actions: [
//             TextButton(onPressed: () => Navigator.pop(context), child: const Text("Close")),
//           ],
//         );
//       },
//     );
//   }

//   Future<void> _confirmDeleteUser(BuildContext context, String userId) async {
//     final ok = await showDialog<bool>(
//       context: context,
//       builder: (_) => AlertDialog(
//         title: const Text("Delete user"),
//         content:
//             const Text("Are you sure you want to delete this user? This will remove the document from Firestore."),
//         actions: [
//           TextButton(onPressed: () => Navigator.pop(context, false), child: const Text("Cancel")),
//           ElevatedButton(onPressed: () => Navigator.pop(context, true), child: const Text("Delete")),
//         ],
//       ),
//     );

//     if (ok != true) return;

//     try {
//       await _firestore.collection('users').doc(userId).delete();
//       if (mounted) {
//         ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("User deleted")));
//       }
//     } catch (e) {
//       if (mounted) {
//         ScaffoldMessenger.of(context)
//             .showSnackBar(SnackBar(content: Text("Error deleting user: $e")));
//       }
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     if (_userStream == null) {
//       return const Scaffold(
//         body: Center(child: CircularProgressIndicator()),
//       );
//     }

//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('👥 User List'),
//         bottom: PreferredSize(
//           preferredSize: const Size.fromHeight(56),
//           child: Padding(
//             padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
//             child: Row(
//               children: [
//                 Expanded(
//                   child: TextField(
//                     decoration: InputDecoration(
//                       hintText: 'Search by name, email, course, or child...',
//                       prefixIcon: const Icon(Icons.search),
//                       border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
//                     ),
//                     onChanged: (val) => setState(() => _searchQuery = val.trim()),
//                   ),
//                 ),
//                 const SizedBox(width: 8),
//                 DropdownButton<String>(
//                   value: _filterRole,
//                   items: const [
//                     DropdownMenuItem(value: 'all', child: Text('All')),
//                     DropdownMenuItem(value: 'student', child: Text('Students')),
//                     DropdownMenuItem(value: 'teacher', child: Text('Teachers')),
//                     DropdownMenuItem(value: 'parent', child: Text('Parents')),
//                   ],
//                   onChanged: _onFilterChanged,
//                 ),
//               ],
//             ),
//           ),
//         ),
//       ),
//       body: StreamBuilder<QuerySnapshot>(
//         stream: _userStream,
//         builder: (context, snapshot) {
//           if (snapshot.hasError) return Center(child: Text('Error: ${snapshot.error}'));
//           if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());

//           final docs = snapshot.data!.docs;
//           final users = docs.where((doc) {
//             final data = doc.data() as Map<String, dynamic>? ?? {};
//             return _matchesSearch(data);
//           }).toList();

//           if (users.isEmpty) return const Center(child: Text('No users found.'));

//           return ListView.builder(
//             padding: const EdgeInsets.all(12),
//             itemCount: users.length,
//             itemBuilder: (context, index) {
//               final doc = users[index];
//               final data = doc.data() as Map<String, dynamic>? ?? {};
//               final email = data['email'] ?? 'Unknown';
//               final role = data['role'] ?? '-';
//               final displayRole = role.toString();

//               return Card(
//                 elevation: 3,
//                 margin: const EdgeInsets.symmetric(vertical: 6),
//                 shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
//                 child: ExpansionTile(
//                   leading: CircleAvatar(
//                     child: Text(displayRole.isNotEmpty ? displayRole[0].toUpperCase() : '?'),
//                   ),
//                   title: RichText(text: _highlightAll(email.toString())),
//                   subtitle: RichText(text: _highlightAll('Role: $displayRole')),
//                   children: [
//                     _buildDetails(data, doc.id),
//                     OverflowBar(
//                       children: [
//                         if (displayRole == 'student')
//                           ElevatedButton.icon(
//                             onPressed: () => _showStudentDetails(context, doc.id, data),
//                             icon: const Icon(Icons.info_outline),
//                             label: const Text('View Progress'),
//                           ),
//                         ElevatedButton.icon(
//                           onPressed: () => _confirmDeleteUser(context, doc.id),
//                           icon: const Icon(Icons.delete_outline),
//                           label: const Text('Delete'),
//                           style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
//                         ),
//                       ],
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

//   Widget _buildDetails(Map<String, dynamic> data, [String? docId]) {
//     final role = data['role'];
//     final details = <Widget>[];

//     if (role == 'student') {
//       final courseIds = (data['courseIds'] as List<dynamic>? ?? []).cast<String>();
//       final teacherIds = (data['teacherIds'] as List<dynamic>? ?? []).cast<String>();
//       final parentIds = (data['parentIds'] as List<dynamic>? ?? []).cast<String>();

//       final courses = courseIds.map((c) => _courseMap[c] ?? c).toList();
//       final teachers = teacherIds.map((t) => _userEmailMap[t] ?? t).toList();
//       final parents = parentIds.map((p) => _userEmailMap[p] ?? p).toList();

//       details.addAll([
//         ListTile(title: const Text('📘 Courses'), subtitle: Text(courses.isEmpty ? '-' : courses.join(', '))),
//         ListTile(title: const Text('👩‍🏫 Teachers'), subtitle: Text(teachers.isEmpty ? '-' : teachers.join(', '))),
//         ListTile(title: const Text('👨‍👩‍👧 Parents'), subtitle: Text(parents.isEmpty ? '-' : parents.join(', '))),
//       ]);
//     } else if (role == 'teacher') {
//       final courses = (data['courses'] as List<dynamic>? ?? [])
//           .map((e) => _courseMap[e.toString()] ?? e.toString())
//           .toList();
//       details.add(ListTile(
//           title: const Text('📚 Assigned Courses'),
//           subtitle: Text(courses.isEmpty ? '-' : courses.join(', '))));
//     } else if (role == 'parent') {
//       final children = (data['children'] as List<dynamic>? ?? []).cast<String>();
//       final childEmails = children.map((c) => _userEmailMap[c] ?? c).toList();
//       details.add(ListTile(
//           title: const Text('👧 Children'),
//           subtitle: Text(childEmails.isEmpty ? '-' : childEmails.join(', '))));
//     } else {
//       details.add(const ListTile(title: Text('No extra details')));
//     }

//     return Column(children: details);
//   }
// }
