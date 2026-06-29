import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_highlight/flutter_highlight.dart';
import 'package:flutter_highlight/themes/atom-one-dark.dart';
import 'package:flutter_highlight/themes/github.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:markdown/markdown.dart' as md;

class CourseProjectsPanel extends StatefulWidget {
  final bool darkMode;

  const CourseProjectsPanel({super.key, this.darkMode = false});

  @override
  State<CourseProjectsPanel> createState() => _CourseProjectsPanelState();
}

class _CourseProjectsPanelState extends State<CourseProjectsPanel> {
  final _firestore = FirebaseFirestore.instance;
  final _auth = FirebaseAuth.instance;

  bool loading = true;
  List<Map<String, dynamic>> projects = [];
  Map<String, dynamic>? selectedProject;
  String githubUrl = '';

  @override
  void initState() {
    super.initState();
    fetchStudentCoursesAndProjects();
  }

  Future<void> fetchStudentCoursesAndProjects() async {
    setState(() => loading = true);

    final user = _auth.currentUser;
    if (user == null) {
      setState(() => loading = false);
      return;
    }

    try {
      final studentDoc = await _firestore
          .collection('users')
          .doc(user.uid)
          .get();

      final data = studentDoc.data() ?? {};
      final courseIds = List<String>.from(data['courseIds'] ?? []);
      final teacherIds = List<String>.from(data['teacherIds'] ?? []);

      if (courseIds.isEmpty) {
        setState(() {
          projects = [];
          loading = false;
        });
        return;
      }

      final teacherSnap = await _firestore
          .collectionGroup('projects')
          .where('courseId', whereIn: courseIds)
          .get();

      final reusedSnap = await _firestore
          .collectionGroup('projects')
          .where('courseId', whereIn: courseIds)
          .where(
            'reusedBy',
            arrayContainsAny: teacherIds.isEmpty ? null : teacherIds,
          )
          .get();

      final Map<String, Map<String, dynamic>> merged = {};

      for (final doc in [...teacherSnap.docs, ...reusedSnap.docs]) {
        merged[doc.id] = {'id': doc.id, ...doc.data()};
      }

      setState(() {
        projects = merged.values.toList();
        loading = false;
        selectedProject = null;
      });
    } catch (e) {
      setState(() => loading = false);
    }
  }

  Future<void> openProject(String projectId) async {
    setState(() => loading = true);

    final user = _auth.currentUser;
    if (user == null) return;

    try {
      final doc = await _firestore.collection('projects').doc(projectId).get();

      if (!doc.exists) {
        await fetchStudentCoursesAndProjects();
        return;
      }

      final submission = await _firestore
          .collection('projects')
          .doc(projectId)
          .collection('submissions')
          .doc(user.uid)
          .get();

      setState(() {
        selectedProject = {
          'id': doc.id,
          ...doc.data()!,
          'alreadySubmitted': submission.exists,
        };
        loading = false;
      });
    } catch (e) {
      setState(() => loading = false);
    }
  }

  Future<void> submitGithubLink() async {
    final user = _auth.currentUser;

    if (user == null || selectedProject == null || githubUrl.trim().isEmpty)
      return;

    final projectId = selectedProject!['id'];

    final ref = _firestore
        .collection('projects')
        .doc(projectId)
        .collection('submissions')
        .doc(user.uid);

    final existing = await ref.get();

    if (existing.exists) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Already submitted')));
      return;
    }

    await ref.set({
      'githubUrl': githubUrl.trim(),
      'studentId': user.uid,
      'submittedAt': FieldValue.serverTimestamp(),
    });

