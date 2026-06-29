import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:techtalk/constants/app_theme.dart';

class QuizUploadScreen extends StatefulWidget {
  final String teacherId;

  const QuizUploadScreen({super.key, required this.teacherId});

  @override
  State<QuizUploadScreen> createState() => _QuizUploadScreenState();
}

class _QuizUploadScreenState extends State<QuizUploadScreen> {
  final supabase = Supabase.instance.client;

  final _titleController = TextEditingController();

  String? _selectedCourse;
  String? _selectedTopic;

  List<Map<String, dynamic>> courses = [];
  List<Map<String, dynamic>> topics = [];
  List<Map<String, dynamic>> questions = [];

  String? _editingQuizId;

  @override
  void initState() {
    super.initState();
    _loadCourses();
  }

  // ================= COURSES =================

  Future<void> _loadCourses() async {
    try {
      final res = await supabase.from('courses').select().order('title');

      setState(() {
        courses = List<Map<String, dynamic>>.from(res);
      });
    } catch (e) {
      debugPrint("Load courses error: $e");
    }
  }

  // ================= TOPICS =================

  Future<void> _loadTopics(String courseId) async {
    try {
      final res = await supabase
          .from('topics')
          .select()
          .eq('course_id', courseId)
          .order('position');

      setState(() {
        topics = List<Map<String, dynamic>>.from(res);
      });
    } catch (e) {
      debugPrint("Load topics error: $e");
    }
  }

  // ================= QUESTIONS =================

  void _addQuestion() {
    setState(() {
      questions.add({
        'question': '',
        'options': ['', ''],
        'correct_index': 0,
      });
    });
  }

  void _removeQuestion(int index) {
    setState(() {
      questions.removeAt(index);
    });
  }

  void _addOption(int qIndex) {
    setState(() {
      questions[qIndex]['options'].add('');
    });
  }

  void _removeOption(int qIndex, int optionIndex) {
    setState(() {
      final options = List<String>.from(questions[qIndex]['options'] ?? []);

      if (options.length <= 2) return;

      options.removeAt(optionIndex);

      questions[qIndex]['options'] = options;

      if (questions[qIndex]['correct_index'] >= options.length) {
        questions[qIndex]['correct_index'] = 0;
      }
    });
  }

  // ================= SAVE QUIZ =================

