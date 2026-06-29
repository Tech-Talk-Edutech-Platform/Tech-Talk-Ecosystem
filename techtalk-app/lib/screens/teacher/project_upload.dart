import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:techtalk/constants/app_theme.dart';

class TeacherProjectsScreen extends StatefulWidget {
  final String teacherId;

  const TeacherProjectsScreen({super.key, required this.teacherId});

  @override
  State<TeacherProjectsScreen> createState() => _TeacherProjectsScreenState();
}

class _TeacherProjectsScreenState extends State<TeacherProjectsScreen> {
  final supabase = Supabase.instance.client;

  final _title = TextEditingController();
  final _desc = TextEditingController();

  String? courseId;
  String? topicId;

  List<Map<String, dynamic>> courses = [];
  List<Map<String, dynamic>> topics = [];

  List<Map<String, String>> resources = [];

  @override
  void initState() {
    super.initState();
    _loadCourses();
  }

  @override
  void dispose() {
    _title.dispose();
    _desc.dispose();
    super.dispose();
  }

  Future<void> _loadCourses() async {
    try {
      final data = await supabase.from('courses').select();

      setState(() {
        courses = List<Map<String, dynamic>>.from(data);
      });
    } catch (e) {
      debugPrint('LOAD COURSES ERROR: $e');
    }
  }

  Future<void> _loadTopics(String course) async {
    try {
      final data = await supabase
          .from('topics')
          .select()
          .eq('course_id', course)
          .order('position');

      setState(() {
        topics = List<Map<String, dynamic>>.from(data);
      });
    } catch (e) {
      debugPrint('LOAD TOPICS ERROR: $e');
    }
  }

  Future<void> _saveProject() async {
    if (courseId == null || topicId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select course and topic')),
      );
      return;
    }