    setState(() => githubUrl = '');

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Submitted successfully')));
  }

  @override
  Widget build(BuildContext context) {
    if (loading && selectedProject == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          selectedProject == null
              ? "My Projects"
              : selectedProject!['title'] ?? 'Project',
        ),
        backgroundColor: Colors.orangeAccent,
      ),
      body: selectedProject == null ? buildProjectList() : buildProjectDetail(),
    );
  }

  Widget buildProjectList() {
    if (projects.isEmpty) {
      return const Center(child: Text("No projects found"));
    }

    final grouped = <String, List<Map<String, dynamic>>>{};

    for (final p in projects) {
      final key = p['courseId'] ?? 'Unknown';
      grouped.putIfAbsent(key, () => []).add(p);
    }

    return ListView(
      children: grouped.entries.map((e) {
        return ExpansionTile(
          title: Text("Course: ${e.key}"),
          children: e.value.map((p) {
            return ListTile(
              title: Text(p['title'] ?? ''),
              onTap: () => openProject(p['id']),
            );
          }).toList(),
        );
      }).toList(),
    );
  }

  Widget buildProjectDetail() {
    final markdown = selectedProject!['instructions'] ?? '';
    final resources = List.from(selectedProject!['resources'] ?? []);
    final already = selectedProject!['alreadySubmitted'] == true;

    if (already) {
      return const Center(child: Text("Already submitted"));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextButton(
            onPressed: () => setState(() => selectedProject = null),
            child: const Text("← Back"),
          ),
          MarkdownBody(data: markdown),
          const SizedBox(height: 20),

          ...resources.map((r) {
            final name = r['name'] ?? 'resource';
            final url = r['url'] ?? '';
            return ListTile(
              title: Text(name),
              onTap: () async {
                if (await canLaunchUrl(Uri.parse(url))) {
                  launchUrl(Uri.parse(url));
                }
              },
            );
          }),

          const SizedBox(height: 20),

          TextField(
            decoration: const InputDecoration(
              labelText: "GitHub URL",
              border: OutlineInputBorder(),
            ),
            onChanged: (v) => githubUrl = v,
          ),

          const SizedBox(height: 10),

          ElevatedButton(
            onPressed: submitGithubLink,
            child: const Text("Submit"),
          ),
        ],
      ),
    );
  }
}
// import 'package:flutter/material.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:flutter_markdown/flutter_markdown.dart';
// import 'package:flutter_highlight/flutter_highlight.dart';
// import 'package:flutter_highlight/themes/atom-one-dark.dart';
// import 'package:flutter_highlight/themes/github.dart';
// import 'package:url_launcher/url_launcher.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:markdown/markdown.dart' as md;

// class CourseProjectsPanel extends StatefulWidget {
//   final bool darkMode;
//   const CourseProjectsPanel({super.key, this.darkMode = false});

//   @override
//   State<CourseProjectsPanel> createState() => _CourseProjectsPanelState();
// }

// class _CourseProjectsPanelState extends State<CourseProjectsPanel> {
//   final _firestore = FirebaseFirestore.instance;
//   final _auth = FirebaseAuth.instance;

//   bool loading = true;
//   List<Map<String, dynamic>> projects = [];
//   Map<String, dynamic>? selectedProject;
//   String githubUrl = '';

//   @override
//   void initState() {
//     super.initState();

//     fetchStudentCoursesAndProjects();
//   }

//   /// 🔥 Auto-fetch student's courses and their projects (teacher + reused)
//   Future<void> fetchStudentCoursesAndProjects() async {
//     setState(() => loading = true);

//     final user = _auth.currentUser;
//     if (user == null) {
//       setState(() => loading = false);
//       return;
//     }

//     try {
//       final studentDoc = await _firestore
//           .collection('users')
//           .doc(user.uid)
//           .get();
//       final studentData = studentDoc.data() ?? {};
//       final courseIds = (studentData['courseIds'] ?? []).cast<String>();
//       final teacherIds = (studentData['teacherIds'] ?? []).cast<String>();

//       // 🔹 Query 1: Teacher projects
//       final teacherSnap = await _firestore
//           .collectionGroup('projects')
//           .where('courseId', whereIn: courseIds.isEmpty ? ['none'] : courseIds)
//           .where(
//             'createdBy',
//             whereIn: teacherIds.isEmpty ? ['none'] : teacherIds,
//           )
//           .orderBy('createdAt', descending: false)
//           .get();

//       // 🔹 Query 2: Reused projects
//       // final reusedSnap = await _firestore
//       //     .collectionGroup('projects')
//       //     .where('courseId', whereIn: courseIds.isEmpty ? ['none'] : courseIds)
//       //     .where('reused', isEqualTo: true)
//       //     .orderBy('createdAt', descending: false)
//       //     .get();
//       // 🔹 Query 2: Reused projects (with reusedBy array)
//       final reusedSnap = await _firestore
//           .collectionGroup('projects')
//           .where('courseId', whereIn: courseIds.isEmpty ? ['none'] : courseIds)
//           .where(
//             'reusedBy',
//             arrayContainsAny: teacherIds.isEmpty ? ['none'] : teacherIds,
//           )
//           .orderBy('createdAt', descending: false)
//           .get();

//       // 🔹 Merge and remove duplicates
//       final mergedProjects = <String, Map<String, dynamic>>{};
//       for (var doc in [...teacherSnap.docs, ...reusedSnap.docs]) {
//         if (doc.exists && !doc.metadata.hasPendingWrites) {
//           mergedProjects[doc.id] = {'id': doc.id, ...doc.data()};
//         }
//       }

//       setState(() {
//         projects = mergedProjects.values.toList();
//         loading = false;
//         selectedProject = null; // reset selection to allow opening new project
//       });
//     } catch (e) {
//       setState(() => loading = false);
//     }
//   }

//   /// 🔹 Load a single project for detail view
//   // Future<void> openProject(String projectId) async {
//   //
//   //   setState(() => loading = true);