  Future<void> _saveQuiz() async {
    if (_selectedCourse == null ||
        _selectedTopic == null ||
        _titleController.text.trim().isEmpty ||
        questions.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Please fill all fields")));
      return;
    }

    final user = supabase.auth.currentUser;

    if (user == null) return;

    try {
      late String quizId;

      // ---------- CREATE ----------
      if (_editingQuizId == null) {
        final inserted = await supabase
            .from('quizzes')
            .insert({
              'title': _titleController.text.trim(),
              'course_id': _selectedCourse,
              'topic_id': _selectedTopic,
              'created_by': user.id,
              'reused_by': [],
            })
            .select()
            .single();

        quizId = inserted['id'];
      }
      // ---------- UPDATE ----------
      else {
        quizId = _editingQuizId!;

        await supabase
            .from('quizzes')
            .update({
              'title': _titleController.text.trim(),
              'course_id': _selectedCourse,
              'topic_id': _selectedTopic,
            })
            .eq('id', quizId);

        // remove old questions
        await supabase.from('quiz_questions').delete().eq('quiz_id', quizId);
      }

      // ---------- INSERT QUESTIONS ----------
      for (int i = 0; i < questions.length; i++) {
        final q = questions[i];

        await supabase.from('quiz_questions').insert({
          'quiz_id': quizId,
          'question': q['question'],
          'options': q['options'],
          'correct_index': q['correct_index'],
          'position': i,
        });
      }

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Quiz saved successfully ✅")),
      );

      setState(() {
        _editingQuizId = null;
        _titleController.clear();
        questions.clear();
      });
    } catch (e) {
      debugPrint("Save quiz error: $e");

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Error saving quiz: $e")));
    }
  }

  // ================= EDIT QUIZ =================

  Future<void> _editQuiz(String quizId, Map<String, dynamic> quiz) async {
    try {
      final res = await supabase
          .from('quiz_questions')
          .select()
          .eq('quiz_id', quizId)
          .order('position');

      setState(() {
        _editingQuizId = quizId;

        _titleController.text = quiz['title'] ?? '';

        _selectedCourse = quiz['course_id'];
        _selectedTopic = quiz['topic_id'];

        questions = List<Map<String, dynamic>>.from(res);
      });

      if (_selectedCourse != null) {
        await _loadTopics(_selectedCourse!);
      }
    } catch (e) {
      debugPrint("Edit quiz error: $e");
    }
  }

  // ================= DELETE QUIZ =================

  Future<void> _deleteQuiz(String quizId) async {
    try {
      await supabase.from('quiz_questions').delete().eq('quiz_id', quizId);

      await supabase.from('quizzes').delete().eq('id', quizId);

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Quiz deleted ✅")));

      if (_editingQuizId == quizId) {
        setState(() {
          _editingQuizId = null;
          _titleController.clear();
          questions.clear();
        });
      }
    } catch (e) {
      debugPrint("Delete quiz error: $e");
    }
  }

  // ================= TOGGLE REUSE =================

  Future<void> _toggleReuse(String quizId, List<dynamic> reusedBy) async {
    try {
      final uid = widget.teacherId;

      final updated = List<String>.from(reusedBy);

      if (updated.contains(uid)) {
        updated.remove(uid);
      } else {
        updated.add(uid);
      }

      await supabase
          .from('quizzes')
          .update({'reused_by': updated})
          .eq('id', quizId);
    } catch (e) {
      debugPrint("Toggle reuse error: $e");
    }
  }

  // ================= QUIZ STREAM =================

  // Stream<List<Map<String, dynamic>>> _quizStream() {
  //   var query = supabase.from('quizzes').stream(primaryKey: ['id']);

  //   if (_selectedCourse != null) {
  //     query = query.eq('course_id', _selectedCourse!);
  //   }

  //   if (_selectedTopic != null) {
  //     query = query.eq('topic_id', _selectedTopic!);
  //   }

  //   return query;
  // }
  Stream<List<Map<String, dynamic>>> _quizStream() {
    final stream = supabase.from('quizzes').stream(primaryKey: ['id']);

    if (_selectedCourse != null) {
      stream.eq('course_id', _selectedCourse!);
    }

    if (_selectedTopic != null) {
      stream.eq('topic_id', _selectedTopic!);
    }

    return stream;
  }

  // ================= UI =================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Quiz Manager"),
        backgroundColor: AppTheme.primaryColor,
      ),

      body: ListView(
        padding: const EdgeInsets.all(16),

        children: [
          // ================= COURSE =================
          DropdownButtonFormField<String>(
            value: _selectedCourse,

            decoration: const InputDecoration(labelText: "Select Course"),

            items: courses.map((course) {
              return DropdownMenuItem<String>(
                value: course['id'].toString(),
                child: Text(course['title'] ?? '-'),
              );
            }).toList(),

            onChanged: (Object? v) async {
              final value = v as String?;

              setState(() {
                _selectedCourse = value;
                _selectedTopic = null;
              });

              if (value != null) {
                await _loadTopics(value);
              }
            },
          ),

          const SizedBox(height: 12),

          // ================= TOPIC =================
          DropdownButtonFormField<String>(
            value: _selectedTopic,

            decoration: const InputDecoration(labelText: "Select Topic"),

            items: topics.map((topic) {
              return DropdownMenuItem<String>(
                value: topic['id'].toString(),
                child: Text(topic['title'] ?? '-'),
              );
            }).toList(),

            onChanged: (Object? v) {
              setState(() {
                _selectedTopic = v as String?;
              });
            },
          ),

          const SizedBox(height: 12),

          // ================= TITLE =================
          TextField(
            controller: _titleController,
            decoration: const InputDecoration(labelText: "Quiz Title"),
          ),

          const SizedBox(height: 20),

          // ================= QUESTIONS =================
          const Text(
            "Questions",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),

          const SizedBox(height: 10),

          ...questions.asMap().entries.map((entry) {
            final qIndex = entry.key;
            final q = entry.value;

            final options = List<String>.from(q['options'] ?? []);

            return Card(
              margin: const EdgeInsets.only(bottom: 12),

              child: Padding(
                padding: const EdgeInsets.all(12),

                child: Column(
                  children: [
                    TextField(
                      controller: TextEditingController(text: q['question']),

                      decoration: InputDecoration(
                        labelText: "Question ${qIndex + 1}",
                      ),

                      onChanged: (v) {
                        q['question'] = v;
                      },
                    ),

                    const SizedBox(height: 12),

                    ...options.asMap().entries.map((optionEntry) {
                      final optionIndex = optionEntry.key;

                      return Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: TextEditingController(
                                text: options[optionIndex],
                              ),

                              decoration: InputDecoration(
                                labelText: "Option ${optionIndex + 1}",
                              ),

                              onChanged: (v) {
                                options[optionIndex] = v;
                                q['options'] = options;
                              },
                            ),
                          ),

                          IconButton(
                            icon: const Icon(
                              Icons.remove_circle,
                              color: Colors.red,
                            ),
                            onPressed: () => _removeOption(qIndex, optionIndex),
                          ),
                        ],
                      );
                    }),

                    Align(
                      alignment: Alignment.centerLeft,
                      child: TextButton.icon(
                        onPressed: () => _addOption(qIndex),
                        icon: const Icon(Icons.add),
                        label: const Text("Add Option"),
                      ),
                    ),

                    DropdownButton<int>(
                      value: q['correct_index'],

                      items: List.generate(
                        options.length,
                        (index) => DropdownMenuItem<int>(
                          value: index,
                          child: Text("Correct Answer: Option ${index + 1}"),
                        ),
                      ),

                      onChanged: (v) {
                        setState(() {
                          q['correct_index'] = v ?? 0;
                        });
                      },
                    ),

                    TextButton.icon(
                      onPressed: () => _removeQuestion(qIndex),

                      icon: const Icon(Icons.delete, color: Colors.red),

                      label: const Text("Delete Question"),
                    ),
                  ],
                ),
              ),
            );
          }),

          // ================= ACTIONS =================
          ElevatedButton(
            onPressed: _addQuestion,

            child: const Text("➕ Add Question"),
          ),

          const SizedBox(height: 10),

          ElevatedButton(
            onPressed: _saveQuiz,

            child: Text(_editingQuizId == null ? "Save Quiz" : "Update Quiz"),
          ),

          const SizedBox(height: 30),

          // ================= EXISTING QUIZZES =================
          const Text(
            "Existing Quizzes",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),

          const SizedBox(height: 12),

          StreamBuilder<List<Map<String, dynamic>>>(
            stream: _quizStream(),

            builder: (context, snapshot) {
              if (!snapshot.hasData) {
                return const Center(child: CircularProgressIndicator());
              }

              final data = snapshot.data!;

              if (data.isEmpty) {
                return const Text("No quizzes found.");
              }

              return Column(
                children: data.map((quiz) {
                  final reusedBy = List<dynamic>.from(quiz['reused_by'] ?? []);

                  final isMine = quiz['created_by'] == widget.teacherId;

                  return Card(
                    child: ListTile(
                      title: Text(quiz['title'] ?? '-'),

                      subtitle: Text(isMine ? "Your Quiz" : "Shared Quiz"),

                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,

                        children: [
                          if (isMine) ...[
                            IconButton(
                              icon: const Icon(Icons.edit, color: Colors.blue),
                              onPressed: () => _editQuiz(quiz['id'], quiz),
                            ),

                            IconButton(
                              icon: const Icon(Icons.delete, color: Colors.red),
                              onPressed: () => _deleteQuiz(quiz['id']),
                            ),
                          ] else ...[
                            IconButton(
                              icon: Icon(
                                reusedBy.contains(widget.teacherId)
                                    ? Icons.link_off
                                    : Icons.link,
                              ),

                              onPressed: () =>
                                  _toggleReuse(quiz['id'], reusedBy),
                            ),
                          ],
                        ],
                      ),
                    ),
                  );
                }).toList(),
              );
            },
          ),
        ],
      ),
    );
  }
}
// import 'package:flutter/material.dart';
// import 'package:supabase_flutter/supabase_flutter.dart';
// import 'package:techtalk/constants/app_theme.dart';