    try {
      await supabase.from('projects').insert({
        'title': _title.text.trim(),
        'instructions': _desc.text.trim(),

        // USE SNAKE_CASE IN SUPABASE
        'course_id': courseId,
        'topic_id': topicId,
        'created_by': widget.teacherId,

        'resources': resources,
        'reused_by': [],
      });

      _title.clear();
      _desc.clear();

      setState(() {
        resources.clear();
      });

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Project saved ✅')));
    } catch (e) {
      debugPrint('SAVE PROJECT ERROR: $e');

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error saving project: $e')));
    }
  }

  Future<void> _toggleReuse(String projectId, List<dynamic> reusedBy) async {
    final uid = widget.teacherId;

    try {
      List updated = List.from(reusedBy);

      if (updated.contains(uid)) {
        updated.remove(uid);
      } else {
        updated.add(uid);
      }

      await supabase
          .from('projects')
          .update({'reused_by': updated})
          .eq('id', projectId);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            updated.contains(uid) ? 'Project reused ✅' : 'Reuse removed ❌',
          ),
        ),
      );
    } catch (e) {
      debugPrint('TOGGLE REUSE ERROR: $e');
    }
  }

  Stream<List<Map<String, dynamic>>> _projectsStream() {
    if (courseId == null || topicId == null) {
      return Stream.value([]);
    }

    return supabase
        .from('projects')
        .stream(primaryKey: ['id'])
        .map(
          (data) => data.where((project) {
            return project['course_id'] == courseId &&
                project['topic_id'] == topicId;
          }).toList(),
        );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Projects"),
        backgroundColor: AppTheme.primaryColor,
      ),

      body: Padding(
        padding: const EdgeInsets.all(16),

        child: Column(
          children: [
            DropdownButtonFormField<String>(
              value: courseId,
              decoration: const InputDecoration(labelText: "Select Course"),

              items: courses.map((c) {
                return DropdownMenuItem<String>(
                  value: c['id'].toString(),
                  child: Text(c['title'] ?? '-'),
                );
              }).toList(),

              onChanged: (v) {
                setState(() {
                  courseId = v;
                  topicId = null;
                  topics = [];
                });

                if (v != null) {
                  _loadTopics(v);
                }
              },
            ),

            const SizedBox(height: 12),

            DropdownButtonFormField<String>(
              value: topicId,
              decoration: const InputDecoration(labelText: "Select Topic"),

              items: topics.map((t) {
                return DropdownMenuItem<String>(
                  value: t['id'].toString(),
                  child: Text(t['title'] ?? '-'),
                );
              }).toList(),

              onChanged: (v) {
                setState(() {
                  topicId = v;
                });
              },
            ),

            const SizedBox(height: 12),

            TextField(
              controller: _title,
              decoration: const InputDecoration(labelText: 'Project Title'),
            ),

            const SizedBox(height: 12),

            TextField(
              controller: _desc,
              maxLines: 4,
              decoration: const InputDecoration(labelText: 'Instructions'),
            ),

            const SizedBox(height: 16),

            ElevatedButton(onPressed: _saveProject, child: const Text("Save")),

            const SizedBox(height: 16),

            Expanded(
              child: StreamBuilder<List<Map<String, dynamic>>>(
                stream: _projectsStream(),

                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  final data = snapshot.data ?? <Map<String, dynamic>>[];

                  if (data.isEmpty) {
                    return const Center(child: Text('No projects found'));
                  }

                  return ListView.builder(
                    itemCount: data.length,

                    itemBuilder: (_, i) {
                      final p = data[i];

                      final reusedBy = List<dynamic>.from(p['reused_by'] ?? []);

                      final isMine = p['created_by'] == widget.teacherId;

                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 6),

                        child: ListTile(
                          title: Text(p['title'] ?? '-'),

                          subtitle: Text(p['instructions'] ?? ''),

                          trailing: isMine
                              ? const Icon(Icons.edit)
                              : IconButton(
                                  icon: Icon(
                                    reusedBy.contains(widget.teacherId)
                                        ? Icons.stop
                                        : Icons.replay,
                                  ),

                                  onPressed: () {
                                    _toggleReuse(p['id'].toString(), reusedBy);
                                  },
                                ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
// import 'package:flutter/material.dart';
// import 'package:supabase_flutter/supabase_flutter.dart';

// import 'package:techtalk/constants/app_theme.dart';

// class TeacherProjectsScreen extends StatefulWidget {
//   final String teacherId;
//   const TeacherProjectsScreen({super.key, required this.teacherId});

//   @override
//   State<TeacherProjectsScreen> createState() => _TeacherProjectsScreenState();
// }

// class _TeacherProjectsScreenState extends State<TeacherProjectsScreen> {
//   final supabase = Supabase.instance.client;

//   final _title = TextEditingController();
//   final _desc = TextEditingController();

//   String? courseId;
//   String? topicId;

//   List courses = [];
//   List topics = [];

//   List<Map<String, String>> resources = [];

//   @override
//   void initState() {
//     super.initState();
//     _loadCourses();
//   }

//   Future<void> _loadCourses() async {
//     final data = await supabase.from('courses').select();
//     setState(() => courses = data);
//   }

//   Future<void> _loadTopics(String course) async {
//     final data = await supabase
//         .from('topics')
//         .select()
//         .eq('course_id', course)
//         .order('position');

//     setState(() => topics = data);
//   }

//   Future<void> _saveProject() async {
//     await supabase.from('projects').insert({
//       'title': _title.text,
//       'instructions': _desc.text,
//       'courseId': courseId,
//       'topicId': topicId,
//       'createdBy': widget.teacherId,
//       'resources': resources,
//       'reusedBy': [],
//     });

//     _title.clear();
//     _desc.clear();
//     setState(() => resources.clear());
//   }

//   Future<void> _toggleReuse(String id, List reusedBy) async {
//     final uid = widget.teacherId;

//     if (reusedBy.contains(uid)) {
//       await supabase
//           .from('projects')
//           .update({'reusedBy': reusedBy..remove(uid)})
//           .eq('id', id);
//     } else {
//       await supabase.rpc('array_append', params: {'uid': uid});
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text("Projects"),
//         backgroundColor: AppTheme.primaryColor,
//       ),
//       body: Column(
//         children: [
//           DropdownButton(
//             value: courseId,
//             hint: const Text("Select Course"),
//             items: courses
//                 .map(
//                   (c) =>
//                       DropdownMenuItem(value: c['id'], child: Text(c['title'])),
//                 )
//                 .toList(),
//             onChanged: (v) {
//               setState(() => courseId = v as String);
//               _loadTopics(courseId!);
//             },
//           ),
//           DropdownButton(
//             value: topicId,
//             hint: const Text("Select Topic"),
//             items: topics
//                 .map(
//                   (t) =>
//                       DropdownMenuItem(value: t['id'], child: Text(t['title'])),
//                 )
//                 .toList(),
//             onChanged: (v) => setState(() => topicId = v as String),
//           ),
//           TextField(controller: _title),
//           TextField(controller: _desc),
//           ElevatedButton(onPressed: _saveProject, child: const Text("Save")),
//           Expanded(
//             child: StreamBuilder(
//               stream: supabase
//                   .from('projects')
//                   .stream(primaryKey: ['id'])
//                   .eq('courseId', courseId ?? '')
//                   .eq('topicId', topicId ?? ''),
//               builder: (context, snapshot) {
//                 final data = snapshot.data ?? [];

//                 return ListView.builder(
//                   itemCount: data.length,
//                   itemBuilder: (_, i) {
//                     final p = data[i];
//                     final reusedBy = List.from(p['reusedBy'] ?? []);
//                     final isMine = p['createdBy'] == widget.teacherId;

//                     return ListTile(
//                       title: Text(p['title']),
//                       subtitle: Text(p['instructions'] ?? ''),
//                       trailing: isMine
//                           ? const Icon(Icons.edit)
//                           : IconButton(
//                               icon: Icon(
//                                 reusedBy.contains(widget.teacherId)
//                                     ? Icons.stop
//                                     : Icons.replay,
//                               ),
//                               onPressed: () => _toggleReuse(p['id'], reusedBy),
//                             ),
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
// }
// // import 'package:flutter/material.dart';
// // import 'package:cloud_firestore/cloud_firestore.dart';
// // import 'package:firebase_auth/firebase_auth.dart';
// // import 'package:techtalk/constants/app_theme.dart';

// // class TeacherProjectsScreen extends StatefulWidget {
// //   final String teacherId;
// //   const TeacherProjectsScreen({super.key, required this.teacherId});

// //   @override
// //   State<TeacherProjectsScreen> createState() => _TeacherProjectsScreenState();
// // }

// // class _TeacherProjectsScreenState extends State<TeacherProjectsScreen> {
// //   final _formKey = GlobalKey<FormState>();
// //   final TextEditingController _titleController = TextEditingController();
// //   final TextEditingController _descriptionController = TextEditingController();
// //   bool _loading = false;
// //   String? _editingDocId;

// //   String? _selectedCourseId;
// //   String? _selectedTopicId;

// //   List<QueryDocumentSnapshot> _courses = [];
// //   List<QueryDocumentSnapshot> _topics = [];
// //   final user = FirebaseAuth.instance.currentUser;

// //   final List<Map<String, String>> _resources = [];

// //   CollectionReference get _projectsRef =>
// //       FirebaseFirestore.instance.collection('projects');

// //   @override
// //   void initState() {
// //     super.initState();
// //     _fetchCourses();
// //   }

// //   Future<void> _fetchCourses() async {
// //     debugPrint("Fetching courses for teacher...");
// //     try {
// //       if (user == null) {
// //         debugPrint("No user logged in");
// //         return;
// //       }

// //       final teacherDoc = await FirebaseFirestore.instance
// //           .collection('users')
// //           .doc(user!.uid)
// //           .get();

// //       final teacherCourses =
// //           List<String>.from(teacherDoc.data()?['courses'] ?? []);
// //       debugPrint("Teacher courses found: $teacherCourses");

// //       if (teacherCourses.isEmpty) {
// //         setState(() => _courses = []);
// //         debugPrint("No courses assigned to this teacher");
// //         return;
// //       }

// //       final snapshot = await FirebaseFirestore.instance
// //           .collection('courses')
// //           .where(FieldPath.documentId, whereIn: teacherCourses)
// //           .orderBy('title')
// //           .get();

// //       setState(() => _courses = snapshot.docs);
// //       debugPrint("Loaded ${_courses.length} courses successfully");
// //     } catch (e) {
// //       debugPrint("Error fetching courses: $e");
// //       ScaffoldMessenger.of(context).showSnackBar(
// //         SnackBar(content: Text("Error loading courses: $e")),
// //       );
// //     }
// //   }

// //   Future<void> _fetchTopics(String courseId) async {
// //     debugPrint("Fetching topics for course: $courseId");
// //     try {
// //       final snapshot = await FirebaseFirestore.instance
// //           .collection('topics')
// //           .where('courseId', isEqualTo: courseId)
// //           .orderBy('order')
// //           .get();

// //       setState(() => _topics = snapshot.docs);
// //       debugPrint("Fetched ${_topics.length} topics for course $courseId");
// //     } catch (e) {
// //       debugPrint("Error fetching topics: $e");
// //       ScaffoldMessenger.of(context)
// //           .showSnackBar(SnackBar(content: Text("Error loading topics: $e")));
// //     }
// //   }

// //   Future<void> _saveProject() async {
// //     if (!_formKey.currentState!.validate()) return;
// //     setState(() => _loading = true);
// //     debugPrint(_editingDocId == null
// //         ? "Saving new project..."
// //         : "Updating project $_editingDocId");

// //     try {
// //       if (user == null) throw Exception("User not logged in");

// //       final data = {
// //         'title': _titleController.text.trim(),
// //         'instructions': _descriptionController.text.trim(),
// //         'resources': _resources
// //             .map((r) => {"name": r['name'] ?? '', "url": r['url'] ?? ''})
// //             .toList(),
// //         'createdBy': user!.uid,
// //         'createdAt': FieldValue.serverTimestamp(),
// //         'courseId': _selectedCourseId,
// //         'topicId': _selectedTopicId,
// //         'reusedBy': [],
// //       };

// //       if (_editingDocId == null) {
// //         await _projectsRef.add(data);
// //         debugPrint("Project added successfully");
// //         ScaffoldMessenger.of(context)
// //             .showSnackBar(const SnackBar(content: Text("Project added!")));
// //       } else {
// //         await _projectsRef.doc(_editingDocId).update(data);
// //         debugPrint("Project $_editingDocId updated successfully");
// //         ScaffoldMessenger.of(context)
// //             .showSnackBar(const SnackBar(content: Text("Project updated!")));
// //         _editingDocId = null;
// //       }

// //       _clearForm();
// //     } catch (e) {
// //       debugPrint("Error saving project: $e");
// //       ScaffoldMessenger.of(context)
// //           .showSnackBar(SnackBar(content: Text("Error: $e")));
// //     } finally {
// //       setState(() => _loading = false);
// //     }
// //   }

// //   Future<void> _deleteProject(String docId) async {
// //     debugPrint("Deleting project: $docId");
// //     try {
// //       await _projectsRef.doc(docId).delete();
// //       debugPrint("Project $docId deleted successfully");
// //       ScaffoldMessenger.of(context)
// //           .showSnackBar(const SnackBar(content: Text("Project deleted!")));
// //       if (_editingDocId == docId) _editingDocId = null;
// //     } catch (e) {
// //       debugPrint("Error deleting project: $e");
// //       ScaffoldMessenger.of(context)
// //           .showSnackBar(SnackBar(content: Text("Error deleting: $e")));
// //     }
// //   }

// //   void _editProject(Map<String, dynamic> data, String docId) {
// //     debugPrint("Editing project: $docId");
// //     _titleController.text = data['title'] ?? '';
// //     _descriptionController.text = data['instructions'] ?? '';
// //     _resources.clear();
// //     if (data['resources'] != null) {
// //       for (var r in data['resources']) {
// //         _resources.add(Map<String, String>.from(r));
// //       }
// //     }
// //     _editingDocId = docId;
// //   }

// //   void _clearForm() {
// //     debugPrint("Clearing form");
// //     _titleController.clear();
// //     _descriptionController.clear();
// //     _resources.clear();
// //     _editingDocId = null;
// //   }

// //   void _addResource() {
// //     showDialog(
// //       context: context,
// //       builder: (ctx) {
// //         final nameController = TextEditingController();
// //         final urlController = TextEditingController();
// //         return AlertDialog(
// //           title: const Text("Add Resource"),
// //           content: Column(
// //             mainAxisSize: MainAxisSize.min,
// //             children: [
// //               TextField(
// //                 controller: nameController,
// //                 decoration: const InputDecoration(labelText: "Name"),
// //               ),
// //               TextField(
// //                 controller: urlController,
// //                 decoration: const InputDecoration(labelText: "URL"),
// //               ),
// //             ],
// //           ),
// //           actions: [
// //             TextButton(
// //               onPressed: () {
// //                 if (nameController.text.isNotEmpty &&
// //                     urlController.text.isNotEmpty) {
// //                   setState(() {
// //                     _resources.add({
// //                       "name": nameController.text.trim(),
// //                       "url": urlController.text.trim(),
// //                     });
// //                   });
// //                 }
// //                 Navigator.pop(context);
// //               },
// //               child: const Text("Add"),
// //             )
// //           ],
// //         );
// //       },
// //     );
// //   }

// //   Future<void> _toggleReuse(String docId, List<dynamic> reusedBy) async {
// //     debugPrint("Toggling reuse for project: $docId");
// //     try {
// //       final uid = user!.uid;
// //       final projectRef = _projectsRef.doc(docId);

// //       if (reusedBy.contains(uid)) {
// //         debugPrint("Removing reuse by $uid");
// //         await projectRef.update({
// //           'reusedBy': FieldValue.arrayRemove([uid]),
// //         });
// //       } else {
// //         debugPrint("Adding reuse by $uid");
// //         await projectRef.update({
// //           'reusedBy': FieldValue.arrayUnion([uid]),
// //         });
// //       }
// //     } catch (e) {
// //       debugPrint("Error toggling reuse: $e");
// //       ScaffoldMessenger.of(context)
// //           .showSnackBar(SnackBar(content: Text("Error: $e")));
// //     }
// //   }

// //   @override
// //   Widget build(BuildContext context) {
// //     if (user == null) return const SizedBox.shrink();

// //     final projectStream = (_selectedCourseId != null && _selectedTopicId != null)
// //         ? _projectsRef
// //             .where('courseId', isEqualTo: _selectedCourseId)
// //             .where('topicId', isEqualTo: _selectedTopicId)
// //             .snapshots()
// //         : null;

// //     return Scaffold(
// //       appBar: AppBar(
// //         title: const Text("Projects"),
// //         backgroundColor: AppTheme.primaryColor,
// //       ),
// //       body: CustomScrollView(
// //         slivers: [
// //           SliverPadding(
// //             padding: const EdgeInsets.all(16),
// //             sliver: SliverList(
// //               delegate: SliverChildListDelegate([
// //                 DropdownButtonFormField<String>(
// //                   initialValue: _selectedCourseId,
// //                   decoration: const InputDecoration(labelText: "Select Course"),
// //                   items: _courses
// //                       .map((c) => DropdownMenuItem(
// //                             value: c.id,
// //                             child: Text(c['title'] ?? 'Unnamed'),
// //                           ))
// //                       .toList(),
// //                   onChanged: (value) {
// //                     debugPrint("Course selected: $value");
// //                     setState(() {
// //                       _selectedCourseId = value;
// //                       _selectedTopicId = null;
// //                       _topics = [];
// //                       _clearForm();
// //                     });
// //                     if (value != null) _fetchTopics(value);
// //                   },
// //                 ),
// //                 const SizedBox(height: 12),
// //                 DropdownButtonFormField<String>(
// //                   initialValue: _selectedTopicId,
// //                   decoration: const InputDecoration(labelText: "Select Topic"),
// //                   items: _topics
// //                       .map((t) => DropdownMenuItem(
// //                             value: t.id,
// //                             child: Text(t['title'] ?? 'Unnamed'),
// //                           ))
// //                       .toList(),
// //                   onChanged: (value) {
// //                     debugPrint("Topic selected: $value");
// //                     setState(() {
// //                       _selectedTopicId = value;
// //                       _clearForm();
// //                     });
// //                   },
// //                 ),
// //                 const SizedBox(height: 12),
// //                 Form(
// //                   key: _formKey,
// //                   child: Column(
// //                     children: [
// //                       TextFormField(
// //                         controller: _titleController,
// //                         decoration:
// //                             const InputDecoration(labelText: "Project Title"),
// //                         validator: (v) => v!.isEmpty ? "Enter a title" : null,
// //                       ),
// //                       const SizedBox(height: 12),
// //                       TextFormField(
// //                         controller: _descriptionController,
// //                         maxLines: 4,
// //                         decoration: const InputDecoration(
// //                             labelText: "Project Description"),
// //                         validator: (v) =>
// //                             v!.isEmpty ? "Enter description" : null,
// //                       ),
// //                       const SizedBox(height: 12),
// //                       Wrap(
// //                         spacing: 6,
// //                         children: _resources
// //                             .map((res) => Chip(label: Text(res['name'] ?? '-')))
// //                             .toList(),
// //                       ),
// //                       TextButton.icon(
// //                         onPressed: _addResource,
// //                         icon: const Icon(Icons.add),
// //                         label: const Text("Add Resource"),
// //                       ),
// //                       const SizedBox(height: 12),
// //                       _loading
// //                           ? const CircularProgressIndicator()
// //                           : ElevatedButton(
// //                               onPressed: _saveProject,
// //                               style: ElevatedButton.styleFrom(
// //                                 backgroundColor: AppTheme.primaryColor,
// //                               ),
// //                               child: Text(_editingDocId == null
// //                                   ? "Add Project"
// //                                   : "Update Project"),
// //                             ),
// //                       const SizedBox(height: 24),
// //                     ],
// //                   ),
// //                 ),
// //               ]),
// //             ),
// //           ),
// //           SliverFillRemaining(
// //             child: projectStream == null
// //                 ? const Center(
// //                     child: Text("Select a course and topic to view projects"))
// //                 : StreamBuilder<QuerySnapshot>(
// //                     stream: projectStream,
// //                     builder: (context, snapshot) {
// //                       if (snapshot.hasError) {
// //                         debugPrint("Stream error: ${snapshot.error}");
// //                         return Center(child: Text('Error: ${snapshot.error}'));
// //                       }
// //                       if (!snapshot.hasData) {
// //                         return const Center(child: CircularProgressIndicator());
// //                       }

// //                       final docs = snapshot.data!.docs;
// //                       debugPrint("Fetched ${docs.length} projects for display");

// //                       if (docs.isEmpty) {
// //                         return const Center(child: Text("No projects yet."));
// //                       }

// //                       return ListView.builder(
// //                         physics: const ClampingScrollPhysics(),
// //                         itemCount: docs.length,
// //                         itemBuilder: (context, index) {
// //                           final doc = docs[index];
// //                           final data = doc.data() as Map<String, dynamic>;
// //                           final isOwner = data['createdBy'] == user!.uid;
// //                           final reusedBy =
// //                               List<String>.from(data['reusedBy'] ?? []);
// //                           final isReused = reusedBy.contains(user!.uid);

// //                           return Card(
// //                             child: ListTile(
// //                               title: Text(data['title'] ?? ''),
// //                               subtitle: Column(
// //                                 crossAxisAlignment: CrossAxisAlignment.start,
// //                                 children: [
// //                                   Text(data['instructions'] ?? ''),
// //                                   if (data['resources'] != null)
// //                                     Wrap(
// //                                       spacing: 6,
// //                                       children: List<Widget>.from(
// //                                         (data['resources'] as List)
// //                                             .map((r) =>
// //                                                 Chip(label: Text(r['name']))),
// //                                       ),
// //                                     ),
// //                                 ],
// //                               ),
// //                               trailing: isOwner
// //                                   ? Row(
// //                                       mainAxisSize: MainAxisSize.min,
// //                                       children: [
// //                                         IconButton(
// //                                           icon: const Icon(Icons.edit,
// //                                               color: Colors.blue),
// //                                           onPressed: () =>
// //                                               _editProject(data, doc.id),
// //                                         ),
// //                                         IconButton(
// //                                           icon: const Icon(Icons.delete,
// //                                               color: Colors.red),
// //                                           onPressed: () =>
// //                                               _deleteProject(doc.id),
// //                                         ),
// //                                       ],
// //                                     )
// //                                   : TextButton.icon(
// //                                       onPressed: () =>
// //                                           _toggleReuse(doc.id, reusedBy),
// //                                       icon: Icon(
// //                                         isReused
// //                                             ? Icons.stop
// //                                             : Icons.replay,
// //                                         color: isReused
// //                                             ? Colors.red
// //                                             : Colors.green,
// //                                       ),
// //                                       label: Text(
// //                                           isReused ? "Stop Using" : "Reuse"),
// //                                     ),
// //                             ),
// //                           );
// //                         },
// //                       );
// //                     },
// //                   ),
// //           ),
// //         ],
// //       ),
// //     );
// //   }
// // }
