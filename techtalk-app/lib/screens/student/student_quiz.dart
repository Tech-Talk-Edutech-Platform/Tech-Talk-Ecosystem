import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:confetti/confetti.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:techtalk/constants/app_theme.dart';

class StudentQuizScreen extends StatefulWidget {
  final List<String>? courseIds;

  const StudentQuizScreen({super.key, this.courseIds});

  @override
  State<StudentQuizScreen> createState() => _StudentQuizScreenState();
}

class _StudentQuizScreenState extends State<StudentQuizScreen> {
  List<String> _courseIds = [];
  List<String> _teacherIds = [];

  List<QueryDocumentSnapshot> _topics = [];
  List<QueryDocumentSnapshot> _quizzes = [];

  String? _selectedTopicId;
  int _currentIndex = 0;

  final Map<String, List<int?>> _selectedAnswers = {};
  final Map<String, bool> _submitted = {};
  final Set<String> _completedQuizIds = {};
  final Map<String, Set<String>> _topicProgress = {};

  bool _loading = true;

  late ConfettiController _confetti;

  final _user = FirebaseAuth.instance.currentUser;
  late final DocumentReference _userRef = FirebaseFirestore.instance
      .collection('users')
      .doc(_user!.uid);

  @override
  void initState() {
    super.initState();
    _confetti = ConfettiController(duration: const Duration(seconds: 3));
    _loadData();
  }