// class QuizUploadScreen extends StatefulWidget {
//   final String teacherId;
//   const QuizUploadScreen({super.key, required this.teacherId});

//   @override
//   State<QuizUploadScreen> createState() => _QuizUploadScreenState();
// }

// class _QuizUploadScreenState extends State<QuizUploadScreen> {
//   final supabase = Supabase.instance.client;

//   final _titleController = TextEditingController();

//   String? _selectedCourse;
//   String? _selectedTopic;

//   List courses = [];
//   List topics = [];
//   List questions = [];

//   String? _editingQuizId;

//   @override
//   void initState() {
//     super.initState();
//     _loadCourses();
//   }

//   // ---------------- COURSES ----------------
//   Future<void> _loadCourses() async {
//     final res = await supabase.from('courses').select();
//     setState(() => courses = res);
//   }

//   // ---------------- TOPICS ----------------
//   Future<void> _loadTopics(String courseId) async {
//     final res = await supabase
//         .from('topics')
//         .select()
//         .eq('course_id', courseId)
//         .order('position');

//     setState(() => topics = res);
//   }

//   // ---------------- QUESTIONS ----------------
//   void _addQuestion() {
//     setState(() {
//       questions.add({
//         'question': '',
//         'options': ['', ''],
//         'correct_index': 0,
//       });
//     });
//   }

