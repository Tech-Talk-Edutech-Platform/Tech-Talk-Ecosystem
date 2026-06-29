// lib/screens/teacher/home_screen.dart

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:techtalk/screens/teacher/student_list.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final supabase = Supabase.instance.client;

  String _teacherId = '';

  bool _loading = true;

  List<Map<String, dynamic>> _studentsPreview = [];

  int _totalStudents = 0;

  @override
  void initState() {
    super.initState();

    Future.delayed(Duration.zero, () async {
      _teacherId = supabase.auth.currentUser?.id ?? '';

      await _loadStudentsPreview();
    });
  }

  Future<void> _loadStudentsPreview() async {
    try {
      if (_teacherId.isEmpty) return;

      final response = await supabase
          .from('student_teacher_courses')
          .select('''
            student_id,
            profiles!student_teacher_courses_student_id_fkey (
              id,
              full_name,
              email
            )
          ''')
          .eq('teacher_id', _teacherId);

      final rows = List<Map<String, dynamic>>.from(response);

      final Map<String, Map<String, dynamic>> uniqueStudents = {};

      for (final row in rows) {
        final profile = row['profiles'];

        if (profile == null) continue;

        uniqueStudents[profile['id']] = {
          'id': profile['id'],
          'name': profile['full_name'] ?? '-',
          'email': profile['email'] ?? '-',
        };
      }

      final students = uniqueStudents.values.toList();

      if (mounted) {
        setState(() {
          _studentsPreview = students.take(3).toList();
          _totalStudents = students.length;
          _loading = false;
        });
      }
    } catch (e) {
      debugPrint("Error loading students preview: $e");

      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Widget _studentsCard() {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.people_alt_rounded,
                  color: Colors.orangeAccent.shade700,
                ),
                const SizedBox(width: 8),
                const Text(
                  "My Students",
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const Divider(height: 24),

            if (_loading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(12),
                  child: CircularProgressIndicator(),
                ),
              )
            else if (_studentsPreview.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 8),
                child: Text("No students assigned yet"),
              )
            else ...[
              ..._studentsPreview.map(
                (student) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: Colors.orangeAccent.shade100,
                        child: Text(
                          student['name']
                              .toString()
                              .substring(0, 1)
                              .toUpperCase(),
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              student['name'],
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            Text(
                              student['email'],
                              style: TextStyle(
                                color: Colors.grey.shade700,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 12),

              Text(
                "Total students: $_totalStudents",
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ],

            const SizedBox(height: 12),

            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                icon: const Icon(Icons.arrow_forward),
                label: const Text("View All"),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) =>
                          TeacherStudentMessagingScreen(teacherId: _teacherId),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(children: [_studentsCard()]),
    );
  }
}
// import 'package:flutter/material.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:techtalk/screens/teacher/student_list.dart';


// class HomeScreen extends StatefulWidget {
//   const HomeScreen({super.key});

//   @override
//   State<HomeScreen> createState() => _HomeScreenState();
// }

// class _HomeScreenState extends State<HomeScreen> {
//   final FirebaseFirestore _firestore = FirebaseFirestore.instance;
//   String _teacherId = '';
//   List<Map<String, dynamic>> _studentsPreview = [];

//   // @override
//   // void initState() {
//   //   super.initState();
//   //   _teacherId = FirebaseAuth.instance.currentUser?.uid ?? '';
//   //   _loadStudentsPreview();
//   // }
//   @override
// void initState() {
//   super.initState();
//   Future.delayed(Duration.zero, () {
//     _teacherId = FirebaseAuth.instance.currentUser?.uid ?? '';
//     _loadStudentsPreview();
//   });
// }


//   void _loadStudentsPreview() {
//     if (_teacherId.isEmpty) return;
//     // _firestore
//     //     .collection('users')
//     //     .where('role', isEqualTo: 'student')
//     //     .where('teacherId', isEqualTo: _teacherId)
//     //     .snapshots()
//     //     .listen((snapshot) {
//     //   final students = snapshot.docs
//     //       .map((d) => {
//     //             'id': d.id,
//     //             'name': d['name'] ?? '-',
//     //             'email': d['email'] ?? '-',
//     //             'courseId': d['courseId'],
//     //           })
//     //       .toList();

//     //   setState(() {
//     //     _studentsPreview = students.take(3).toList(); // first 3 for preview
//     //   });
//     // });
//     _firestore
//   .collection('users')
//   .where('role', isEqualTo: 'student')
//   .where('teacherIds', arrayContains: _teacherId)
//   .snapshots()
//   .listen((snapshot) {
//     final students = snapshot.docs.map((d) => {
//       'id': d.id,
//       'name': d['name'] ?? '-',
//       'email': d['email'] ?? '-',
//       'courseIds': d['courseIds'] ?? [],
//     }).toList();

//     setState(() {
//       _studentsPreview = students.take(3).toList();
//     });
//   });

//   }

//   Widget _studentsCard() {
//     return Card(
//       elevation: 2,
//       shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
//       child: Padding(
//         padding: const EdgeInsets.all(16),
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             const Text("My Students",
//                 style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
//             const Divider(),
//             if (_studentsPreview.isEmpty)
//               const Text("No students yet")
//             else ...[
//               ..._studentsPreview
//                   .map((s) => Text("• ${s['name']} (${s['email']})"))
//                   ,
//               const SizedBox(height: 8),
//               Text(
//                   "Total students: ${_studentsPreview.length} + more",
//                   style: const TextStyle(fontWeight: FontWeight.bold)),
//             ],
//             const SizedBox(height: 8),
//             Align(
//               alignment: Alignment.centerRight,
//               child: TextButton(
//                 onPressed: () {
//                   Navigator.push(
//                     context,
//                     MaterialPageRoute(
//                       builder: (_) =>
//                           TeacherStudentMessagingScreen (teacherId: _teacherId),
//                     ),
//                   );
//                 },
//                 child: const Text("View All"),
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }

//   @override
//   Widget build(BuildContext context) {
//     return SingleChildScrollView(
//       padding: const EdgeInsets.all(16),
//       child: Column(
//         children: [
//           _studentsCard(),
//           // ... other cards like _workingHoursCard(), _tasksCard(), etc.
//         ],
//       ),
//     );
//   }
// }