  @override
  void dispose() {
    _confetti.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final doc = await _userRef.get();
      final data = doc.data() as Map<String, dynamic>? ?? {};

      _courseIds = List<String>.from(data['courseIds'] ?? []);
      _teacherIds = List<String>.from(data['teacherIds'] ?? []);
      _completedQuizIds.addAll(
        List<String>.from(data['completedQuizIds'] ?? []),
      );

      await _fetchTopics();
    } catch (_) {
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _fetchTopics() async {
    if (_courseIds.isEmpty) return;

    final snap = await FirebaseFirestore.instance
        .collection('topics')
        .where('courseId', whereIn: _courseIds)
        .get();

    setState(() => _topics = snap.docs);
  }

  Future<void> _fetchQuizzes(String topicId) async {
    final created = await FirebaseFirestore.instance
        .collection('quizzes')
        .where('topicId', isEqualTo: topicId)
        .where(
          'createdBy',
          whereIn: _teacherIds.isEmpty ? ['none'] : _teacherIds,
        )
        .get();

    final reused = await FirebaseFirestore.instance
        .collection('quizzes')
        .where('topicId', isEqualTo: topicId)
        .where(
          'reusedBy',
          arrayContainsAny: _teacherIds.isEmpty ? ['none'] : _teacherIds,
        )
        .get();

    final Map<String, QueryDocumentSnapshot> merged = {};

    for (final q in [...created.docs, ...reused.docs]) {
      merged[q.id] = q;
    }

    setState(() {
      _quizzes = merged.values.toList();
      _selectedTopicId = topicId;
      _currentIndex = 0;
      _selectedAnswers.clear();
    });
  }

  void _select(String quizId, int qIndex, int option) {
    final quiz = _quizzes.firstWhere((q) => q.id == quizId);
    final len = (quiz['questions'] as List).length;

    _selectedAnswers.putIfAbsent(quizId, () => List<int?>.filled(len, null));

    _selectedAnswers[quizId]![qIndex] = option;

    setState(() {});
  }

  Future<void> _submit(String quizId, Map data) async {
    if (_submitted[quizId] == true || _completedQuizIds.contains(quizId))
      return;

    final answers = _selectedAnswers[quizId];
    if (answers == null || answers.contains(null)) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Answer all questions")));
      return;
    }

    _submitted[quizId] = true;
    _completedQuizIds.add(quizId);

    await _userRef.set({
      'completedQuizIds': _completedQuizIds.toList(),
    }, SetOptions(merge: true));

    final topicId = _selectedTopicId!;
    _topicProgress.putIfAbsent(topicId, () => {});
    _topicProgress[topicId]!.add(quizId);

    final allDone = _quizzes.every(
      (q) => _topicProgress[topicId]!.contains(q.id),
    );

    if (allDone) {
      _confetti.play();
    }

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_selectedTopicId == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text("Topics"),
          backgroundColor: AppTheme.primaryColor,
        ),
        body: ListView(
          children: _topics.map((t) {
            return ListTile(
              title: Text(t['title'] ?? ''),
              onTap: () => _fetchQuizzes(t.id),
            );
          }).toList(),
        ),
      );
    }

    if (_quizzes.isEmpty) {
      return const Scaffold(body: Center(child: Text("No quizzes")));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text("Quizzes"),
        backgroundColor: AppTheme.primaryColor,
      ),
      body: ListView.builder(
        itemCount: _quizzes.length,
        itemBuilder: (c, i) {
          final quiz = _quizzes[i];
          final data = quiz.data() as Map;

          final questions = List<Map>.from(data['questions'] ?? []);
          final submitted = _submitted[quiz.id] ?? false;

          return Card(
            margin: const EdgeInsets.all(10),
            child: ExpansionTile(
              title: Text(data['title'] ?? ''),
              children: [
                ...questions.asMap().entries.map((e) {
                  final qIndex = e.key;
                  final q = e.value;

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(q['q']),
                      ...List.generate((q['options'] as List).length, (o) {
                        return RadioListTile(
                          value: o,
                          groupValue: _selectedAnswers[quiz.id]?[qIndex],
                          onChanged: submitted
                              ? null
                              : (v) => _select(quiz.id, qIndex, v as int),
                          title: Text(q['options'][o]),
                        );
                      }),
                    ],
                  );
                }),

                ElevatedButton(
                  onPressed: submitted ? null : () => _submit(quiz.id, data),
                  child: Text(submitted ? "Done" : "Submit"),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
// // unused scores/percentages
// import 'package:flutter/material.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:confetti/confetti.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:techtalk/constants/app_theme.dart';

// class StudentQuizScreen extends StatefulWidget {
//   final List<String>? courseIds;
//   const StudentQuizScreen({super.key, this.courseIds});

//   @override
//   State<StudentQuizScreen> createState() => _StudentQuizScreenState();
// }

// class _StudentQuizScreenState extends State<StudentQuizScreen> {
//   List<String> _studentCourseIds = [];
//   List<String> _studentTeacherIds = [];
//   List<QueryDocumentSnapshot> _topics = [];
//   List<QueryDocumentSnapshot> _quizzes = [];
//   int _currentIndex = 0;
//   final Map<String, List<int?>> _selectedAnswers = {}; // quizId -> answers
//   final Map<String, bool> _submitted = {}; // quizId -> submitted
//   final Map<String, Set<String>> _completedTopicQuizzes = {}; // topicId -> completed quizIds
//   String? _selectedTopicId;
//   bool _loadingTopics = true;
//   bool _loadingCourses = true;
//   late ConfettiController _confettiController;
//   List<String> _completedQuizIds = [];


//   final int xpPerTopic = 50;
//   final int xpPerLevel = 100;

//   User? _currentUser;
//   late DocumentReference _progressRef;
//   Map<String, dynamic> _progressData = {};

//   @override
//   void initState() {
//     super.initState();
//     _confettiController = ConfettiController(duration: const Duration(seconds: 3));
//     _currentUser = FirebaseAuth.instance.currentUser;
//     if (_currentUser != null) {
//       _progressRef = FirebaseFirestore.instance.collection('users').doc(_currentUser!.uid);
//       _listenToProgress();
//     }
//     // _loadCourses();
//      _loadCourses().then((_) {
//   if (_studentTeacherIds.isNotEmpty) _fetchTopics();
// });

//   }

//   void _listenToProgress() {
//     _progressRef.snapshots().listen((snapshot) {
//       if (snapshot.exists) {
//         setState(() {
//           _progressData = (snapshot.data() as Map<String, dynamic>)['progress'] ?? {};
//         });
//       }
//     });
//   }

//   Future<void> _loadCourses() async {
//     try {
//       if (widget.courseIds != null && widget.courseIds!.isNotEmpty) {
//         _studentCourseIds = widget.courseIds!;
//       } else if (_currentUser != null) {
//         final userDoc = await _progressRef.get();
//         if (userDoc.exists) {
//           final userData = userDoc.data() as Map<String, dynamic>;
//           _studentCourseIds = List<String>.from(userData['courseIds'] ?? []);
//           _studentTeacherIds = List<String>.from(userData['teacherIds'] ?? []);
//           _completedQuizIds = List<String>.from(userData['completedQuizIds'] ?? []); 
//         }
//       }
//       await _fetchTopics();
//     } catch (e) {
//       e;   
//     } finally {
//       setState(() => _loadingCourses = false);
//     }
//   }

//   @override
//   void dispose() {
//     _confettiController.dispose();
//     super.dispose();
//   }

//   Future<void> _fetchTopics() async {
//     if (_studentCourseIds.isEmpty) {
//       setState(() => _loadingTopics = false);
//       return;
//     }
//     try {
//       final snapshot = await FirebaseFirestore.instance
//           .collection('topics')
//           .where('courseId', whereIn: _studentCourseIds)
//           .orderBy('order', descending: false)
//           .get();
//       setState(() {
//         _topics = snapshot.docs;
//         _loadingTopics = false;
//       });
//     } catch (e) {
//       setState(() => _loadingTopics = false);
//     }
//   }

// //   Future<void> _fetchQuizzes(String topicId) async {
// //     try {
// //       // 🔹 Quizzes created by assigned teachers
// //       final createdByTeachersSnap = await FirebaseFirestore.instance
// //           .collection('quizzes')
// //           .where('topicId', isEqualTo: topicId)
// //           .where('createdBy', whereIn: _studentTeacherIds.isEmpty ? ['none'] : _studentTeacherIds)
// //           .orderBy('createdAt', descending: false)
// //           .get();

// //       // 🔹 Reused quizzes for the student's courses
// //       final reusedSnap = await FirebaseFirestore.instance
// //           .collection('quizzes')
// //           .where('topicId', isEqualTo: topicId)
// //           //.where('reused', isEqualTo: true)
// //           //.where('courseId', whereIn: _studentCourseIds.isEmpty ? ['none'] : _studentCourseIds)
// //           .where('reusedBy', arrayContainsAny: _studentTeacherIds.isEmpty ? ['none'] : _studentTeacherIds)
// //           .where('courseId', whereIn: _studentCourseIds.isEmpty ? ['none'] : _studentCourseIds)
// //           .orderBy('createdAt', descending: false)
// //           .get();

// //           await FirebaseFirestore.instance.collection('quizzes').doc(quizId).update({
// //   'reusedBy': FieldValue.arrayUnion([_studentTeacherIds]),
// // });

// //       // Merge quizzes and remove duplicates
// //       final mergedQuizzesMap = <String, QueryDocumentSnapshot>{};
// //       for (var doc in [...createdByTeachersSnap.docs, ...reusedSnap.docs]) {
// //         mergedQuizzesMap[doc.id] = doc;
// //       }

// //       setState(() {
// //         _quizzes = mergedQuizzesMap.values.toList();
// //         _selectedTopicId = topicId;
// //         _currentIndex = 0;
// //         _selectedAnswers.clear();
// //       });
// //     } catch (e) {
// //       
// //     }
// //   }
// Future<void> _fetchQuizzes(String topicId) async {
//   try {
//     final createdByTeachersSnap = await FirebaseFirestore.instance
//         .collection('quizzes')
//         .where('topicId', isEqualTo: topicId)
//         .where('createdBy', whereIn: _studentTeacherIds.isEmpty ? ['none'] : _studentTeacherIds)
//         .orderBy('createdAt', descending: false)
//         .get();

//     final reusedSnap = await FirebaseFirestore.instance
//         .collection('quizzes')
//         .where('topicId', isEqualTo: topicId)
//         .where('reusedBy', arrayContainsAny: _studentTeacherIds.isEmpty ? ['none'] : _studentTeacherIds)
//         .where('courseId', whereIn: _studentCourseIds.isEmpty ? ['none'] : _studentCourseIds)
//         .orderBy('createdAt', descending: false)
//         .get();

//     final mergedQuizzesMap = <String, QueryDocumentSnapshot>{};
//     for (var doc in [...createdByTeachersSnap.docs, ...reusedSnap.docs]) {
//       mergedQuizzesMap[doc.id] = doc;
//     }

//     setState(() {
//       _quizzes = mergedQuizzesMap.values.toList();
//       _selectedTopicId = topicId;
//       _currentIndex = 0;
//       _selectedAnswers.clear();
//     });
//   } catch (e) {
//     e;
//   }
// }

//   void _selectOption(String quizId, int questionIndex, int selectedOption) {
//     final answers = _selectedAnswers[quizId] ??
//         List.filled(
//             (_quizzes.firstWhere((q) => q.id == quizId).data() as Map<String, dynamic>)['questions'].length,
//             null);

//     answers[questionIndex] = selectedOption;
//     setState(() => _selectedAnswers[quizId] = answers);
//   }

//   int _calculateLevel(int totalXp) => (totalXp / xpPerLevel).floor() + 1;

//   String _generateBadge(String topicTitle) {
//     final words = topicTitle
//         .split(' ')
//         .where((w) => !["and", "of", "the", "for"].contains(w.toLowerCase()))
//         .toList();
//     final keyword = words.isNotEmpty ? words[0] : "Topic";
//     final emojis = ["🏅", "🎯", "🚀", "🌟", "🧠"];
//     final emoji = (emojis..shuffle()).first;
//     return "$emoji $keyword Master";
//   }

//   Future<void> _updateProgress(String topicId, String topicTitle) async {
//     if (_currentUser == null) return;
//     try {
//       final userDoc = await _progressRef.get();
//       if (!userDoc.exists) return;

//       final data = userDoc.data() as Map<String, dynamic>? ?? {};
//       Map<String, dynamic> progress = Map<String, dynamic>.from(data['progress'] ?? {});

//       if (progress.isEmpty) {
//         progress = {
//           'totalXp': 0,
//           'level': 1,
//           'badges': [],
//           'completedTopics': [],
//           'completedCourses': [],
//           'certificates': [],
//           'lastUpdated': FieldValue.serverTimestamp(),
//         };
//       }

//       int newXp = (progress['totalXp'] ?? 0) + xpPerTopic;
//       int newLevel = _calculateLevel(newXp);

//       List<dynamic> badges = List.from(progress['badges'] ?? []);
//       final newBadge = _generateBadge(topicTitle);
//       if (!badges.contains(newBadge)) badges.add(newBadge);

//       List<dynamic> completedTopics = List.from(progress['completedTopics'] ?? []);
//       if (!completedTopics.contains(topicId)) completedTopics.add(topicId);

//       List<dynamic> completedCourses = List.from(progress['completedCourses'] ?? []);
//       List<dynamic> certificates = List.from(progress['certificates'] ?? []);

//       for (var courseId in _studentCourseIds) {
//         final courseTopics =
//             _topics.where((t) => t['courseId'] == courseId).map((t) => t.id).toList();
//         bool allDone = courseTopics.every((t) => completedTopics.contains(t));
//         if (allDone && !completedCourses.contains(courseId)) {
//           final courseDoc = await FirebaseFirestore.instance
//               .collection('courses')
//               .doc(courseId)
//               .get();
//           final courseTitle =
//               courseDoc.exists ? (courseDoc.data()?['title'] ?? 'Course') : 'Course';

//           completedCourses.add(courseId);
//           if (!certificates.any((c) => c['courseId'] == courseId)) {
//             certificates.add({
//               'courseId': courseId,
//               'issuedAt': FieldValue.serverTimestamp(),
//               'title': '$courseTitle Completion Certificate',
//             });
//           }
//         }
//       }

//       await _progressRef.set({
//         'progress': {
//           'totalXp': newXp,
//           'level': newLevel,
//           'badges': badges,
//           'completedTopics': completedTopics,
//           'completedCourses': completedCourses,
//           'certificates': certificates,
//           'lastUpdated': FieldValue.serverTimestamp(),
//         }
//       }, SetOptions(merge: true));

//       _showCompletionPopup(newXp, newLevel, [newBadge]);
//     } catch (e) {
//       e;
//     }
//   }

//   // Future<void> _submitQuiz(String quizId, Map<String, dynamic> quizData) async {

//   // // ✅ Prevent resubmission
//   // if (_submitted[quizId] == true) return;

//   // setState(() => _submitted[quizId] = true);

//   //   final answers = _selectedAnswers[quizId];
//   //   if (answers == null || answers.contains(null)) {
//   //     ScaffoldMessenger.of(context).showSnackBar(
//   //       const SnackBar(content: Text("Please answer all questions first")),
//   //     );
//   //     return;
//   //   }

//   //   setState(() => _submitted[quizId] = true);

//   //   // Track completed quizzes for the topic
//   //   final topicId = _selectedTopicId!;
//   //   _completedTopicQuizzes[topicId] ??= {};
//   //   _completedTopicQuizzes[topicId]!.add(quizId);

//   //   // Check if all quizzes in this topic are completed
//   //   final topicQuizIds = _quizzes.map((q) => q.id).toList();
//   //   final allCompleted = topicQuizIds.every((id) => _completedTopicQuizzes[topicId]!.contains(id));

//   //   if (allCompleted) {
//   //     final topicTitle = _topics.firstWhere((t) => t.id == topicId)['title'] ?? "Topic";
//   //     await _updateProgress(topicId, topicTitle); // Give XP, badges, certificates per topic
//   //   }

//   //   // Move to next quiz or topic
//   //   if (_currentIndex < _quizzes.length - 1) {
//   //     setState(() => _currentIndex++);
//   //   } else {
//   //     setState(() => _selectedTopicId = null);
//   //   }
//   // }
// Future<void> _submitQuiz(String quizId, Map<String, dynamic> quizData) async {
//   // ✅ Prevent resubmission — both in memory and persisted data
//   if (_submitted[quizId] == true || _completedQuizIds.contains(quizId)) return;

//   final answers = _selectedAnswers[quizId];
//   if (answers == null || answers.contains(null)) {
//     ScaffoldMessenger.of(context).showSnackBar(
//       const SnackBar(content: Text("Please answer all questions first")),
//     );
//     return;
//   }

//   // ✅ Mark as submitted immediately (UI)
//   setState(() => _submitted[quizId] = true);

//   // ✅ Save permanently in Firestore
//   _completedQuizIds.add(quizId);
//   await _progressRef.set({
//     'completedQuizIds': _completedQuizIds,
//   }, SetOptions(merge: true));

//   // 🧩 Track completed quizzes for the topic
//   final topicId = _selectedTopicId!;
//   _completedTopicQuizzes[topicId] ??= {};
//   _completedTopicQuizzes[topicId]!.add(quizId);

//   // 🎯 Check if all quizzes in this topic are done
//   final topicQuizIds = _quizzes.map((q) => q.id).toList();
//   final allCompleted = topicQuizIds.every((id) => _completedTopicQuizzes[topicId]!.contains(id));

//   if (allCompleted) {
//     final topicTitle = _topics.firstWhere((t) => t.id == topicId)['title'] ?? "Topic";
//     await _updateProgress(topicId, topicTitle);
//   }

//   // 🔄 Move to next quiz or topic
//   if (_currentIndex < _quizzes.length - 1) {
//     setState(() => _currentIndex++);
//   } else {
//     setState(() => _selectedTopicId = null);
//   }
// }

//   void _showCompletionPopup(int totalXp, int level, List<String> badges) {
//     _confettiController.play();
//     showDialog(
//       context: context,
//       barrierDismissible: false,
//       builder: (context) => Dialog(
//         shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
//         child: Stack(
//           alignment: Alignment.center,
//           children: [
//             ConfettiWidget(
//               confettiController: _confettiController,
//               blastDirectionality: BlastDirectionality.explosive,
//               numberOfParticles: 20,
//               gravity: 0.3,
//               shouldLoop: true,
//               colors: const [
//                 Colors.orange,
//                 Colors.pink,
//                 Colors.yellow,
//                 Colors.lightBlue,
//                 Colors.green,
//               ],
//             ),
//             Padding(
//               padding: const EdgeInsets.all(24),
//               child: Column(
//                 mainAxisSize: MainAxisSize.min,
//                 children: [
//                   const Text('🎉', style: TextStyle(fontSize: 72)),
//                   const SizedBox(height: 16),
//                   const Text("Congratulations!",
//                       style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
//                   const SizedBox(height: 8),
//                   Text("You’ve earned $xpPerTopic XP\nLevel: $level",
//                       textAlign: TextAlign.center),
//                   const SizedBox(height: 12),
//                   if (badges.isNotEmpty)
//                     Column(
//                       children: badges
//                           .map((b) => Padding(
//                                 padding: const EdgeInsets.symmetric(vertical: 4),
//                                 child: Text(b, style: const TextStyle(fontSize: 16)),
//                               ))
//                           .toList(),
//                     ),
//                   const SizedBox(height: 16),
//                   ElevatedButton(
//                     onPressed: () {
//                       _confettiController.stop();
//                       Navigator.pop(context);
//                     },
//                     style: ElevatedButton.styleFrom(
//                         backgroundColor: Colors.orangeAccent,
//                         shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
//                     child: const Text("Awesome!", style: TextStyle(fontWeight: FontWeight.bold)),
//                   ),
//                 ],
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }

//   @override
//   Widget build(BuildContext context) {
//     if (_loadingCourses || _loadingTopics) {
//       return const Scaffold(body: Center(child: CircularProgressIndicator()));
//     }

//     if (_topics.isEmpty) {
//       return const Scaffold(
//         body: Center(child: Text("No topics found for your assigned courses.")),
//       );
//     }

//     if (_selectedTopicId == null) {
//       return Scaffold(
//         appBar: AppBar(title: const Text("Select a Topic"), backgroundColor: AppTheme.primaryColor),
//         body: ListView.builder(
//           padding: const EdgeInsets.all(16),
//           itemCount: _topics.length,
//           itemBuilder: (context, index) {
//             final topic = _topics[index];
//             final topicName = topic['title'] ?? 'Unknown Topic';
//             return ListTile(
//               title: Text(topicName),
//               trailing: const Icon(Icons.chevron_right),
//               onTap: () => _fetchQuizzes(topic.id),
//             );
//           },
//         ),
//       );
//     }

//     if (_quizzes.isEmpty) {
//       return Scaffold(
//         appBar: AppBar(title: const Text("Student Quizzes"), backgroundColor: AppTheme.primaryColor),
//         body: const Center(child: Text("🕒 No quizzes available for this topic.")),
//       );
//     }

//     final completed = _submitted.length;
//     final total = _quizzes.length;
//     final progress = total == 0 ? 0.0 : completed / total;

//     return Scaffold(
//       appBar: AppBar(title: const Text("Student Quizzes"), backgroundColor: AppTheme.primaryColor),
//       body: Column(
//         children: [
//           Padding(
//             padding: const EdgeInsets.all(12),
//             child: LinearProgressIndicator(
//               value: progress,
//               backgroundColor: Colors.grey.shade300,
//               color: AppTheme.primaryColor,
//               minHeight: 8,
//               borderRadius: BorderRadius.circular(10),
//             ),
//           ),
//           Expanded(
//             child: ListView.builder(
//               padding: const EdgeInsets.all(16),
//               itemCount: _quizzes.length,
//               itemBuilder: (context, quizIndex) {
//                 final quiz = _quizzes[quizIndex];
//                 final data = quiz.data() as Map<String, dynamic>;
//                 final questions = List<Map<String, dynamic>>.from(data['questions'] ?? []);
//                 final quizId = quiz.id;
//                 final locked = quizIndex > 0 && !(_submitted[_quizzes[quizIndex - 1].id] ?? false);

//                 return Card(
//                   elevation: 3,
//                   margin: const EdgeInsets.symmetric(vertical: 10),
//                   shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
//                   child: Padding(
//                     padding: const EdgeInsets.all(12),
//                     child: ExpansionTile(
//                       initiallyExpanded: quizIndex == _currentIndex,
//                       title: Row(
//                         mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                         children: [
//                           Expanded(
//                             child: Text(data['title'] ?? 'Quiz ${quizIndex + 1}',
//                                 style: const TextStyle(fontWeight: FontWeight.bold)),
//                           ),
//                           if (locked) const Icon(Icons.lock, color: Colors.grey),
//                         ],
//                       ),
//                       onExpansionChanged: (expanded) {
//                         if (locked && expanded) {
//                           ScaffoldMessenger.of(context).showSnackBar(
//                             const SnackBar(content: Text("Complete the previous quiz first.")),
//                           );
//                         }
//                       },
//                       children: locked
//                           ? []
//                           : questions.asMap().entries.map((entry) {
//                               final qIndex = entry.key;
//                               final question = entry.value;
//                               final selected = _selectedAnswers[quizId]?[qIndex];
//                               final submitted = _submitted[quizId] ?? false;
//                               final correctIndex = question['correctIndex'];
//                               final options = List<String>.from(question['options'] ?? []);
//                               final userCorrect = submitted && selected == correctIndex;

//                               return Padding(
//                                 padding: const EdgeInsets.all(8),
//                                 child: Column(
//                                   crossAxisAlignment: CrossAxisAlignment.start,
//                                   children: [
//                                     Text(question['q'] ?? '',
//                                         style: const TextStyle(
//                                             fontWeight: FontWeight.bold, fontSize: 16)),
//                                     const SizedBox(height: 10),
//                                     ...List.generate(options.length, (oIndex) {
//                                       final optionText = options[oIndex];
//                                       final isCorrect = oIndex == correctIndex;
//                                       final isSelected = selected == oIndex;

//                                       return GestureDetector(
//                                         onTap: () => _selectOption(quizId, qIndex, oIndex),
//                                         child: Container(
//                                           margin: const EdgeInsets.symmetric(
//                                               vertical: 6, horizontal: 8),
//                                           padding: const EdgeInsets.all(12),
//                                           decoration: BoxDecoration(
//                                             color: isSelected
//                                                 ? (submitted
//                                                     ? (isCorrect
//                                                         ? Colors.green[100]
//                                                         : Colors.red[100])
//                                                     : Colors.blue[50])
//                                                 : Colors.white,
//                                             borderRadius: BorderRadius.circular(10),
//                                             border: Border.all(
//                                               color: isSelected
//                                                   ? (submitted
//                                                       ? (isCorrect
//                                                           ? Colors.green
//                                                           : Colors.red)
//                                                       : Colors.blue)
//                                                   : Colors.grey.shade300,
//                                             ),
//                                           ),
//                                           child: Row(
//                                             children: [
//                                               Expanded(
//                                                   child: Text(optionText,
//                                                       style: TextStyle(
//                                                           color: submitted &&
//                                                                   isSelected &&
//                                                                   !isCorrect
//                                                               ? Colors.red
//                                                               : Colors.black))),
//                                               if (submitted && isSelected)
//                                                 Icon(
//                                                   isCorrect
//                                                       ? Icons.check_circle
//                                                       : Icons.cancel,
//                                                   color: isCorrect
//                                                       ? Colors.green
//                                                       : Colors.red,
//                                                 ),
//                                             ],
//                                           ),
//                                         ),
//                                       );
//                                     }),
//                                     if (submitted && !userCorrect)
//                                       Padding(
//                                         padding: const EdgeInsets.only(
//                                             top: 6, left: 8, bottom: 4),
//                                         child: Text(
//                                           "❌ Incorrect. ✅ Correct answer: ${options[correctIndex]}",
//                                           style: const TextStyle(fontSize: 13, color: Colors.grey),
//                                         ),
//                                       ),
//                                     const SizedBox(height: 8),
//                                     ElevatedButton(
//                                       // onPressed: submitted
//                                       //     ? null
//                                       //     : () => _submitQuiz(quizId, data),
//                                       onPressed: (submitted || _completedQuizIds.contains(quizId))
//     ? null
//     : () => _submitQuiz(quizId, data),

//                                       style: ElevatedButton.styleFrom(
//                                         backgroundColor: AppTheme.primaryColor,
//                                         shape: RoundedRectangleBorder(
//                                             borderRadius: BorderRadius.circular(8)),
//                                       ),
//                                       child:
//                                           // Text(submitted ? "Submitted" : "Submit"),
//                                           Text(submitted ?"Submitted" : "Submit Quiz"),
//                                     ),
//                                   ],
//                                 ),
//                               );
//                             }).toList(),
//                     ),
//                   ),
//                 );
//               },
//             ),
//           ),
//         ],
//       ),
//     );
//   }
// }