//   void _addOption(int qIndex) {
//     setState(() {
//       questions[qIndex]['options'].add('');
//     });
//   }

//   void _removeOption(int qIndex, int oIndex) {
//     setState(() {
//       if (questions[qIndex]['options'].length > 2) {
//         questions[qIndex]['options'].removeAt(oIndex);
//       }
//     });
//   }

//   // ---------------- SAVE QUIZ ----------------
//   Future<void> _saveQuiz() async {
//     if (_selectedCourse == null ||
//         _selectedTopic == null ||
//         _titleController.text.isEmpty ||
//         questions.isEmpty) {
//       ScaffoldMessenger.of(
//         context,
//       ).showSnackBar(const SnackBar(content: Text("Fill all fields")));
//       return;
//     }

//     final user = supabase.auth.currentUser;
//     if (user == null) return;

//     late String quizId;

//     if (_editingQuizId == null) {
//       final inserted = await supabase
//           .from('quizzes')
//           .insert({
//             'title': _titleController.text,
//             'course_id': _selectedCourse,
//             'topic_id': _selectedTopic,
//             'created_by': user.id,
//           })
//           .select()
//           .single();

//       quizId = inserted['id'];
//     } else {
//       quizId = _editingQuizId!;
//       await supabase
//           .from('quizzes')
//           .update({'title': _titleController.text})
//           .eq('id', quizId);
//     }

//     // delete old questions if editing
//     if (_editingQuizId != null) {
//       await supabase.from('quiz_questions').delete().eq('quiz_id', quizId);
//     }

//     // insert questions
//     for (int i = 0; i < questions.length; i++) {
//       final q = questions[i];

//       await supabase.from('quiz_questions').insert({
//         'quiz_id': quizId,
//         'question': q['question'],
//         'options': q['options'],
//         'correct_index': q['correct_index'],
//         'position': i,
//       });
//     }

//     ScaffoldMessenger.of(
//       context,
//     ).showSnackBar(const SnackBar(content: Text("Quiz saved ✅")));

//     setState(() {
//       _titleController.clear();
//       questions.clear();
//       _editingQuizId = null;
//     });
//   }

//   // ---------------- TOGGLE REUSE ----------------
//   Future<void> _toggleReuse(String quizId, List reusedBy) async {
//     final uid = widget.teacherId;
//     final isReusing = reusedBy.contains(uid);

//     await supabase
//         .from('quizzes')
//         .update({
//           'reused_by': isReusing ? (reusedBy..remove(uid)) : [...reusedBy, uid],
//         })
//         .eq('id', quizId);
//   }

//   // ---------------- LOAD QUIZ QUESTIONS ----------------
//   Future<void> _editQuiz(String quizId, Map quiz) async {
//     final res = await supabase
//         .from('quiz_questions')
//         .select()
//         .eq('quiz_id', quizId)
//         .order('position');

//     setState(() {
//       _editingQuizId = quizId;
//       _titleController.text = quiz['title'];
//       questions = res;
//       _selectedCourse = quiz['course_id'];
//       _selectedTopic = quiz['topic_id'];
//     });
//   }

//   // ---------------- UI ----------------
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text("Quiz Manager"),
//         backgroundColor: AppTheme.primaryColor,
//       ),
//       body: ListView(
//         padding: const EdgeInsets.all(16),
//         children: [
//           DropdownButtonFormField(
//             value: _selectedCourse,
//             items: courses
//                 .map(
//                   (c) =>
//                       DropdownMenuItem(value: c['id'], child: Text(c['title'])),
//                 )
//                 .toList(),
//             onChanged: (v) {
//               setState(() => _selectedCourse = v);
//               _loadTopics(v as String);
//             },
//             decoration: const InputDecoration(labelText: "Course"),
//           ),

//           DropdownButtonFormField(
//             value: _selectedTopic,
//             items: topics
//                 .map(
//                   (t) =>
//                       DropdownMenuItem(value: t['id'], child: Text(t['title'])),
//                 )
//                 .toList(),
//             onChanged: (v) => setState(() => _selectedTopic = v),
//             decoration: const InputDecoration(labelText: "Topic"),
//           ),

