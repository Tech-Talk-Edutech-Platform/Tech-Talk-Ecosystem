// lib/screens/teacher/teacher_courses.dart

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class TeacherCoursesScreen extends StatefulWidget {
  final String teacherId;

  const TeacherCoursesScreen({super.key, required this.teacherId});

  @override
  State<TeacherCoursesScreen> createState() => _TeacherCoursesScreenState();
}

class _TeacherCoursesScreenState extends State<TeacherCoursesScreen> {
  final supabase = Supabase.instance.client;

  bool _loading = true;

  List<Map<String, dynamic>> _courses = [];

  @override
  void initState() {
    super.initState();

    _fetchTeacherCourses();
  }

  Future<void> _fetchTeacherCourses() async {
    try {
      final response = await supabase
          .from('teacher_courses')
          .select('''
            course_id,
            courses (
              id,
              title,
              description,
              image_url
            )
          ''')
          .eq('teacher_id', widget.teacherId);

      final rows = List<Map<String, dynamic>>.from(response);

      final courses = rows
          .map((row) => row['courses'] as Map<String, dynamic>)
          .toList();

      if (mounted) {
        setState(() {
          _courses = courses;
          _loading = false;
        });
      }
    } catch (e) {
      debugPrint("Error loading teacher courses: $e");

      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_courses.isEmpty) {
      return const Scaffold(
        body: Center(
          child: Text(
            'No courses assigned.',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('📚 My Courses'),
        backgroundColor: Colors.orangeAccent,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _courses.length,
        itemBuilder: (context, index) {
          final course = _courses[index];

          return Card(
            elevation: 4,
            margin: const EdgeInsets.symmetric(vertical: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            child: InkWell(
              borderRadius: BorderRadius.circular(14),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => CourseStudentsTopicsScreen(
                      courseId: course['id'],
                      teacherId: widget.teacherId,
                    ),
                  ),
                );
              },
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if ((course['image_url'] ?? '').toString().isNotEmpty)
                    ClipRRect(
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(14),
                      ),
                      child: Image.network(
                        course['image_url'],
                        fit: BoxFit.cover,
                        width: double.infinity,
                        height: 170,
                      ),
                    ),
                  Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          course['title'] ?? '-',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          course['description'] ?? '',
                          style: TextStyle(color: Colors.grey.shade700),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class CourseStudentsTopicsScreen extends StatefulWidget {
  final String courseId;
  final String teacherId;

  const CourseStudentsTopicsScreen({
    super.key,
    required this.courseId,
    required this.teacherId,
  });

  @override
  State<CourseStudentsTopicsScreen> createState() =>
      _CourseStudentsTopicsScreenState();
}

class _CourseStudentsTopicsScreenState
    extends State<CourseStudentsTopicsScreen> {
  final supabase = Supabase.instance.client;

  bool _loading = true;

  List<Map<String, dynamic>> _students = [];
  List<Map<String, dynamic>> _topics = [];

  @override
  void initState() {
    super.initState();

    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final studentsResponse = await supabase
          .from('student_teacher_courses')
          .select('''
            student_id,
            profiles!student_teacher_courses_student_id_fkey (
              id,
              full_name,
              email
            )
          ''')
          .eq('course_id', widget.courseId)
          .eq('teacher_id', widget.teacherId);

      final topicsResponse = await supabase
          .from('topics')
          .select()
          .eq('course_id', widget.courseId)
          .order('position');

      final studentsRows = List<Map<String, dynamic>>.from(studentsResponse);

      final topicsRows = List<Map<String, dynamic>>.from(topicsResponse);

      final Map<String, Map<String, dynamic>> uniqueStudents = {};

      for (final row in studentsRows) {
        final profile = row['profiles'];

        if (profile == null) continue;

        uniqueStudents[profile['id']] = profile;
      }

      if (mounted) {
        setState(() {
          _students = uniqueStudents.values.toList();
          _topics = topicsRows;
          _loading = false;
        });
      }
    } catch (e) {
      debugPrint("Error loading course data: $e");

      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('👩‍🎓 Students & Topics'),
        backgroundColor: Colors.orangeAccent,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.all(14),
                    child: Text(
                      'Students',
                      style: TextStyle(
                        fontSize: 19,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),

                  if (_students.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 14),
                      child: Text('No students enrolled.'),
                    )
                  else
                    ..._students.map(
                      (student) => Card(
                        margin: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Colors.orangeAccent.shade100,
                            child: Text(
                              student['full_name']
                                  .toString()
                                  .substring(0, 1)
                                  .toUpperCase(),
                            ),
                          ),
                          title: Text(student['full_name'] ?? '-'),
                          subtitle: Text(student['email'] ?? '-'),
                        ),
                      ),
                    ),

                  const Padding(
                    padding: EdgeInsets.all(14),
                    child: Text(
                      'Topics',
                      style: TextStyle(
                        fontSize: 19,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),

                  if (_topics.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 14),
                      child: Text('No topics added yet.'),
                    )
                  else
                    ..._topics.map(
                      (topic) => Card(
                        margin: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: ListTile(
                          title: Text(topic['title'] ?? '-'),
                          subtitle: Text(topic['description'] ?? ''),
                          leading: CircleAvatar(
                            backgroundColor: Colors.orangeAccent.shade100,
                            child: Text('${topic['position'] ?? 0}'),
                          ),
                        ),
                      ),
                    ),

                  const SizedBox(height: 20),
                ],
              ),
            ),
    );
  }
}
// import 'package:flutter/material.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';

// class TeacherCoursesScreen extends StatefulWidget {
//   final String teacherId;
//   const TeacherCoursesScreen({super.key, required this.teacherId});

//   @override
//   State<TeacherCoursesScreen> createState() => _TeacherCoursesScreenState();
// }

// class _TeacherCoursesScreenState extends State<TeacherCoursesScreen> {
//   final _firestore = FirebaseFirestore.instance;
//   Map<String, Map<String, dynamic>> _coursesMap = {};
//   bool _loading = true;

//   @override
//   void initState() {
//     super.initState();
    
//     _fetchTeacherCourses();
//   }

//   Future<void> _fetchTeacherCourses() async {
//     try {
      
//       final teacherDocSnap = await _firestore.collection('users').doc(widget.teacherId).get();

//       final courseIds = (teacherDocSnap.data()?['courses'] as List<dynamic>? ?? []).cast<String>();
      

//       if (courseIds.isEmpty) {
//         setState(() {
//           _coursesMap = {};
//           _loading = false;
//         });
        
//         return;
//       }

//       final courses = await Future.wait(courseIds.map((id) async {
//         final doc = await _firestore.collection('courses').doc(id).get();
        
//         return doc;
//       }));

//       final courseMap = {for (var doc in courses) if (doc.exists) doc.id: doc.data() as Map<String, dynamic>};
//       setState(() {
//         _coursesMap = courseMap;
//         _loading = false;
//       });
      
//     } catch (e) {
      
//       setState(() => _loading = false);
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
    

//     if (_loading) {
//       return const Scaffold(
//         body: Center(child: CircularProgressIndicator()),
//       );
//     }

//     if (_coursesMap.isEmpty) {
//       return const Scaffold(
//         body: Center(
//           child: Text(
//             'No courses registered for this teacher.',
//             style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
//           ),
//         ),
//       );
//     }

//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('📚 My Courses'),
//         backgroundColor: Colors.orangeAccent,
//       ),
//       body: ListView(
//         padding: const EdgeInsets.all(12),
//         children: _coursesMap.entries.map((entry) {
//           final courseId = entry.key;
//           final data = entry.value;
//           final title = data['title'] ?? '-';
//           final description = data['description'] ?? '';
//           final image = data['image'] ?? '';

          

//           return Card(
//             elevation: 4,
//             margin: const EdgeInsets.symmetric(vertical: 8),
//             shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
//             child: InkWell(
//               onTap: () {
                
//                 Navigator.push(
//                   context,
//                   MaterialPageRoute(
//                     builder: (_) => CourseStudentsTopicsScreen(
//                       courseId: courseId,
//                       teacherId: widget.teacherId,
//                     ),
//                   ),
//                 );
//               },
//               child: Column(
//                 crossAxisAlignment: CrossAxisAlignment.start,
//                 children: [
//                   if (image.isNotEmpty)
//                     ClipRRect(
//                       borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
//                       child: Image.network(image, fit: BoxFit.cover, width: double.infinity, height: 150),
//                     ),
//                   Padding(
//                     padding: const EdgeInsets.all(12),
//                     child: Column(
//                       crossAxisAlignment: CrossAxisAlignment.start,
//                       children: [
//                         Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
//                         const SizedBox(height: 6),
//                         Text(description, style: TextStyle(color: Colors.grey[700])),
//                       ],
//                     ),
//                   ),
//                 ],
//               ),
//             ),
//           );
//         }).toList(),
//       ),
//     );
//   }
// }

// class CourseStudentsTopicsScreen extends StatelessWidget {
//   final String courseId;
//   final String teacherId;
//   const CourseStudentsTopicsScreen({super.key, required this.courseId, required this.teacherId});

//   @override
//   Widget build(BuildContext context) {
//     final firestore = FirebaseFirestore.instance;
    

//     return Scaffold(
//       appBar: AppBar(title: const Text('👩‍🎓 Students & Topics'), backgroundColor: Colors.orangeAccent),
//       body: SingleChildScrollView(
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             const Padding(
//               padding: EdgeInsets.all(12),
//               child: Text('Students', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
//             ),
//             StreamBuilder<QuerySnapshot>(
//               stream: firestore.collection('users').where('role', isEqualTo: 'student').snapshots(),
//               builder: (context, snapshot) {
//                 if (snapshot.hasError) {
                  
//                   return Center(child: Text('Error loading students'));
//                 }
//                 if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());

//                 final students = snapshot.data!.docs.where((doc) {
//                   final courses = (doc['courseIds'] as List<dynamic>? ?? []).cast<String>();
//                   return courses.contains(courseId);
//                 }).toList();

                

//                 if (students.isEmpty) {
//                   return const Padding(
//                     padding: EdgeInsets.all(12),
//                     child: Text('No students enrolled in this course.'),
//                   );
//                 }

//                 return Column(
//                   children: students.map((student) {
//                     final name = student['name'] ?? student['email'] ?? '-';
//                     final studentCourses = (student['courseIds'] as List<dynamic>? ?? []).cast<String>();
                    
//                     return ListTile(
//                       title: Text(name),
//                       subtitle: Text('Courses: ${studentCourses.join(', ')}'),
//                     );
//                   }).toList(),
//                 );
//               },
//             ),
//             const Padding(
//               padding: EdgeInsets.all(12),
//               child: Text('Topics', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
//             ),
//           StreamBuilder<QuerySnapshot>(
//   stream: firestore.collection('topics')
//       .where('courseId', isEqualTo: courseId)
//       // .orderBy('order', descending: true) // optional, but recommended
//       .snapshots(),
//   builder: (context, snapshot) {
//     if (snapshot.hasError) {
      
//       return Center(child: Text('Error loading topics'));
//     }
//     if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());

//     final topics = snapshot.data!.docs;
    

//     if (topics.isEmpty) {
//       return const Padding(
//         padding: EdgeInsets.all(12),
//         child: Text('No topics added for this course yet.'),
//       );
//     }

//     return Column(
//       children: topics.map((topic) {
//         final title = topic['title'] ?? '-';
        
//         return Card(
//           margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
//           shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
//           child: ListTile(
//             title: Text(title),
//             subtitle: Text(topic['description'] ?? ''),
//           ),
//         );
//       }).toList(),
//     );
//   },
// ),

//           ],
//         ),
//       ),
//     );
//   }
// }