//   //   try {
//   //     final projectDoc = await _firestore.collection('projects').doc(projectId).get();
//   //     if (projectDoc.exists) {
//   //       final data = {'id': projectDoc.id, ...projectDoc.data()!};
//   //       setState(() {
//   //         selectedProject = data;
//   //         loading = false;
//   //       });
//   //     } else {
//   //
//   //       // Reload projects after deletion
//   //       await fetchStudentCoursesAndProjects();
//   //     }
//   //   } catch (e) {
//   //
//   //     setState(() => loading = false);
//   //   }
//   // }
//   Future<void> openProject(String projectId) async {
//     setState(() => loading = true);

//     final user = _auth.currentUser;
//     if (user == null) return;

//     try {
//       final projectDoc = await _firestore
//           .collection('projects')
//           .doc(projectId)
//           .get();
//       if (!projectDoc.exists) {
//         await fetchStudentCoursesAndProjects();
//         return;
//       }

//       final data = {'id': projectDoc.id, ...projectDoc.data()!};

//       final submissionSnap = await _firestore
//           .collection('projects')
//           .doc(projectId)
//           .collection('submissions')
//           .doc(user.uid)
//           .get();

//       final alreadySubmitted = submissionSnap.exists;

//       setState(() {
//         selectedProject = {...data, 'alreadySubmitted': alreadySubmitted};
//         loading = false;
//       });
//     } catch (e) {
//       setState(() => loading = false);
//     }
//   }

//   /// 🚀 Submit GitHub link
//   // Future<void> submitGithubLink() async {
//   //   final user = _auth.currentUser;
//   //   if (user == null || githubUrl.trim().isEmpty) return;

//   //   final projectId = selectedProject!['id'];
//   //   try {
//   //     final submissionRef = _firestore
//   //         .collection('projects')
//   //         .doc(projectId)
//   //         .collection('submissions')
//   //         .doc(user.uid);

//   //     await submissionRef.set({
//   //       'githubUrl': githubUrl.trim(),
//   //       'studentId': user.uid,
//   //       'submittedAt': FieldValue.serverTimestamp(),
//   //     });

//   //     ScaffoldMessenger.of(context).showSnackBar(
//   //       const SnackBar(content: Text('✅ GitHub link submitted successfully!')),
//   //     );
//   //     setState(() => githubUrl = '');
//   //   } catch (e) {
//   //
//   //   }
//   // }
//   Future<void> submitGithubLink() async {
//     final user = _auth.currentUser;
//     if (user == null || githubUrl.trim().isEmpty || selectedProject == null)
//       return;

//     final projectId = selectedProject!['id'];
//     final submissionRef = _firestore
//         .collection('projects')
//         .doc(projectId)
//         .collection('submissions')
//         .doc(user.uid);

//     final existing = await submissionRef.get();
//     if (existing.exists) {
//       ScaffoldMessenger.of(context).showSnackBar(
//         const SnackBar(content: Text('⚠️ You already submitted this project.')),
//       );
//       return;
//     }

//     try {
//       await submissionRef.set({
//         'githubUrl': githubUrl.trim(),
//         'studentId': user.uid,
//         'submittedAt': FieldValue.serverTimestamp(),
//       });