//           TextField(
//             controller: _titleController,
//             decoration: const InputDecoration(labelText: "Quiz Title"),
//           ),

//           const SizedBox(height: 20),

//           ...questions.asMap().entries.map((entry) {
//             final i = entry.key;
//             final q = entry.value;

//             return Card(
//               child: Padding(
//                 padding: const EdgeInsets.all(10),
//                 child: Column(
//                   children: [
//                     TextField(
//                       onChanged: (v) => q['question'] = v,
//                       decoration: InputDecoration(
//                         labelText: "Question ${i + 1}",
//                       ),
//                     ),

//                     ...q['options'].asMap().entries.map((o) {
//                       return Row(
//                         children: [
//                           Expanded(
//                             child: TextField(
//                               onChanged: (v) => q['options'][o.key] = v,
//                               decoration: InputDecoration(
//                                 labelText: "Option ${o.key + 1}",
//                               ),
//                             ),
//                           ),
//                           IconButton(
//                             icon: const Icon(Icons.remove),
//                             onPressed: () => _removeOption(i, o.key),
//                           ),
//                         ],
//                       );
//                     }),

//                     TextButton(
//                       onPressed: () => _addOption(i),
//                       child: const Text("Add Option"),
//                     ),

//                     DropdownButton(
//                       value: q['correct_index'],
//                       items: List.generate(
//                         q['options'].length,
//                         (index) => DropdownMenuItem(
//                           value: index,
//                           child: Text("Correct $index"),
//                         ),
//                       ),
//                       onChanged: (v) => setState(() => q['correct_index'] = v),
//                     ),
//                   ],
//                 ),
//               ),
//             );
//           }),

//           ElevatedButton(
//             onPressed: _addQuestion,
//             child: const Text("Add Question"),
//           ),

//           ElevatedButton(
//             onPressed: _saveQuiz,
//             child: Text(_editingQuizId == null ? "Save Quiz" : "Update Quiz"),
//           ),
//         ],
//       ),
//     );
//   }
// }
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:flutter/material.dart';
// import 'package:techtalk/constants/app_theme.dart';

// class QuizUploadScreen extends StatefulWidget {
//   final String teacherId;
//   const QuizUploadScreen({super.key, required this.teacherId});

//   @override
//   State<QuizUploadScreen> createState() => _QuizUploadScreenState();
// }

// class _QuizUploadScreenState extends State<QuizUploadScreen> {
//   final _formKey = GlobalKey<FormState>();
//   final _quizTitleController = TextEditingController();

//   String? _selectedCourse;
//   String? _selectedTopic;

//   List<Map<String, dynamic>> _courses = [];
//   List<Map<String, dynamic>> _topics = [];
//   List<Map<String, dynamic>> _questions = [];

//   String? _editingQuizId;

//   @override
//   void initState() {
//     super.initState();
    
//     _fetchCourses();
//   }

//   Future<void> _fetchCourses() async {
    
//     final user = FirebaseAuth.instance.currentUser;
//     if (user == null) {
      
//       return;
//     }

//     final teacherDoc =
//         await FirebaseFirestore.instance.collection('users').doc(user.uid).get();
    
//     if (!teacherDoc.exists) return;

//     final teacherData = teacherDoc.data();
//     final assignedCourses = List<String>.from(teacherData?['courses'] ?? []);
    

//     if (assignedCourses.isEmpty) {
//       setState(() => _courses = []);
//       return;
//     }

//     final snapshot = await FirebaseFirestore.instance
//         .collection('courses')
//         .where(FieldPath.documentId, whereIn: assignedCourses)
//         .get();
    

//     setState(() {
//       _courses = snapshot.docs
//           .map((d) => {'id': d.id, 'title': d['title'] ?? d.id})
//           .toList();
//       // Safeguard: select first course by default if null
//       if (_courses.isNotEmpty && _selectedCourse == null) {
//         _selectedCourse = _courses.first['id'] as String;
//         _fetchTopics(_selectedCourse!);
//       }
//     });
//   }

//   Future<void> _fetchTopics(String courseId) async {
    
//     final snapshot = await FirebaseFirestore.instance
//         .collection("topics")
//         .where("courseId", isEqualTo: courseId)
//         .orderBy("order")
//         .get();

    
//     setState(() {
//       _topics = snapshot.docs
//           .map((d) => {'id': d.id, 'title': d['title'] ?? d.id})
//           .toList();
//       // Safeguard: select first topic by default if null
//       if (_topics.isNotEmpty && !_topics.any((t) => t['id'] == _selectedTopic)) {
//         _selectedTopic = _topics.first['id'] as String;
//       }
//       _editingQuizId = null;
//       _questions = [];
//       _quizTitleController.clear();
//     });
//   }

