import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:techtalk/constants/app_theme.dart';

class AddCourseTopicScreen extends StatefulWidget {
  const AddCourseTopicScreen({super.key});

  @override
  State<AddCourseTopicScreen> createState() => _AddCourseTopicScreenState();
}

class _AddCourseTopicScreenState extends State<AddCourseTopicScreen> {
  final supabase = Supabase.instance.client;

  final _courseTitleController = TextEditingController();
  final _courseDescController = TextEditingController();
  final _topicTitleController = TextEditingController();
  final _topicDescController = TextEditingController();
  final _imageUrlController = TextEditingController();

  bool _loading = false;

  List<dynamic> _courses = [];
  List<dynamic> _topics = [];
  String? _selectedCourseId;

  @override
  void initState() {
    super.initState();
    _fetchCourses();
  }

  Future<void> _fetchCourses() async {
    final data = await supabase.from('courses').select().order('created_at');
    setState(() => _courses = data);
  }

  Future<void> _fetchTopics(String courseId) async {
    final data = await supabase
        .from('topics')
        .select()
        .eq('course_id', courseId)
        .order('created_at');

    setState(() => _topics = data);
  }

  String _makeId(String title) =>
      title.trim().toLowerCase().replaceAll(RegExp(r'\s+'), '_');

  Future<void> _addCourseAndTopic() async {
    final courseTitle = _courseTitleController.text.trim();
    final courseDesc = _courseDescController.text.trim();
    final topicTitle = _topicTitleController.text.trim();
    final topicDesc = _topicDescController.text.trim();
    final imageUrl = _imageUrlController.text.trim();

    if ((courseTitle.isEmpty && _selectedCourseId == null) ||
        topicTitle.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Enter/select course + topic")),
      );
      return;
    }

    setState(() => _loading = true);

