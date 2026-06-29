// lib/screens/student/course_notes_flipbook.dart

import 'dart:math' as math;

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_highlight/flutter_highlight.dart';
import 'package:flutter_highlight/themes/atom-one-dark.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:markdown/markdown.dart' as md;
import 'package:page_flip/page_flip.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

class CourseNotesFlipBook extends StatefulWidget {
  final bool darkMode;

  const CourseNotesFlipBook({super.key, this.darkMode = false});

  @override
  State<CourseNotesFlipBook> createState() => _CourseNotesFlipBookState();
}

class _CourseNotesFlipBookState extends State<CourseNotesFlipBook> {
  final supabase = Supabase.instance.client;

  bool loading = true;

  List<Map<String, dynamic>> studentCourses = [];
  String? selectedCourseId;

  Map<String, List<Map<String, dynamic>>> topicsMap = {};
  Map<String, String> topicTitles = {};

  final _controller = GlobalKey<PageFlipWidgetState>();

  late List<Map<String, dynamic>> _allPages;

  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    fetchStudentCourses();
  }

  /// =========================================
  /// LOAD STUDENT COURSES
  /// =========================================
  Future<void> fetchStudentCourses() async {
    try {
      final user = supabase.auth.currentUser;

      if (user == null) {
        setState(() => loading = false);
        return;
      }

      /// Get student profile
      final student = await supabase
          .from('users')
          .select('assigned_course_id')
          .eq('id', user.id)
          .single();

      final assignedCourseId = student['assigned_course_id'];

      if (assignedCourseId == null) {
        setState(() => loading = false);
        return;
      }

      /// Load course
      final courseRes = await supabase
          .from('courses')
          .select()
          .eq('id', assignedCourseId);

      setState(() {
        studentCourses = List<Map<String, dynamic>>.from(courseRes);

        if (studentCourses.isNotEmpty) {
          selectedCourseId = studentCourses.first['id'];
        }
      });

      await fetchNotes();
    } catch (e) {
      debugPrint("ERROR LOADING COURSES: $e");

      setState(() => loading = false);
    }
  }

  /// =========================================
  /// LOAD NOTES
  /// =========================================
  Future<void> fetchNotes() async {
    if (selectedCourseId == null) return;

    setState(() => loading = true);

    try {
      /// Load topics
      final topicsRes = await supabase
          .from('topics')
          .select()
          .eq('course_id', selectedCourseId!);

      final topicIds = topicsRes.map((e) => e['id']).toList();

      if (topicIds.isEmpty) {
        setState(() {
          topicsMap = {};
          topicTitles = {};
          loading = false;
        });

        return;
      }

      /// Load notes
      final notesRes = await supabase
          .from('notes')
          .select()
          .inFilter('topic_id', topicIds)
          .order('created_at');

      Map<String, List<Map<String, dynamic>>> tempTopics = {};

      Map<String, String> tempTitles = {};

      for (var topic in topicsRes) {
        tempTitles[topic['id']] = topic['title'];
      }

      for (var note in notesRes) {
        final topicId = note['topic_id'];

        tempTopics[topicId] ??= [];

        tempTopics[topicId]!.add(note);
      }

      setState(() {
        topicsMap = tempTopics;
        topicTitles = tempTitles;
        loading = false;
      });

      _generatePages();
    } catch (e) {
      debugPrint("ERROR FETCHING NOTES: $e");

      setState(() => loading = false);
    }
  }

  /// =========================================
  /// GENERATE BOOK PAGES
  /// =========================================
  void _generatePages() {
    _allPages = [];

    /// TOC
    _allPages.add({'type': 'toc', 'content': 'Table of Contents'});

    topicsMap.forEach((topicId, notes) {
      final topicTitle = topicTitles[topicId] ?? 'Untitled Topic';

      /// Topic Cover
      _allPages.add({'type': 'topic', 'title': topicTitle});

      for (var note in notes) {
        final content = note['content'] ?? '';
        final title = note['title'] ?? '';

        const maxCharsPerPage = 900;

        int start = 0;

        while (start < content.length) {
          int end = math.min(start + maxCharsPerPage, content.length);

          String chunk = content.substring(start, end);

          int lastBreak = chunk.lastIndexOf('\n');

          if (lastBreak != -1 && end != content.length) {
            end = start + lastBreak;
          }

          _allPages.add({
            'type': 'lesson',
            'title': title,
            'content': content.substring(start, end),
          });

          start = end;
        }
      }
    });

    setState(() {});
  }

  /// =========================================
  /// NEXT PAGE
  /// =========================================
  void _goNext() {
    if (_currentPage < _allPages.length - 1) {
      _controller.currentState?.nextPage();

      setState(() => _currentPage++);
    }
  }

  /// =========================================
  /// PREVIOUS PAGE
  /// =========================================
  void _goPrevious() {
    if (_currentPage > 0) {
      _controller.currentState?.previousPage();

      setState(() => _currentPage--);
    }
  }

  /// =========================================
  /// JUMP PAGE
  /// =========================================
  Future<void> _jumpToPage(int pageIndex) async {
    if (pageIndex < 0 || pageIndex >= _allPages.length) {
      return;
    }

    while (_currentPage < pageIndex) {
      _controller.currentState?.nextPage();

      setState(() => _currentPage++);

      await Future.delayed(const Duration(milliseconds: 100));
    }

    while (_currentPage > pageIndex) {
      _controller.currentState?.previousPage();

      setState(() => _currentPage--);

      await Future.delayed(const Duration(milliseconds: 100));
    }
  }

  /// =========================================
  /// MARK NOTE AS READ
  /// =========================================
  Future<void> markProgress(String noteId) async {
    try {
      final user = supabase.auth.currentUser;

      if (user == null) return;

      await supabase.from('user_notes_progress').upsert({
        'user_id': user.id,
        'note_id': noteId,
      });
    } catch (e) {
      debugPrint("ERROR SAVING PROGRESS: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.orangeAccent,
        title: const Text("Course Notes"),
      ),

      body: Column(
        children: [
          /// COURSE SELECTOR
          if (studentCourses.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(12),
              child: DropdownButtonFormField<String>(
                initialValue: selectedCourseId,
                decoration: InputDecoration(
                  labelText: "Select Course",
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                items: studentCourses
                    .map(
                      (course) => DropdownMenuItem<String>(
                        value: course['id'],
                        child: Text(course['title'] ?? 'Untitled Course'),
                      ),
                    )
                    .toList(),
                onChanged: (value) async {
                  setState(() => selectedCourseId = value);

                  await fetchNotes();
                },
              ),
            ),

          Expanded(
            child: topicsMap.isEmpty
                ? const Center(child: Text("No notes found."))
                : _buildFlipBook(),
          ),
        ],
      ),
    );
  }

  /// =========================================
  /// FLIPBOOK
  /// =========================================
  Widget _buildFlipBook() {
    final pages = _allPages.map<Widget>((page) {
      if (page['type'] == 'toc') {
        return _buildTOCPage();
      }

      if (page['type'] == 'topic') {
        return _buildTopicPage(page['title']);
      }

      return _buildLessonPage(page['title'] ?? '', page['content'] ?? '');
    }).toList();

    return Center(
      child: Stack(
        children: [
          Container(
            margin: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.brown.shade700,
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.4),
                  blurRadius: 10,
                  offset: const Offset(4, 4),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: SizedBox(
                width: 360,
                height: 560,
                child: PageFlipWidget(
                  key: _controller,
                  backgroundColor: Colors.brown.shade700,
                  children: pages,
                ),
              ),
            ),
          ),

          /// LEFT
          Positioned(
            left: 0,
            top: 0,
            bottom: 0,
            child: GestureDetector(
              onTap: _goPrevious,
              child: AnimatedOpacity(
                duration: const Duration(milliseconds: 300),
                opacity: _currentPage > 0 ? 1 : 0.3,
                child: const Icon(
                  Icons.arrow_back_ios,
                  size: 24,
                  color: Colors.blueGrey,
                ),
              ),
            ),
          ),

          /// RIGHT
          Positioned(
            right: 0,
            top: 0,
            bottom: 0,
            child: GestureDetector(
              onTap: _goNext,
              child: AnimatedOpacity(
                duration: const Duration(milliseconds: 300),
                opacity: _currentPage < _allPages.length - 1 ? 1 : 0.3,
                child: const Icon(
                  Icons.arrow_forward_ios,
                  size: 24,
                  color: Colors.blueGrey,
                ),
              ),
            ),
          ),

          /// TOC
          Positioned(
            right: 16,
            bottom: 16,
            child: FloatingActionButton(
              mini: true,
              backgroundColor: Colors.orangeAccent,
              onPressed: _showTOCModal,
              child: const Icon(Icons.list),
            ),
          ),
        ],
      ),
    );
  }

  /// =========================================
  /// TOC MODAL
  /// =========================================
  void _showTOCModal() {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        final topicIds = topicsMap.keys.toList();

        return Container(
          padding: const EdgeInsets.all(16),
          color: widget.darkMode ? Colors.grey[900] : Colors.white,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Table of Contents",
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),

              const SizedBox(height: 16),

              Expanded(
                child: ListView.builder(
                  itemCount: topicIds.length,
                  itemBuilder: (context, index) {
                    final topicId = topicIds[index];

                    final title = topicTitles[topicId] ?? 'Untitled Topic';

                    return Card(
                      child: ListTile(
                        title: Text(title),
                        trailing: const Icon(Icons.arrow_forward_ios),
                        onTap: () {
                          int pageIndex = 1;

                          for (int i = 0; i < index; i++) {
                            pageIndex += 1;

                            final notes = topicsMap[topicIds[i]] ?? [];

                            for (var note in notes) {
                              // final len = (note['content'] ?? '').length;

                              // pageIndex += (len / 900).ceil();
                              final len = (note['content'] ?? '')
                                  .toString()
                                  .length;
                              pageIndex += (len / 900).ceil();
                            }
                          }

                          Navigator.pop(context);

                          _jumpToPage(pageIndex);
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  /// =========================================
  /// LESSON PAGE
  /// =========================================
  Widget _buildLessonPage(String title, String content) {
    return Container(
      padding: const EdgeInsets.all(18),
      color: widget.darkMode ? Colors.grey[900] : Colors.white,
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: widget.darkMode ? Colors.white : Colors.black,
              ),
            ),

            const SizedBox(height: 16),

            MarkdownBody(
              data: content,
              selectable: true,
              styleSheet: MarkdownStyleSheet(
                p: TextStyle(
                  fontSize: 16,
                  height: 1.7,
                  color: widget.darkMode ? Colors.white : Colors.black87,
                ),
                h1: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: widget.darkMode ? Colors.white : Colors.black,
                ),
                h2: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: widget.darkMode ? Colors.white : Colors.black,
                ),
                h3: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: widget.darkMode ? Colors.white : Colors.black,
                ),
              ),

              builders: {'code': CodeBlockBuilder()},

              onTapLink: (text, href, title) async {
                if (href == null) return;

                final uri = Uri.parse(href);

                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  /// =========================================
  /// TOPIC PAGE
  /// =========================================
  Widget _buildTopicPage(String title) {
    return Container(
      color: Colors.orangeAccent,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 30,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }

  /// =========================================
  /// TOC PAGE
  /// =========================================
  Widget _buildTOCPage() {
    return Container(
      color: widget.darkMode ? Colors.grey[900] : Colors.white,
      child: const Center(
        child: Text(
          "Table of Contents",
          style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}

/// =========================================
/// CODE BLOCK
/// =========================================
class CodeBlockBuilder extends MarkdownElementBuilder {
  @override
  Widget? visitElementAfter(md.Element element, TextStyle? preferredStyle) {
    final language =
        element.attributes['class']?.replaceFirst('language-', '') ?? 'dart';

    final code = element.textContent;

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(10),
      ),
      child: HighlightView(
        code,
        language: language,
        theme: atomOneDarkTheme,
        padding: const EdgeInsets.all(14),
        textStyle: const TextStyle(
          fontFamily: 'monospace',
          fontSize: 14,
          color: Colors.white,
        ),
      ),
    );
  }
}
// import 'package:flutter/material.dart';
// import 'package:flutter_markdown/flutter_markdown.dart';
// import 'package:flutter_highlight/flutter_highlight.dart';
// import 'package:flutter_highlight/themes/atom-one-dark.dart';
// // import 'package:flutter_highlight/themes/github.dart';
// import 'package:url_launcher/url_launcher.dart';
// import 'package:markdown/markdown.dart' as md;
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:page_flip/page_flip.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'dart:math' as math;

// class CourseNotesFlipBook extends StatefulWidget {
//   final bool darkMode;

//   const CourseNotesFlipBook({super.key, this.darkMode = false});

//   @override
//   State<CourseNotesFlipBook> createState() => _CourseNotesFlipBookState();
// }

// class _CourseNotesFlipBookState extends State<CourseNotesFlipBook> {
//   bool loading = true;
//   List<Map<String, dynamic>> studentCourses = [];
//   String? selectedCourseId;

//   Map<String, List<Map<String, dynamic>>> topicsMap = {};
//   Map<String, String> topicTitles = {};
//   final _controller = GlobalKey<PageFlipWidgetState>();
//   late List<String> _allPages;
//   int _currentPage = 0;

//   @override
//   void initState() {
//     super.initState();
    
//     fetchStudentCourses();
//   }

//   Future<void> fetchStudentCourses() async {

//   final user = FirebaseAuth.instance.currentUser;
//   if (user == null) {
  
//     return;
//   }

//   try {
//     final userDoc = await FirebaseFirestore.instance
//         .collection('users')
//         .doc(user.uid)
//         .get();

//     final ids = List<String>.from(userDoc.data()?['courseIds'] ?? []);
   

//     if (ids.isEmpty) {
  
//       setState(() => loading = false);
//       return;
//     }

    
//     final coursesSnap = await FirebaseFirestore.instance
//         .collection('courses')
//         .where(FieldPath.documentId, whereIn: ids)
//         .get();

//     setState(() {
//       studentCourses =
//           coursesSnap.docs.map((d) => {'id': d.id, ...d.data()}).toList();
//       selectedCourseId = studentCourses.first['id'];
      
//     });

//     await fetchNotes();
//   } catch (e) {
    
//     setState(() => loading = false);
//   }
// }


//   Future<void> fetchNotes() async {
//     if (selectedCourseId == null) {
      
//       return;
//     }

    
//     setState(() => loading = true);

//     try {
//       final querySnap = await FirebaseFirestore.instance
//           .collectionGroup('notes')
//           .where('courseId', isEqualTo: selectedCourseId)
//           .get();

      

//       Map<String, List<Map<String, dynamic>>> tempTopics = {};
//       Map<String, String> tempTitles = {};

//       // for (var doc in querySnap.docs) {
//       //   final data = doc.data();
//       //   final topicId = data['topicId'] ?? 'unknown';
//       //   final topicTitle = data['topicTitle'] ?? 'Untitled Topic';
//       //   tempTitles[topicId] = topicTitle;
//       //   tempTopics[topicId] ??= [];
//       //   tempTopics[topicId]!.add({'id': doc.id, ...data});
//       // }
//       for (var doc in querySnap.docs) {
//   final data = doc.data();
  
//   final topicId = data['topicId'] ?? 'unknown';
//   final topicTitle = data['topicTitle'] ?? data['title'] ?? 'Untitled Topic';
//   tempTitles[topicId] = topicTitle;
//   tempTopics[topicId] ??= [];
//   tempTopics[topicId]!.add({'id': doc.id, ...data});
// }

      

//       setState(() {
//         topicsMap = tempTopics;
//         topicTitles = tempTitles;
//         loading = false;
//       });

//       _generatePages();
//     } catch (e) {
      
//       setState(() => loading = false);
//     }
//   }

//   void _generatePages() {
    
//     _allPages = ["Table of Contents"];
//     int totalPages = 1;

//     topicsMap.forEach((topicId, notes) {
//       for (var note in notes) {
//         final content = note['content'] ?? '';
//         const maxCharsPerPage = 600;
//         int start = 0;

//         while (start < content.length) {
//           int end = math.min(start + maxCharsPerPage, content.length);
//           String pageChunk = content.substring(start, end);
//           int lastLineBreak = pageChunk.lastIndexOf('\n');
//           if (lastLineBreak != -1 && end != content.length) {
//             end = start + lastLineBreak + 1;
//           }
//           _allPages.add(content.substring(start, end));
//           totalPages++;
//           start = end;
//         }
//       }
//     });

    
//   }

//   void _goNext() {
//     if (_currentPage < _allPages.length - 1) {
      
//       _controller.currentState?.nextPage();
//       setState(() => _currentPage++);
//     }
//   }

//   void _goPrevious() {
//     if (_currentPage > 0) {
      
//       _controller.currentState?.previousPage();
//       setState(() => _currentPage--);
//     }
//   }

//   // void _jumpToPage(int pageIndex) {
//   //   
//   //   if (pageIndex >= 0 && pageIndex < _allPages.length) {
//   //     setState(() => _currentPage = pageIndex);
//   //   }
//   // }
//   void _jumpToPage(int pageIndex) async {
//   if (pageIndex < 0 || pageIndex >= _allPages.length) return;

//   while (_currentPage < pageIndex) {
//     _controller.currentState?.nextPage();
//     setState(() => _currentPage++);
//     await Future.delayed(const Duration(milliseconds: 100));
//   }

//   while (_currentPage > pageIndex) {
//     _controller.currentState?.previousPage();
//     setState(() => _currentPage--);
//     await Future.delayed(const Duration(milliseconds: 100));
//   }
// }


//   @override
//   Widget build(BuildContext context) {
//     if (loading) {
//       return const Scaffold(body: Center(child: CircularProgressIndicator()));
//     }

    

//     return Scaffold(
//       appBar: AppBar(
//         title: const Text("Course Notes"),
//         backgroundColor: Colors.orangeAccent,
//       ),
//       body: Column(
//         children: [
//           if (studentCourses.isNotEmpty)
//             Padding(
//               padding: const EdgeInsets.all(12),
//               child: DropdownButtonFormField<String>(
//                 initialValue: selectedCourseId,
//                 decoration: InputDecoration(
//                   labelText: "Select Course",
//                   border: OutlineInputBorder(
//                     borderRadius: BorderRadius.circular(8),
//                   ),
//                 ),
//                 items: studentCourses
//                     .map((course) => DropdownMenuItem<String>(
//                           value: course['id'],
//                           child: Text(course['title'] ?? 'Untitled Course'),
//                         ))
//                     .toList(),
//                 onChanged: (value) async {
                  
//                   setState(() => selectedCourseId = value);
//                   await fetchNotes();
//                 },
//               ),
//             ),
//           const SizedBox(height: 8),
//           Expanded(
//             child: topicsMap.isEmpty
//                 ? const Center(child: Text("No notes found for this course."))
//                 : _buildFlipBook(),
//           ),
//         ],
//       ),
//     );
//   }

//   Widget _buildFlipBook() {
//     final pages = _allPages.map<Widget>((story) {
//       return story == "Table of Contents"
//           ? _buildTOCPage()
//           : _buildLessonPage(story);
//     }).toList();

//     return Center(
//       child: Stack(
//         children: [
//           Container(
//             margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
//             decoration: BoxDecoration(
//               color: Colors.brown.shade700,
//               borderRadius: BorderRadius.circular(6),
//               boxShadow: [
//                 BoxShadow(
//                   color: Colors.black.withOpacity(0.4),
//                   blurRadius: 8,
//                   offset: const Offset(4, 4),
//                 ),
//               ],
//             ),
//             child: ClipRRect(
//               borderRadius: BorderRadius.circular(6),
//               child: SizedBox(
//                 width: 350,
//                 height: 500,
//                 child: PageFlipWidget(
//                   key: _controller,
//                   backgroundColor: Colors.brown.shade700,
//                   children: pages,
//                 ),
//               ),
//             ),
//           ),
//           Positioned(
//             left: 0,
//             top: 0,
//             bottom: 0,
//             child: GestureDetector(
//               onTap: _goPrevious,
//               child: AnimatedOpacity(
//                 duration: const Duration(milliseconds: 300),
//                 opacity: _currentPage > 0 ? 1 : 0.3,
//                 child: const Icon(Icons.arrow_back_ios,
//                     size: 20, color: Colors.blueGrey),
//               ),
//             ),
//           ),
//           Positioned(
//             right: 0,
//             top: 0,
//             bottom: 0,
//             child: GestureDetector(
//               onTap: _goNext,
//               child: AnimatedOpacity(
//                 duration: const Duration(milliseconds: 300),
//                 opacity: _currentPage < _allPages.length - 1 ? 1 : 0.3,
//                 child: const Icon(Icons.arrow_forward_ios,
//                     size: 20, color: Colors.blueGrey),
//               ),
//             ),
//           ),
//           Positioned(
//             right: 16,
//             bottom: 16,
//             child: FloatingActionButton(
//               mini: true,
//               backgroundColor: Colors.orangeAccent,
//               onPressed: _showTOCModal,
//               child: const Icon(Icons.list),
//             ),
//           ),
//         ],
//       ),
//     );
//   }

//   void _showTOCModal() {
    
//     showModalBottomSheet(
//       context: context,
//       builder: (context) {
//         final topicIds = topicsMap.keys.toList();
//         return Container(
//           padding: const EdgeInsets.all(16),
//           color: widget.darkMode ? Colors.grey[900] : Colors.white,
//           child: Column(
//             crossAxisAlignment: CrossAxisAlignment.start,
//             children: [
//               const Text("Table of Contents",
//                   style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
//               const SizedBox(height: 16),
//               Expanded(
//                 child: ListView.builder(
//                   itemCount: topicIds.length,
//                   itemBuilder: (context, index) {
//                     final topicId = topicIds[index];
//                     final title = topicTitles[topicId] ?? 'Untitled Topic';
//                     return Card(
//                       color:
//                           widget.darkMode ? Colors.blueGrey : Colors.blue[100],
//                       child: ListTile(
//                         title: Text(title,
//                             style: TextStyle(
//                                 color: widget.darkMode
//                                     ? Colors.white
//                                     : Colors.black,
//                                 fontWeight: FontWeight.bold)),
//                         trailing: const Icon(Icons.arrow_forward),
//                         onTap: () {
                          
//                           int pageIndex = 1; // skip TOC page
//                           for (int i = 0; i < index; i++) {
//                             final notes = topicsMap[topicIds[i]] ?? [];
//                             for (var note in notes) {
//                               final len = note['content']?.length ?? 0;
//                               pageIndex += (len / 600).ceil() as int;
//                             }
//                           }
//                           Navigator.pop(context);
//                           _jumpToPage(pageIndex);
//                         },
//                       ),
//                     );
//                   },
//                 ),
//               ),
//             ],
//           ),
//         );
//       },
//     );
//   }

//   Widget _buildLessonPage(String content) {
//     return Container(
//       padding: const EdgeInsets.all(16),
//       color: widget.darkMode ? Colors.grey[900] : Colors.white,
//       child: MarkdownBody(
//         data: content,
//         selectable: true,
//         styleSheet: MarkdownStyleSheet(
//           p: TextStyle(
//               fontSize: 16,
//               color: widget.darkMode ? Colors.white : Colors.black87),
//           h1: TextStyle(
//               fontSize: 24,
//               fontWeight: FontWeight.bold,
//               color: widget.darkMode ? Colors.white : Colors.black87),
//           h2: TextStyle(
//               fontSize: 22,
//               fontWeight: FontWeight.bold,
//               color: widget.darkMode ? Colors.white : Colors.black87),
//           code: const TextStyle(
//               fontFamily: 'monospace', fontSize: 14, color: Colors.blueGrey),
//         ),
//         onTapLink: (text, href, title) async {
//           if (href != null && await canLaunchUrl(Uri.parse(href))) {
//             await launchUrl(Uri.parse(href),
//                 mode: LaunchMode.externalApplication);
//           }
//         },
//         builders: {'code': CodeBlockBuilder()},
//       ),
//     );
//   }

//   Widget _buildTOCPage() {
//     return Container(
//       padding: const EdgeInsets.all(16),
//       color: widget.darkMode ? Colors.grey[900] : Colors.white,
//       child: const Center(
//         child: Text(
//           "Table of Contents",
//           style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
//         ),
//       ),
//     );
//   }
// }

// // class CodeBlockBuilder extends MarkdownElementBuilder {
// //   final bool darkMode;
// //   CodeBlockBuilder(this.darkMode);

// //   @override
// //   Widget? visitElementAfter(md.Element element, TextStyle? preferredStyle) {
// //     final language =
// //         element.attributes['class']?.replaceFirst('language-', '') ?? 'dart';
// //     final code = element.textContent;
// //     return Container(
// //       width: double.infinity,
// //       margin: const EdgeInsets.symmetric(vertical: 8),
// //       // ✅ Added background + rounded corners
// //   // decoration: BoxDecoration(
// //   //   color: darkMode ? const Color(0xFF282C34) : const Color(0xFFF6F8FA),
// //   //   borderRadius: BorderRadius.circular(6),
// //   // ),
// //       child: HighlightView(
// //         code,
// //         language: language,
// //         theme: darkMode ? atomOneDarkTheme : githubTheme,
// //         padding: const EdgeInsets.all(12),
// //         textStyle: const TextStyle(fontFamily: 'monospace', fontSize: 14),
// //       ),
// //     );
// //   }
// // }
// class CodeBlockBuilder extends MarkdownElementBuilder {
//   @override
//   Widget? visitElementAfter(md.Element element, TextStyle? preferredStyle) {
//     final language =
//         element.attributes['class']?.replaceFirst('language-', '') ?? 'dart';
//     final code = element.textContent;

//     return Container(
//       width: double.infinity,
//       margin: const EdgeInsets.symmetric(vertical: 8),
//       decoration: BoxDecoration(
//         color: Colors.black, // Always black
//         borderRadius: BorderRadius.circular(8),
//       ),
//       child: HighlightView(
//         code,
//         language: language,
//         theme: atomOneDarkTheme, // Always dark syntax colors
//         padding: const EdgeInsets.all(12),
//         textStyle: const TextStyle(
//           fontFamily: 'monospace',
//           fontSize: 14,
//           color: Colors.white,
//         ),
//       ),
//     );
//   }
// }