//   void _addQuestion() {
    
//     setState(() {
//       _questions.add({'q': '', 'options': ['', ''], 'correctIndex': 0});
//     });
//   }

//   void _addOption(int qIndex) {
    
//     setState(() {
//       _questions[qIndex]['options'].add('');
//     });
//   }

//   void _removeOption(int qIndex, int oIndex) {
    
//     setState(() {
//       if (_questions[qIndex]['options'].length > 2) {
//         _questions[qIndex]['options'].removeAt(oIndex);
//         if (_questions[qIndex]['correctIndex'] >=
//             _questions[qIndex]['options'].length) {
//           _questions[qIndex]['correctIndex'] = 0;
//         }
//       }
//     });
//   }

//   void _deleteQuestion(int qIndex) {
    
//     setState(() {
//       _questions.removeAt(qIndex);
//     });
//   }

//   Future<void> _submitQuiz() async {
    
    
    
    
    
    
    

//     // SAFEGUARD: ensure all required fields
//     if (_selectedCourse == null ||
//         _selectedTopic == null ||
//         _quizTitleController.text.trim().isEmpty ||
//         _questions.isEmpty ||
//         _questions.any((q) =>
//             q['q'].toString().trim().isEmpty ||
//             q['options'] == null ||
//             (q['options'] as List).length < 2 ||
//             q['options'].any((o) => o.toString().trim().isEmpty))) {
//       ScaffoldMessenger.of(context).showSnackBar(
//         const SnackBar(
//             content: Text(
//                 "Please select course & topic, enter title, add questions with at least 2 options")),
//       );
      
//       return;
//     }

//     final user = FirebaseAuth.instance.currentUser;
//     if (user == null) {
      
//       return;
//     }

//     // Ensure correctIndex is within bounds
//     for (var q in _questions) {
//       if (q['correctIndex'] >= (q['options'] as List).length) {
//         q['correctIndex'] = 0;
//       }
//     }

//     try {
//       final quizRef = _editingQuizId != null
//           ? FirebaseFirestore.instance.collection('quizzes').doc(_editingQuizId)
//           : FirebaseFirestore.instance.collection('quizzes').doc();

//       await quizRef.set({
//         'title': _quizTitleController.text.trim(),
//         'questions': _questions,
//         'topicId': _selectedTopic,
//         'courseId': _selectedCourse,
//         'createdBy': user.uid,
//         // 'reused': false,
//         'reusedBy': [],
//         'createdAt': FieldValue.serverTimestamp(),
//       }, SetOptions(merge: true));

      
//       ScaffoldMessenger.of(context).showSnackBar(
//         const SnackBar(content: Text("Quiz saved successfully ✅")),
//       );

//       setState(() {
//         _editingQuizId = null;
//         _quizTitleController.clear();
//         _questions = [];
//         _selectedTopic = _topics.isNotEmpty ? _topics.first['id'] : null;
//       });
//     } catch (e) {
      
//       ScaffoldMessenger.of(context)
//           .showSnackBar(SnackBar(content: Text("Error saving quiz: $e")));
//     }
//   }

//   Future<void> _deleteQuiz(String quizId) async {
    
//     try {
//       await FirebaseFirestore.instance.collection('quizzes').doc(quizId).delete();
      
//       if (_editingQuizId == quizId) {
//         setState(() {
//           _editingQuizId = null;
//           _quizTitleController.clear();
//           _questions = [];
//         });
//       }
//       ScaffoldMessenger.of(context)
//           .showSnackBar(const SnackBar(content: Text("Quiz deleted ✅")));
//     } catch (e) {
      
//       ScaffoldMessenger.of(context)
//           .showSnackBar(SnackBar(content: Text("Error deleting quiz: $e")));
//     }
//   }

//   Stream<QuerySnapshot> _quizzesStream() {
//     if (_selectedTopic == null) return const Stream.empty();
//     return FirebaseFirestore.instance
//         .collection('quizzes')
//         .where('topicId', isEqualTo: _selectedTopic)
//         .snapshots();
//   }

//   void _editQuiz(String quizId, Map<String, dynamic> data) {
    