    try {
      final courseId = _selectedCourseId ?? _makeId(courseTitle);

      // CREATE COURSE (if new)
      if (_selectedCourseId == null) {
        await supabase.from('courses').insert({
          'id': courseId,
          'title': courseTitle,
          'description': courseDesc,
        });
      }

      // CHECK DUPLICATE TOPIC
      final existing = await supabase
          .from('topics')
          .select()
          .eq('course_id', courseId)
          .eq('title', topicTitle);

      if (existing.isNotEmpty) {
        throw "Topic already exists";
      }

      // CREATE TOPIC
      await supabase.from('topics').insert({
        'id': _makeId(topicTitle),
        'course_id': courseId,
        'title': topicTitle,
        'description': topicDesc,
      });

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Saved successfully")));

      _fetchCourses();
      if (_selectedCourseId != null) _fetchTopics(_selectedCourseId!);

      _courseTitleController.clear();
      _courseDescController.clear();
      _topicTitleController.clear();
      _topicDescController.clear();
      _imageUrlController.clear();
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Error: $e")));
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedCourse = _courses.firstWhere(
      (c) => c['id'] == _selectedCourseId,
      orElse: () => null,
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text("Add Course & Topic"),
        backgroundColor: AppTheme.primaryColor,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            DropdownButtonFormField<String>(
              value: _selectedCourseId,
              // items: _courses.map((c) {
              //   return DropdownMenuItem(
              //     value: c['id'],
              //     child: Text(c['title']),
              //   );
              // }).toList(),
              items: _courses.map((c) {
                final id = c['id']?.toString() ?? '';
                final title = c['title']?.toString() ?? 'Untitled';

                return DropdownMenuItem<String>(value: id, child: Text(title));
              }).toList(),
              onChanged: (v) {
                setState(() => _selectedCourseId = v);
                if (v != null) _fetchTopics(v);
              },
              decoration: const InputDecoration(
                labelText: "Select Course",
                border: OutlineInputBorder(),
              ),
            ),

            const SizedBox(height: 12),

            TextField(
              controller: _courseTitleController,
              enabled: _selectedCourseId == null,
              decoration: const InputDecoration(
                labelText: "New Course Title",
                border: OutlineInputBorder(),
              ),
            ),

            const SizedBox(height: 12),

            TextField(
              controller: _topicTitleController,
              decoration: const InputDecoration(
                labelText: "Topic Title",
                border: OutlineInputBorder(),
              ),
            ),

            const SizedBox(height: 12),

            TextField(
              controller: _topicDescController,
              decoration: const InputDecoration(
                labelText: "Topic Description",
                border: OutlineInputBorder(),
              ),
            ),

            const SizedBox(height: 20),

            ElevatedButton(
              onPressed: _loading ? null : _addCourseAndTopic,
              child: _loading
                  ? const CircularProgressIndicator()
                  : const Text("Save"),
            ),

            const SizedBox(height: 20),

            ..._topics.map(
              (t) => ListTile(
                title: Text(t['title']),
                subtitle: Text(t['description'] ?? ''),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
// // lib/screens/add_course_topic_screen.dart
// import 'package:flutter/material.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:techtalk/constants/app_theme.dart';

// class AddCourseTopicScreen extends StatefulWidget {
//   const AddCourseTopicScreen({super.key});

//   @override
//   State<AddCourseTopicScreen> createState() => _AddCourseTopicScreenState();
// }

// class _AddCourseTopicScreenState extends State<AddCourseTopicScreen> {
//   final _courseTitleController = TextEditingController();
//   final _courseDescController = TextEditingController();
//   final _topicTitleController = TextEditingController();
//   final _topicDescController = TextEditingController();
//   final _imageUrlController = TextEditingController();

//   bool _loading = false;
//   List<Map<String, dynamic>> _courses = [];
//   List<Map<String, dynamic>> _topics = [];
//   String? _selectedCourseId;

//   @override
//   void initState() {
//     super.initState();
//     _fetchCourses();
//   }

//   Future<void> _fetchCourses() async {
//     final snapshot = await FirebaseFirestore.instance.collection('courses').get();
//     setState(() {
//       _courses = snapshot.docs.map((doc) {
//         final data = doc.data();
//         data['id'] = doc.id;
//         return data;
//       }).toList();
//     });
//   }

//   Future<void> _fetchTopics(String courseId) async {
//     final snapshot = await FirebaseFirestore.instance
//         .collection('topics')
//         .where('courseId', isEqualTo: courseId)
//         .orderBy('order')
//         .get();
//     setState(() {
//       _topics = snapshot.docs.map((doc) {
//         final data = doc.data();
//         data['id'] = doc.id;
//         return data;
//       }).toList();
//     });
//   }

//   String _makeId(String title) =>
//       title.trim().toLowerCase().replaceAll(RegExp(r'\s+'), '_');

//   Future<void> _addCourseAndTopic() async {
//     final courseTitle = _courseTitleController.text.trim();
//     final courseDesc = _courseDescController.text.trim();
//     final topicTitle = _topicTitleController.text.trim();
//     final topicDesc = _topicDescController.text.trim();
//     final imageUrl = _imageUrlController.text.trim();

//     if (_selectedCourseId != null && courseTitle.isNotEmpty) {
//       ScaffoldMessenger.of(context).showSnackBar(
//         const SnackBar(content: Text("Select OR create a course — not both")),
//       );
//       return;
//     }

//     if ((courseTitle.isEmpty && _selectedCourseId == null) ||
//         topicTitle.isEmpty) {
//       ScaffoldMessenger.of(context).showSnackBar(
//         const SnackBar(content: Text("Please enter or select a course and a topic")),
//       );
//       return;
//     }

//     if (_selectedCourseId == null && imageUrl.isEmpty) {
//       ScaffoldMessenger.of(context).showSnackBar(
//         const SnackBar(content: Text("Please enter an image URL for the new course")),
//       );
//       return;
//     }

//     setState(() => _loading = true);

//     try {
//       final firestore = FirebaseFirestore.instance;
//       final coursesRef = firestore.collection('courses');
//       final topicsRef = firestore.collection('topics');

//       final courseId = _selectedCourseId ?? _makeId(courseTitle);
//       final existingCourse = await coursesRef.doc(courseId).get();

//       // --- Create course if new ---
//       if (!existingCourse.exists) {
//         await coursesRef.doc(courseId).set({
//           "id": courseId,
//           "title": courseTitle,
//           "description": courseDesc.isNotEmpty ? courseDesc : "Learn something new!",
//           "image": imageUrl,
//           "createdAt": FieldValue.serverTimestamp(),
//         });
//       }

//       // --- Next topic order ---
//       final existingTopics = await topicsRef
//           .where('courseId', isEqualTo: courseId)
//           .orderBy('order', descending: true)
//           .limit(1)
//           .get();
//       int nextOrder = existingTopics.docs.isNotEmpty
//           ? (existingTopics.docs.first.data()['order'] ?? 0) + 1
//           : 1;

//       // --- Prevent duplicate topic ---
//       final topicId = _makeId(topicTitle);
//       final duplicate = await topicsRef
//           .where('courseId', isEqualTo: courseId)
//           .where('title', isEqualTo: topicTitle)
//           .get();
//       if (duplicate.docs.isNotEmpty) {
//         ScaffoldMessenger.of(context).showSnackBar(
//           const SnackBar(content: Text("Topic already exists for this course")),
//         );
//         setState(() => _loading = false);
//         return;
//       }

//       // --- Add topic ---
//       await topicsRef.doc(topicId).set({
//         "id": topicId,
//         "courseId": courseId,
//         "title": topicTitle,
//         "description": topicDesc.isNotEmpty ? topicDesc : "Topic description here",
//         "order": nextOrder,
//         "createdAt": FieldValue.serverTimestamp(),
//       });

//       ScaffoldMessenger.of(context).showSnackBar(
//         const SnackBar(content: Text("Course & Topic added successfully")),
//       );

//       _fetchCourses();
//       if (_selectedCourseId != null) _fetchTopics(_selectedCourseId!);

//       _courseTitleController.clear();
//       _courseDescController.clear();
//       _topicTitleController.clear();
//       _topicDescController.clear();
//       _imageUrlController.clear();
//     } catch (e) {
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text("Error: $e")),
//       );
//     } finally {
//       setState(() => _loading = false);
//     }
//   }

//   Future<void> _editTopic(Map<String, dynamic> topic) async {
//     final titleController = TextEditingController(text: topic['title']);
//     final descController = TextEditingController(text: topic['description']);
//     await showDialog(
//       context: context,
//       builder: (_) => AlertDialog(
//         title: const Text("Edit Topic"),
//         content: Column(
//           mainAxisSize: MainAxisSize.min,
//           children: [
//             TextField(controller: titleController, decoration: const InputDecoration(labelText: "Title")),
//             TextField(controller: descController, decoration: const InputDecoration(labelText: "Description")),
//           ],
//         ),
//         actions: [
//           TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
//           ElevatedButton(
//             onPressed: () async {
//               await FirebaseFirestore.instance
//                   .collection('topics')
//                   .doc(topic['id'])
//                   .update({
//                 "title": titleController.text.trim(),
//                 "description": descController.text.trim(),
//               });
//               Navigator.pop(context);
//               _fetchTopics(topic['courseId']);
//             },
//             child: const Text("Save"),
//           ),
//         ],
//       ),
//     );
//   }

//   Future<void> _deleteTopic(Map<String, dynamic> topic) async {
//     final confirm = await showDialog<bool>(
//       context: context,
//       builder: (_) => AlertDialog(
//         title: const Text("Delete Topic"),
//         content: Text("Are you sure you want to delete '${topic['title']}'?"),
//         actions: [
//           TextButton(onPressed: () => Navigator.pop(context, false), child: const Text("Cancel")),
//           ElevatedButton(
//             onPressed: () => Navigator.pop(context, true),
//             child: const Text("Delete"),
//           ),
//         ],
//       ),
//     );
//     if (confirm == true) {
//       await FirebaseFirestore.instance.collection('topics').doc(topic['id']).delete();
//       _fetchTopics(topic['courseId']);
//     }
//   }

//   @override
//   void dispose() {
//     _courseTitleController.dispose();
//     _courseDescController.dispose();
//     _topicTitleController.dispose();
//     _topicDescController.dispose();
//     _imageUrlController.dispose();
//     super.dispose();
//   }

//   @override
//   Widget build(BuildContext context) {
//     final dropdownCourses = [
//       {'id': null, 'title': 'None'},
//       ..._courses,
//     ];

//     final selectedCourse = _courses.firstWhere(
//       (c) => c['id'] == _selectedCourseId,
//       orElse: () => {},
//     );

//     return Scaffold(
//       appBar: AppBar(
//         title: const Text("Add Course & Topic"),
//         backgroundColor: AppTheme.primaryColor,
//       ),
//       body: SingleChildScrollView(
//         padding: const EdgeInsets.all(16),
//         child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
//           const Text("Select Existing Course or Create New",
//               style: TextStyle(fontWeight: FontWeight.bold)),
//           const SizedBox(height: 8),

//           DropdownButtonFormField<String>(
//             value: _selectedCourseId,
//             hint: const Text("Select existing course"),
//             items: dropdownCourses.map((course) {
//               final id = course['id']?.toString();
//               final title = course['title']?.toString() ?? 'Untitled';
//               return DropdownMenuItem<String>(
//                 value: id,
//                 child: Text(title),
//               );
//             }).toList(),
//             onChanged: (value) {
//               setState(() {
//                 _selectedCourseId = value?.isEmpty ?? true ? null : value;
//                 _courseTitleController.clear();
//                 _courseDescController.clear();
//                 _imageUrlController.clear();
//                 _topics.clear();
//               });
//               if (value != null) _fetchTopics(value);
//             },
//             isExpanded: true,
//             decoration: const InputDecoration(border: OutlineInputBorder()),
//           ),

//           const SizedBox(height: 10),
//           const Center(child: Text("OR")),
//           const SizedBox(height: 10),

//           TextField(
//             controller: _courseTitleController,
//             enabled: _selectedCourseId == null,
//             decoration: const InputDecoration(
//               labelText: "New Course Title",
//               border: OutlineInputBorder(),
//             ),
//           ),
//           const SizedBox(height: 12),

//           if (_selectedCourseId == null)
//             TextField(
//               controller: _courseDescController,
//               decoration: const InputDecoration(
//                 labelText: "Course Description",
//                 border: OutlineInputBorder(),
//               ),
//               maxLines: 2,
//             ),
//           const SizedBox(height: 12),

//           if (_selectedCourseId == null)
//             TextField(
//               controller: _imageUrlController,
//               decoration: const InputDecoration(
//                 labelText: "Course Image URL",
//                 border: OutlineInputBorder(),
//               ),
//               onChanged: (_) => setState(() {}),
//             ),

//           if (_selectedCourseId == null && _imageUrlController.text.isNotEmpty)
//             Padding(
//               padding: const EdgeInsets.symmetric(vertical: 8),
//               child: Image.network(_imageUrlController.text,
//                   height: 120, fit: BoxFit.cover, errorBuilder: (_, __, ___) {
//                 return const Text("Invalid image URL");
//               }),
//             ),

//           if (_selectedCourseId != null && selectedCourse['image'] != null)
//             Padding(
//               padding: const EdgeInsets.symmetric(vertical: 8),
//               child: Image.network(selectedCourse['image'],
//                   height: 120, fit: BoxFit.cover, errorBuilder: (_, __, ___) {
//                 return const Text("Invalid image URL");
//               }),
//             ),

//           const SizedBox(height: 12),
//           TextField(
//             controller: _topicTitleController,
//             decoration: const InputDecoration(
//               labelText: "Topic Title",
//               border: OutlineInputBorder(),
//             ),
//           ),
//           const SizedBox(height: 12),
//           TextField(
//             controller: _topicDescController,
//             decoration: const InputDecoration(
//               labelText: "Topic Description",
//               border: OutlineInputBorder(),
//             ),
//             maxLines: 2,
//           ),
//           const SizedBox(height: 20),

//           ElevatedButton(
//             onPressed: _loading ? null : _addCourseAndTopic,
//             style: ElevatedButton.styleFrom(
//               backgroundColor: AppTheme.primaryColor,
//               padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
//             ),
//             child: _loading
//                 ? const SizedBox(
//                     width: 18,
//                     height: 18,
//                     child: CircularProgressIndicator(
//                       color: Colors.white,
//                       strokeWidth: 2.2,
//                     ),
//                   )
//                 : const Text("Create Course & Topic",
//                     style: TextStyle(fontSize: 16)),
//           ),
//           const SizedBox(height: 20),

//           if (_topics.isNotEmpty)
//             Column(
//               crossAxisAlignment: CrossAxisAlignment.start,
//               children: [
//                 const Text("Existing Topics",
//                     style:
//                         TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
//                 const SizedBox(height: 8),
//                 ..._topics.map((t) => Card(
//                       margin: const EdgeInsets.symmetric(vertical: 4),
//                       child: ListTile(
//                         title: Text(t['title']),
//                         subtitle: Text(t['description'] ?? ''),
//                         leading: const Icon(Icons.bookmark_outline),
//                         trailing: Row(
//                           mainAxisSize: MainAxisSize.min,
//                           children: [
//                             IconButton(
//                               icon: const Icon(Icons.edit, color: Colors.blue),
//                               onPressed: () => _editTopic(t),
//                             ),
//                             IconButton(
//                               icon:
//                                   const Icon(Icons.delete, color: Colors.red),
//                               onPressed: () => _deleteTopic(t),
//                             ),
//                           ],
//                         ),
//                       ),
//                     )),
//               ],
//             ),
//         ]),
//       ),
//     );
//   }
// }

// // // lib/screens/add_course_topic_screen.dart
// // import 'package:flutter/material.dart';
// // import 'package:cloud_firestore/cloud_firestore.dart';
// // import 'package:techtalk/constants/app_theme.dart';

// // class AddCourseTopicScreen extends StatefulWidget {
// //   const AddCourseTopicScreen({super.key});

// //   @override
// //   State<AddCourseTopicScreen> createState() => _AddCourseTopicScreenState();
// // }

// // class _AddCourseTopicScreenState extends State<AddCourseTopicScreen> {
// //   final _courseController = TextEditingController();
// //   final _topicController = TextEditingController();
// //   bool _loading = false;

// //   Future<void> _addCourseAndTopic() async {
// //     final course = _courseController.text.trim();
// //     final topic = _topicController.text.trim();

// //     if (course.isEmpty || topic.isEmpty) {
// //       ScaffoldMessenger.of(context).showSnackBar(
// //         const SnackBar(content: Text("Course and topic required")),
// //       );
// //       return;
// //     }

// //     setState(() => _loading = true);

// //     try {
// //       final courseRef =
// //           FirebaseFirestore.instance.collection('courses').doc(course);

// //       final courseSnapshot = await courseRef.get();
// //       if (!courseSnapshot.exists) {
// //         await courseRef.set({
// //           "title": course,
// //           "description": "",
// //           "image": null,
// //           "createdAt": FieldValue.serverTimestamp(),
// //         });
// //       }

// //       final topicRef = courseRef.collection('topics').doc(topic);
// //       final topicExists = await topicRef.get();
// //       if (!topicExists.exists) {
// //         await topicRef.set({
// //           "title": topic,
// //           "description": "",
// //           "order": 0,
// //           "createdAt": FieldValue.serverTimestamp(),
// //         });
// //       }

// //       if (mounted) Navigator.pop(context, true);
// //     } catch (e) {
// //       ScaffoldMessenger.of(context).showSnackBar(
// //         SnackBar(content: Text("Error: $e")),
// //       );
// //     } finally {
// //       if (mounted) setState(() => _loading = false);
// //     }
// //   }

// //   @override
// //   void dispose() {
// //     _courseController.dispose();
// //     _topicController.dispose();
// //     super.dispose();
// //   }

// //   @override
// //   Widget build(BuildContext context) {
// //     return Scaffold(
// //       appBar: AppBar(
// //         title: const Text("Add Course & Topic"),
// //         backgroundColor: AppTheme.primaryColor,
// //       ),
// //       body: Padding(
// //         padding: const EdgeInsets.all(16),
// //         child: Column(
// //           children: [
// //             TextField(
// //               controller: _courseController,
// //               decoration: const InputDecoration(labelText: "Course ID (doc id)"),
// //             ),
// //             const SizedBox(height: 12),
// //             TextField(
// //               controller: _topicController,
// //               decoration: const InputDecoration(labelText: "Topic ID (doc id)"),
// //             ),
// //             const SizedBox(height: 20),
// //             ElevatedButton(
// //               onPressed: _loading ? null : _addCourseAndTopic,
// //               style: ElevatedButton.styleFrom(
// //                 backgroundColor: AppTheme.primaryColor,
// //               ),
// //               child: _loading
// //                   ? const SizedBox(
// //                       width: 18,
// //                       height: 18,
// //                       child: CircularProgressIndicator(
// //                         color: Colors.white,
// //                         strokeWidth: 2.2,
// //                       ),
// //                     )
// //                   : const Text("Create Course & Topic"),
// //             ),
// //           ],
// //         ),
// //       ),
// //     );
// //   }
// // }