//       ScaffoldMessenger.of(context).showSnackBar(
//         const SnackBar(content: Text('✅ GitHub link submitted successfully!')),
//       );
//       setState(() => githubUrl = '');
//     } catch (e) {
//       e;
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     if (loading && selectedProject == null) {
//       return const Scaffold(body: Center(child: CircularProgressIndicator()));
//     }

//     return Scaffold(
//       appBar: AppBar(
//         title: Text(
//           selectedProject == null
//               ? '🧩 My Course Projects'
//               : selectedProject!['title'] ?? 'Project',
//         ),
//         backgroundColor: Colors.orangeAccent,
//       ),
//       body: Container(
//         padding: const EdgeInsets.all(16),
//         color: widget.darkMode ? Colors.grey[900] : Colors.white,
//         child: selectedProject == null ? buildGroupedList() : buildDetailView(),
//       ),
//     );
//   }

//   /// 🧭 Groups projects by course
//   Widget buildGroupedList() {
//     if (projects.isEmpty)
//       return const Center(child: Text('No projects assigned yet.'));

//     final grouped = <String, List<Map<String, dynamic>>>{};
//     for (var project in projects) {
//       final courseId = project['courseId'] ?? 'Unknown';
//       grouped.putIfAbsent(courseId, () => []).add(project);
//     }

//     return ListView(
//       children: grouped.entries.map((entry) {
//         return Card(
//           elevation: 3,
//           margin: const EdgeInsets.symmetric(vertical: 8),
//           child: ExpansionTile(
//             title: Text(
//               '📘 Course: ${entry.key}',
//               style: const TextStyle(fontWeight: FontWeight.bold),
//             ),
//             children: entry.value.map((project) {
//               return ListTile(
//                 title: Text(project['title'] ?? 'Untitled Project'),
//                 trailing: const Icon(Icons.arrow_forward_ios, size: 18),
//                 onTap: () => openProject(project['id']),
//               );
//             }).toList(),
//           ),
//         );
//       }).toList(),
//     );
//   }

//   /// 📄 Project detail + Markdown + GitHub submission
//   Widget buildDetailView() {
//     final markdown = selectedProject!['instructions'] ?? '';
//     final resources = (selectedProject!['resources'] ?? []) as List<dynamic>;
//     if (selectedProject!['alreadySubmitted'] == true) {
//       return const Text('✅ You already submitted this project!');
//     }

//     return SingleChildScrollView(
//       child: Column(
//         crossAxisAlignment: CrossAxisAlignment.start,
//         children: [
//           TextButton(
//             onPressed: () {
//               setState(() => selectedProject = null);
//             },
//             child: const Text('← Back to projects'),
//           ),
//           const SizedBox(height: 8),
//           MarkdownBody(
//             data: markdown,
//             selectable: true,
//             styleSheet: MarkdownStyleSheet(
//               p: TextStyle(
//                 fontSize: 16,
//                 color: widget.darkMode ? Colors.white : Colors.black,
//               ),
//               h1: TextStyle(
//                 fontSize: 24,
//                 fontWeight: FontWeight.bold,
//                 color: widget.darkMode ? Colors.white : Colors.black,
//               ),
//             ),
//             onTapLink: (text, href, title) async {
//               if (href != null && await canLaunchUrl(Uri.parse(href))) {
//                 await launchUrl(
//                   Uri.parse(href),
//                   mode: LaunchMode.externalApplication,
//                 );
//               }
//             },
//             builders: {'code': CodeBlockBuilder(widget.darkMode)},
//           ),
//           const SizedBox(height: 20),
//           if (resources.isNotEmpty) ...[
//             Text(
//               "Resources",
//               style: TextStyle(
//                 fontSize: 20,
//                 fontWeight: FontWeight.bold,
//                 color: widget.darkMode ? Colors.white : Colors.black,
//               ),
//             ),
//             const SizedBox(height: 8),
//             ...resources.map((r) {
//               final name = r is Map ? r['name'] ?? 'Unnamed' : r.toString();
//               final url = r is Map ? r['url'] ?? '' : r.toString();
//               return Card(
//                 child: ListTile(
//                   title: Text(name),
//                   trailing: const Icon(Icons.open_in_new),
//                   onTap: () async {
//                     if (await canLaunchUrl(Uri.parse(url))) {
//                       await launchUrl(
//                         Uri.parse(url),
//                         mode: LaunchMode.externalApplication,
//                       );
//                     }
//                   },
//                 ),
//               );
//             }),
//           ],
//           const SizedBox(height: 24),
//           Divider(color: widget.darkMode ? Colors.white54 : Colors.black26),
//           const SizedBox(height: 8),
//           Text(
//             'Submit your GitHub link',
//             style: TextStyle(
//               fontSize: 18,
//               fontWeight: FontWeight.bold,
//               color: widget.darkMode ? Colors.white : Colors.black,
//             ),
//           ),
//           const SizedBox(height: 10),
//           TextField(
//             decoration: const InputDecoration(
//               labelText: 'GitHub repository URL',
//               border: OutlineInputBorder(),
//             ),
//             onChanged: (value) => githubUrl = value,
//           ),
//           const SizedBox(height: 10),
//           ElevatedButton.icon(
//             onPressed: submitGithubLink,
//             icon: const Icon(Icons.cloud_upload),
//             label: const Text('Submit'),
//             style: ElevatedButton.styleFrom(
//               backgroundColor: Colors.orangeAccent,
//               padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
//             ),
//           ),
//         ],
//       ),
//     );
//   }
// }

// /// 🎨 Markdown syntax highlighter
// class CodeBlockBuilder extends MarkdownElementBuilder {
//   final bool darkMode;
//   CodeBlockBuilder(this.darkMode);

//   @override
//   Widget? visitElementAfter(md.Element element, TextStyle? preferredStyle) {
//     final language =
//         element.attributes['class']?.replaceFirst('language-', '') ?? 'dart';
//     final code = element.textContent;

//     return Container(
//       width: double.infinity,
//       margin: const EdgeInsets.symmetric(vertical: 8),
//       child: HighlightView(
//         code,
//         language: language,
//         theme: darkMode ? atomOneDarkTheme : githubTheme,
//         padding: const EdgeInsets.all(12),
//         textStyle: const TextStyle(fontFamily: 'monospace', fontSize: 14),
//       ),
//     );
//   }
// }

// // remove debug prints
// // make submit for github work or make it link to google colab