//     setState(() {
//       _editingQuizId = quizId;
//       _quizTitleController.text = data['title'] ?? '';
//       _questions = List<Map<String, dynamic>>.from(data['questions'] ?? []);
//       if (data['topicId'] != null &&
//           _topics.any((t) => t['id'] == data['topicId'])) {
//         _selectedTopic = data['topicId'];
//       }
//     });
//   }

//   // Future<void> _toggleReuse(String quizId, bool currentStatus) async {
//   //   
//   //   try {
//   //     await FirebaseFirestore.instance
//   //         .collection('quizzes')
//   //         .doc(quizId)
//   //         .update({'reused': !currentStatus});

//   //     ScaffoldMessenger.of(context).showSnackBar(
//   //       SnackBar(
//   //           content: Text(!currentStatus
//   //               ? "You reused this quiz ✅"
//   //               : "You stopped reusing this quiz ❌")),
//   //     );
//   //     
//   //   } catch (e) {
//   //     
//   //     ScaffoldMessenger.of(context)
//   //         .showSnackBar(SnackBar(content: Text("Error updating reuse: $e")));
//   //   }
//   // }
//   Future<void> _toggleReuse(String quizId, List<dynamic> reusedBy) async {
//   final user = FirebaseAuth.instance.currentUser;
//   if (user == null) return;

//   final teacherId = user.uid;
//   final quizRef = FirebaseFirestore.instance.collection('quizzes').doc(quizId);
//   final isReusing = reusedBy.contains(teacherId);

//   try {
//     await quizRef.update({
//       'reusedBy': isReusing
//           ? FieldValue.arrayRemove([teacherId])
//           : FieldValue.arrayUnion([teacherId]),
//     });

//     ScaffoldMessenger.of(context).showSnackBar(SnackBar(
//       content: Text(isReusing
//           ? "You stopped reusing this quiz ❌"
//           : "You reused this quiz ✅"),
//     ));
//   } catch (e) {
//     ScaffoldMessenger.of(context)
//         .showSnackBar(SnackBar(content: Text("Error updating reuse: $e")));
//   }
// }


//   @override
//   Widget build(BuildContext context) {
    
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text("Teacher Quiz Manager"),
//         backgroundColor: AppTheme.primaryColor,
//       ),
//       body: Padding(
//         padding: const EdgeInsets.all(16),
//         child: ListView(
//           children: [
//             DropdownButtonFormField<String>(
//               initialValue: _courses.any((c) => c['id'] == _selectedCourse)
//                   ? _selectedCourse
//                   : null,
//               decoration: const InputDecoration(labelText: "Select Course"),
//               items: _courses
//                   .map((c) => DropdownMenuItem<String>(
//                         value: c['id'] as String,
//                         child: Text(c['title'] as String),
//                       ))
//                   .toList(),
//               onChanged: (val) {
                
//                 setState(() => _selectedCourse = val);
//                 if (val != null) _fetchTopics(val);
//               },
//               validator: (v) => v == null ? "Required" : null,
//             ),
//             const SizedBox(height: 12),
//             DropdownButtonFormField<String>(
//               initialValue: _topics.any((t) => t['id'] == _selectedTopic)
//                   ? _selectedTopic
//                   : null,
//               decoration: const InputDecoration(labelText: "Select Topic"),
//               items: _topics
//                   .map((t) => DropdownMenuItem<String>(
//                         value: t['id'] as String,
//                         child: Text(t['title'] as String),
//                       ))
//                   .toList(),
//               onChanged: (val) {
                
//                 setState(() => _selectedTopic = val);
//               },
//               validator: (v) => v == null ? "Required" : null,
//             ),
//             const SizedBox(height: 12),
//             TextFormField(
//               controller: _quizTitleController,
//               decoration: const InputDecoration(labelText: "Quiz Title"),
//               validator: (v) => v == null || v.isEmpty ? "Required" : null,
//             ),
//             const SizedBox(height: 20),
//             const Text("Questions",
//                 style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
//             ..._questions.asMap().entries.map((entry) {
//               final qIndex = entry.key;
//               final qData = entry.value;
//               return Card(
//                 margin: const EdgeInsets.symmetric(vertical: 8),
//                 elevation: 3,
//                 child: Padding(
//                   padding: const EdgeInsets.all(12),
//                   child: Column(
//                     children: [
//                       TextFormField(
//                         initialValue: qData['q'],
//                         decoration:
//                             InputDecoration(labelText: "Question ${qIndex + 1}"),
//                         onChanged: (val) {
                          
