import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class StudentCoursesScreen extends StatefulWidget {
  final String studentId;

  const StudentCoursesScreen({super.key, required this.studentId});

  @override
  State<StudentCoursesScreen> createState() => _StudentCoursesScreenState();
}

class _StudentCoursesScreenState extends State<StudentCoursesScreen> {
  final _firestore = FirebaseFirestore.instance;

  Map<String, Map<String, dynamic>> courseMap = {};

  @override
  void initState() {
    super.initState();
    _fetchStudentCourses();
  }

  Future<void> _fetchStudentCourses() async {
    if (widget.studentId.isEmpty) return;

    final studentDoc = await _firestore
        .collection('users')
        .doc(widget.studentId)
        .get();

    final data = studentDoc.data();
    if (data == null) return;

    final courseIds = List<String>.from(data['courseIds'] ?? []);

    if (courseIds.isEmpty) return;

    final results = await Future.wait(
      courseIds.map((id) => _firestore.collection('courses').doc(id).get()),
    );

    final Map<String, Map<String, dynamic>> map = {};

    for (final doc in results) {
      if (doc.exists && doc.data() != null) {
        map[doc.id] = doc.data()!;
      }
    }

    setState(() => courseMap = map);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("My Courses")),
      body: courseMap.isEmpty
          ? const Center(child: Text("No courses found"))
          : ListView(
              children: courseMap.entries.map((e) {
                return Card(
                  child: ListTile(
                    title: Text(e.value['title'] ?? ''),
                    subtitle: Text(e.value['description'] ?? ''),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => CourseTopicsScreen(courseId: e.key),
                        ),
                      );
                    },
                  ),
                );
              }).toList(),
            ),
    );
  }
}

class CourseTopicsScreen extends StatelessWidget {
  final String courseId;

  const CourseTopicsScreen({super.key, required this.courseId});

  @override
  Widget build(BuildContext context) {
    final firestore = FirebaseFirestore.instance;

    return Scaffold(
      appBar: AppBar(title: const Text("Topics")),
      body: StreamBuilder(
        stream: firestore
            .collection('topics')
            .where('courseId', isEqualTo: courseId)
            .snapshots(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          final docs = snapshot.data!.docs;

          return ListView(
            children: docs.map((d) {
              return ListTile(
                title: Text(d['title'] ?? ''),
                subtitle: Text(d['description'] ?? ''),
              );
            }).toList(),
          );
        },
      ),
    );
  }
}
// // REMOVE DEBUG PRINTS
// // lib/screens/student_courses_screen.dart
// import 'package:flutter/material.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';

// class StudentCoursesScreen extends StatefulWidget {
//   final String studentId;
//   const StudentCoursesScreen({super.key, required this.studentId});

//   @override
//   State<StudentCoursesScreen> createState() => _StudentCoursesScreenState();
// }

// class _StudentCoursesScreenState extends State<StudentCoursesScreen> {
//   final _firestore = FirebaseFirestore.instance;
//   Map<String, Map<String, dynamic>> _courseMap = {};

//   @override
//   void initState() {
//     super.initState();
   
//     _fetchStudentCourses();
//   }

//   Future<void> _fetchStudentCourses() async {
//     try {
//       if (widget.studentId.isEmpty) {
      
//         return;
//       }

  
//       final studentDoc = await _firestore.collection('users').doc(widget.studentId).get();

//       if (!studentDoc.exists) {
       
//         setState(() => _courseMap = {});
//         return;
//       }

//       final studentData = studentDoc.data();
//       if (studentData == null) {
       
//         setState(() => _courseMap = {});
//         return;
//       }

//       final courseIds = (studentData['courseIds'] as List<dynamic>? ?? []).cast<String>();
     

//       if (courseIds.isEmpty) {
      
//         setState(() => _courseMap = {});
//         return;
//       }

//       final courses = await Future.wait(courseIds.map((id) async {
//         final doc = await _firestore.collection('courses').doc(id).get();
       
//         return doc;
//       }));

//       final Map<String, Map<String, dynamic>> courseMap = {};
//       for (var doc in courses) {
//         if (doc.exists && doc.data() != null) {
//           courseMap[doc.id] = doc.data()!;
//         }
//       }

     
//       setState(() => _courseMap = courseMap);
//     } catch (e) {
   
     
//       setState(() => _courseMap = {});
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
  
//     return Scaffold(
//       appBar: AppBar(title: const Text('📚 My Courses')),
//       body: _courseMap.isEmpty
//           ? const Center(child: CircularProgressIndicator())
//           : ListView(
//               padding: const EdgeInsets.all(12),
//               children: _courseMap.entries.map((entry) {
//                 final courseId = entry.key;
//                 final data = entry.value;
//                 final title = data['title'] ?? '-';
//                 final description = data['description'] ?? '';
//                 final image = data['image'] ?? '';

                
//                 return Card(
//                   elevation: 4,
//                   margin: const EdgeInsets.symmetric(vertical: 8),
//                   shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
//                   child: InkWell(
//                     onTap: () {
                     
//                       Navigator.push(
//                         context,
//                         MaterialPageRoute(
//                           builder: (_) => CourseTopicsScreen(courseId: courseId),
//                         ),
//                       );
//                     },
//                     child: Column(
//                       crossAxisAlignment: CrossAxisAlignment.start,
//                       children: [
//                         if (image.isNotEmpty)
//                           ClipRRect(
//                             borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
//                             child: Image.network(
//                               image,
//                               fit: BoxFit.cover,
//                               width: double.infinity,
//                               height: 150,
//                               errorBuilder: (context, error, stackTrace) {
                               
//                                 return Container(
//                                   height: 150,
//                                   color: Colors.grey[300],
//                                   child: const Center(child: Icon(Icons.broken_image)),
//                                 );
//                               },
//                             ),
//                           ),
//                         Padding(
//                           padding: const EdgeInsets.all(12),
//                           child: Column(
//                             crossAxisAlignment: CrossAxisAlignment.start,
//                             children: [
//                               Text(title,
//                                   style: const TextStyle(
//                                       fontSize: 18, fontWeight: FontWeight.bold)),
//                               const SizedBox(height: 6),
//                               Text(description, style: TextStyle(color: Colors.grey[700])),
//                             ],
//                           ),
//                         ),
//                       ],
//                     ),
//                   ),
//                 );
//               }).toList(),
//             ),
//     );
//   }
// }

// class CourseTopicsScreen extends StatelessWidget {
//   final String courseId;
//   const CourseTopicsScreen({super.key, required this.courseId});

//   @override
//   Widget build(BuildContext context) {
//     final firestore = FirebaseFirestore.instance;
  
//     return Scaffold(
//       appBar: AppBar(title: const Text('📝 Topics')),
//       body: StreamBuilder<QuerySnapshot>(
//         stream: firestore
//             .collection('topics')
//             .where('courseId', isEqualTo: courseId)
//             .orderBy('order', descending: false) // ✅ requires 'order' field in all docs
//             .snapshots(),
//         builder: (context, snapshot) {
//           if (snapshot.hasError) {
          
//             return Center(child: Text('Error loading topics'));
//           }

//           if (!snapshot.hasData) {
         
//             return const Center(child: CircularProgressIndicator());
//           }

//           final topics = snapshot.data!.docs;
        

//           if (topics.isEmpty) return const Center(child: Text('No topics yet.'));

//           return ListView.builder(
//             padding: const EdgeInsets.all(12),
//             itemCount: topics.length,
//             itemBuilder: (context, index) {
//               final topic = topics[index];
//               final title = topic['title'] ?? '-';
//               final description = topic['description'] ?? '';

//               return Card(
//                 elevation: 2,
//                 margin: const EdgeInsets.symmetric(vertical: 6),
//                 shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
//                 child: ListTile(
//                   title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
//                   subtitle: Text(description),
//                 ),
//               );
//             },
//           );
//         },
//       ),
//     );
//   }
// }
