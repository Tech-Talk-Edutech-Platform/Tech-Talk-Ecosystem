import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:techtalk/constants/app_theme.dart';

class CourseListScreen extends StatefulWidget {
  const CourseListScreen({super.key});

  @override
  State<CourseListScreen> createState() => _CourseListScreenState();
}

class _CourseListScreenState extends State<CourseListScreen> {
  final supabase = Supabase.instance.client;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Courses & Topics"),
        backgroundColor: AppTheme.primaryColor,
      ),
      body: StreamBuilder(
        stream: supabase.from('courses').stream(primaryKey: ['id']),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          final courses = snapshot.data ?? [];

          if (courses.isEmpty) {
            return const Center(child: Text("No courses found"));
          }

          return ListView.builder(
            itemCount: courses.length,
            itemBuilder: (context, i) {
              final course = courses[i];
              final courseId = course['id'];

              return Card(
                margin: const EdgeInsets.all(8),
                child: ExpansionTile(
                  leading: const Icon(Icons.book),
                  title: Text(course['title'] ?? ''),
                  subtitle: Text(course['description'] ?? ''),

                  children: [
                    FutureBuilder(
                      future: supabase
                          .from('topics')
                          .select()
                          .eq('course_id', courseId)
                          .order('created_at'),
                      builder: (context, snap) {
                        if (!snap.hasData) {
                          return const Padding(
                            padding: EdgeInsets.all(8),
                            child: CircularProgressIndicator(),
                          );
                        }

                        final topics = snap.data as List;

                        if (topics.isEmpty) {
                          return const ListTile(title: Text("No topics"));
                        }

                        return Column(
                          children: topics.map((t) {
                            return ListTile(
                              leading: const Icon(Icons.topic),
                              title: Text(t['title']),
                              subtitle: Text(t['description'] ?? ''),
                            );
                          }).toList(),
                        );
                      },
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
// // lib/screens/course_list_screen.dart
// import 'package:flutter/material.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:techtalk/constants/app_theme.dart';

// class CourseListScreen extends StatelessWidget {
//   const CourseListScreen({super.key});

//   @override
//   Widget build(BuildContext context) {
//     final coursesRef = FirebaseFirestore.instance.collection('courses');

//     // Ensure user is authenticated
//     final user = FirebaseAuth.instance.currentUser;
//     if (user == null) {
//       return const Scaffold(
//         body: Center(child: Text("Please sign in to view courses.")),
//       );
//     }

//     return Scaffold(
//       appBar: AppBar(
//         title: const Text("Courses & Topics"),
//         backgroundColor: AppTheme.primaryColor,
//       ),
//       body: StreamBuilder<QuerySnapshot>(
//         stream: coursesRef.orderBy('createdAt', descending: true).snapshots(),
//         builder: (context, snapshot) {
//           if (snapshot.connectionState == ConnectionState.waiting) {
//             return const Center(child: CircularProgressIndicator());
//           }
//           if (snapshot.hasError) {
//             return Center(child: Text("Error: ${snapshot.error}"));
//           }
//           if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
//             return const Center(
//               child: Padding(
//                 padding: EdgeInsets.all(16.0),
//                 child: Text("No courses found"),
//               ),
//             );
//           }

//           final docs = snapshot.data!.docs;

//           return ListView.builder(
//             itemCount: docs.length,
//             itemBuilder: (context, i) {
//               final doc = docs[i];
//               final data = doc.data() as Map<String, dynamic>;
//               final title = data['title'] ?? doc.id;
//               final desc = data['description'] ?? '';
//               final image = data['image'] as String?;

//               return Card(
//                 margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
//                 child: ExpansionTile(
//                   leading: image != null && image.isNotEmpty
//                       ? Image.network(image, width: 50, height: 50, fit: BoxFit.cover)
//                       : const Icon(Icons.book, size: 40),
//                   title: Text(
//                     title,
//                     style: const TextStyle(
//                       fontWeight: FontWeight.bold,
//                       color: Colors.black,
//                     ),
//                   ),
//                   subtitle: desc.isNotEmpty
//                       ? Text(
//                           desc,
//                           style: const TextStyle(color: Colors.black),
//                         )
//                       : null,
//                   trailing: PopupMenuButton<String>(
//                     onSelected: (choice) async {
//                       if (choice == "delete") {
//                         await doc.reference.delete();
//                         if (context.mounted) {
//                           ScaffoldMessenger.of(context).showSnackBar(
//                             SnackBar(content: Text("Course '$title' deleted")),
//                           );
//                         }
//                       } else if (choice == "edit") {
//                         _showEditCourseDialog(context, doc.id, data);
//                       }
//                     },
//                     itemBuilder: (_) => const [
//                       PopupMenuItem(value: "edit", child: Text("Edit")),
//                       PopupMenuItem(value: "delete", child: Text("Delete")),
//                     ],
//                   ),
//                   children: [
//                     Padding(
//                       padding: const EdgeInsets.symmetric(horizontal: 16.0),
//                       child: StreamBuilder<QuerySnapshot>(
//                         stream: doc.reference.collection('topics').orderBy('order').snapshots(),
//                         builder: (context, topicSnapshot) {
//                           if (!topicSnapshot.hasData) {
//                             return const Padding(
//                               padding: EdgeInsets.all(8.0),
//                               child: CircularProgressIndicator(),
//                             );
//                           }

//                           final topics = topicSnapshot.data!.docs;
//                           if (topics.isEmpty) {
//                             return const ListTile(title: Text("No topics yet"));
//                           }

//                           return Column(
//                             children: topics.map((t) {
//                               final topicData = t.data() as Map<String, dynamic>;
//                               final topicTitle = topicData['title'] ?? t.id;
//                               final topicDesc = topicData['description'] ?? '';

//                               return ListTile(
//                                 leading: const Icon(Icons.topic, color: Colors.black54),
//                                 title: Text(topicTitle, style: const TextStyle(color: Colors.black)),
//                                 subtitle: topicDesc.isNotEmpty
//                                     ? Text(topicDesc, style: const TextStyle(color: Colors.black87))
//                                     : null,
//                                 trailing: PopupMenuButton<String>(
//                                   onSelected: (choice) async {
//                                     if (choice == "delete") {
//                                       await t.reference.delete();
//                                       if (context.mounted) {
//                                         ScaffoldMessenger.of(context).showSnackBar(
//                                           SnackBar(content: Text("Topic '$topicTitle' deleted")),
//                                         );
//                                       }
//                                     } else if (choice == "edit") {
//                                       _showEditTopicDialog(context, t.reference, topicData);
//                                     }
//                                   },
//                                   itemBuilder: (_) => const [
//                                     PopupMenuItem(value: "edit", child: Text("Edit")),
//                                     PopupMenuItem(value: "delete", child: Text("Delete")),
//                                   ],
//                                 ),
//                               );
//                             }).toList(),
//                           );
//                         },
//                       ),
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

//   void _showEditCourseDialog(BuildContext context, String courseId, Map<String, dynamic> data) {
//     final titleController = TextEditingController(text: data['title'] ?? courseId);
//     final descController = TextEditingController(text: data['description'] ?? '');
//     final imageController = TextEditingController(text: data['image'] ?? '');

//     showDialog(
//       context: context,
//       builder: (_) => AlertDialog(
//         title: const Text("Edit Course"),
//         content: Column(
//           mainAxisSize: MainAxisSize.min,
//           children: [
//             TextField(controller: titleController, decoration: const InputDecoration(labelText: "Title")),
//             const SizedBox(height: 8),
//             TextField(controller: descController, decoration: const InputDecoration(labelText: "Description")),
//             const SizedBox(height: 8),
//             TextField(controller: imageController, decoration: const InputDecoration(labelText: "Image URL")),
//           ],
//         ),
//         actions: [
//           TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
//           ElevatedButton(
//             onPressed: () async {
//               final newTitle = titleController.text.trim();
//               final newDesc = descController.text.trim();
//               final newImage = imageController.text.trim();

//               if (newTitle.isEmpty) return;

//               final courseRef = FirebaseFirestore.instance.collection('courses').doc(courseId);

//               if (newTitle != courseId) {
//                 final newRef = FirebaseFirestore.instance.collection('courses').doc(newTitle);
//                 final exists = await newRef.get();
//                 if (exists.exists) {
//                   if (context.mounted) {
//                     ScaffoldMessenger.of(context).showSnackBar(
//                       SnackBar(content: Text("Course '$newTitle' already exists")),
//                     );
//                   }
//                   return;
//                 }
//                 await newRef.set({
//                   "title": newTitle,
//                   "description": newDesc,
//                   "image": newImage.isNotEmpty ? newImage : null,
//                   "createdAt": data['createdAt'] ?? FieldValue.serverTimestamp(),
//                   "updatedAt": FieldValue.serverTimestamp(),
//                 });
//                 await courseRef.delete();
//               } else {
//                 await courseRef.update({
//                   "description": newDesc,
//                   "image": newImage.isNotEmpty ? newImage : null,
//                   "updatedAt": FieldValue.serverTimestamp(),
//                 });
//               }

//               if (context.mounted) Navigator.pop(context);
//             },
//             child: const Text("Save"),
//           ),
//         ],
//       ),
//     );
//   }

//   void _showEditTopicDialog(BuildContext context, DocumentReference topicRef, Map<String, dynamic> data) {
//     final titleController = TextEditingController(text: data['title']);
//     final descController = TextEditingController(text: data['description'] ?? '');

//     showDialog(
//       context: context,
//       builder: (_) => AlertDialog(
//         title: const Text("Edit Topic"),
//         content: Column(
//           mainAxisSize: MainAxisSize.min,
//           children: [
//             TextField(controller: titleController, decoration: const InputDecoration(labelText: "Title")),
//             const SizedBox(height: 8),
//             TextField(controller: descController, decoration: const InputDecoration(labelText: "Description")),
//           ],
//         ),
//         actions: [
//           TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
//           ElevatedButton(
//             onPressed: () async {
//               final newTitle = titleController.text.trim();
//               final newDesc = descController.text.trim();

//               if (newTitle.isEmpty) return;

//               await topicRef.update({
//                 "title": newTitle,
//                 "description": newDesc,
//                 "updatedAt": FieldValue.serverTimestamp(),
//               });

//               if (context.mounted) Navigator.pop(context);
//             },
//             child: const Text("Save"),
//           ),
//         ],
//       ),
//     );
//   }
// }