//                           qData['q'] = val;
//                         },
//                       ),
//                       const SizedBox(height: 8),
//                       ...qData['options'].asMap().entries.map((optEntry) {
//                         final oIndex = optEntry.key;
//                         return Row(
//                           children: [
//                             Expanded(
//                               child: TextFormField(
//                                 initialValue: qData['options'][oIndex],
//                                 decoration:
//                                     InputDecoration(labelText: "Option ${oIndex + 1}"),
//                                 onChanged: (val) {
//                                   debugPrint(
//                                       "Question $qIndex Option $oIndex changed: $val");
//                                   qData['options'][oIndex] = val;
//                                 },
//                               ),
//                             ),
//                             IconButton(
//                               icon: const Icon(Icons.remove_circle, color: Colors.red),
//                               onPressed: () => _removeOption(qIndex, oIndex),
//                             ),
//                           ],
//                         );
//                       }),
//                       TextButton.icon(
//                         onPressed: () => _addOption(qIndex),
//                         icon: const Icon(Icons.add),
//                         label: const Text("Add Option"),
//                       ),
//                       DropdownButton<int>(
//                         value: qData['correctIndex'],
//                         items: List.generate(
//                             qData['options'].length,
//                             (i) => DropdownMenuItem(
//                                 value: i, child: Text("Correct: Option ${i + 1}"))),
//                         onChanged: (val) {
//                           debugPrint(
//                               "Question $qIndex correctIndex changed: $val");
//                           setState(() => qData['correctIndex'] = val ?? 0);
//                         },
//                       ),
//                       TextButton.icon(
//                         onPressed: () => _deleteQuestion(qIndex),
//                         icon: const Icon(Icons.delete, color: Colors.red),
//                         label: const Text("Delete Question"),
//                       ),
//                     ],
//                   ),
//                 ),
//               );
//             }),
//             ElevatedButton(
//               onPressed: _addQuestion,
//               style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor),
//               child: const Text("➕ Add Question"),
//             ),
//             const SizedBox(height: 20),
//             ElevatedButton(
//               onPressed: _submitQuiz,
//               style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor),
//               child: Text(_editingQuizId == null ? "Submit Quiz" : "Update Quiz"),
//             ),
//             const SizedBox(height: 30),
//             const Text("Existing Quizzes",
//                 style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
//             StreamBuilder<QuerySnapshot>(
//               stream: _quizzesStream(),
//               builder: (context, snapshot) {
                
//                 if (snapshot.connectionState == ConnectionState.waiting) {
//                   return const CircularProgressIndicator();
//                 }
//                 if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
//                   return const Text("No quizzes uploaded yet.");
//                 }

//                 final user = FirebaseAuth.instance.currentUser;

//                 return Column(
//                   children: snapshot.data!.docs.map((doc) {
//                     final data = doc.data() as Map<String, dynamic>;
//                     final isOwner = data['createdBy'] == user?.uid;
//                     // final reused = data['reused'] ?? false;
//                     final reusedBy = List<String>.from(data['reusedBy'] ?? []);
// final reused = reusedBy.contains(user?.uid);

                    

//                     return Card(
//                       margin: const EdgeInsets.symmetric(vertical: 6),
//                       child: ListTile(
//                         title: Text(data['title'] ?? doc.id),
//                         subtitle: Text(
//                           "${(data['questions'] as List?)?.length ?? 0} questions"
//                           "\n${isOwner ? 'Your quiz' : 'By another teacher'}"
//                           "\nReused: ${reused ? '✅ Yes' : '❌ No'}",
//                         ),
//                         trailing: Row(
//                           mainAxisSize: MainAxisSize.min,
//                           children: [
//                             if (isOwner) ...[
//                               IconButton(
//                                 icon: const Icon(Icons.edit, color: Colors.blue),
//                                 onPressed: () => _editQuiz(doc.id, data),
//                               ),
//                               IconButton(
//                                 icon: const Icon(Icons.delete, color: Colors.red),
//                                 onPressed: () => _deleteQuiz(doc.id),
//                               ),
//                             ] else ...[
//                               IconButton(
//                                 icon: Icon(
//                                   reused ? Icons.link_off : Icons.link,
//                                   color: reused ? Colors.orange : Colors.green,
//                                 ),
//                                 // onPressed: () => _toggleReuse(doc.id, reused),
//                                 onPressed: () => _toggleReuse(doc.id, reusedBy),

//                               ),
//                             ],
//                           ],
//                         ),
//                       ),
//                     );
//                   }).toList(),
//                 );
//               },
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }
