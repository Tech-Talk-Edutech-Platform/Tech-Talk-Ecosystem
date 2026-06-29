// lib/screens/parent/parents_dashboard.dart

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import 'package:techtalk/constants/app_theme.dart';
// import 'package:techtalk/models/chat.dart' as parentchat;
import 'package:techtalk/models/chat_screen.dart';
import 'package:techtalk/widgets/logout_button.dart';

class ParentsDashboard extends StatefulWidget {
  const ParentsDashboard({super.key});

  @override
  State<ParentsDashboard> createState() => _ParentsDashboardState();
}

class _ParentsDashboardState extends State<ParentsDashboard> {
  final supabase = Supabase.instance.client;

  late final FirebaseMessaging _messaging;

  List<Map<String, dynamic>> children = [];

  bool hasUnreadNotifications = false;
  bool _loading = false;

  @override
  void initState() {
    super.initState();

    _setupFCM();
    _loadChildren();
    _listenNotifications();
  }

  /// ===============================
  /// 🔔 FCM
  /// ===============================
  Future<void> _setupFCM() async {
    _messaging = FirebaseMessaging.instance;

    await _messaging.requestPermission();

    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      if (!mounted) return;

      final notification = message.notification;

      if (notification != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(notification.body ?? "New update"),
            backgroundColor: AppTheme.primaryColor,
          ),
        );
      }
    });
  }

  /// ===============================
  /// 👧 LOAD CHILDREN
  /// ===============================
  Future<void> _loadChildren() async {
    final parentId = supabase.auth.currentUser?.id;

    if (parentId == null) return;

    setState(() => _loading = true);

    try {
      final studentsResponse = await supabase
          .from('users')
          .select('''
            id,
            full_name,
            email,
            assigned_course_id,
            assigned_tutor_id,
            total_classes,
            classes_remaining,
            subscription_tier,
            parent_id
          ''')
          .eq('role', 'student')
          .eq('parent_id', parentId);

      final List students = studentsResponse;

      if (students.isEmpty) {
        setState(() => children = []);
        return;
      }

      /// ===============================
      /// IDS
      /// ===============================
      final courseIds = students
          .map((e) => e['assigned_course_id'])
          .where((e) => e != null)
          .toSet()
          .toList();

      final tutorIds = students
          .map((e) => e['assigned_tutor_id'])
          .where((e) => e != null)
          .toSet()
          .toList();

      /// ===============================
      /// COURSES
      /// ===============================
      Map<String, dynamic> coursesMap = {};

      if (courseIds.isNotEmpty) {
        final courseRes = await supabase
            .from('courses')
            .select()
            .inFilter('id', courseIds);

        for (var c in courseRes) {
          coursesMap[c['id']] = c;
        }
      }

      /// ===============================
      /// TOPICS
      /// ===============================
      List topics = [];

      if (courseIds.isNotEmpty) {
        topics = await supabase
            .from('topics')
            .select()
            .inFilter('course_id', courseIds);
      }

      /// ===============================
      /// NOTES PROGRESS
      /// ===============================
      final allStudentIds = students.map((e) => e['id']).toList();

      List progress = [];

      if (allStudentIds.isNotEmpty) {
        progress = await supabase
            .from('user_notes_progress')
            .select('user_id,note_id');
      }

      /// ===============================
      /// NOTES
      /// ===============================
      List notes = [];

      if (courseIds.isNotEmpty) {
        notes = await supabase.from('notes').select('id,course_id');
      }

      /// ===============================
      /// TUTORS
      /// ===============================
      Map<String, dynamic> tutorsMap = {};

      if (tutorIds.isNotEmpty) {
        final tutorRes = await supabase
            .from('users')
            .select('id,full_name,email')
            .inFilter('id', tutorIds);

        for (var t in tutorRes) {
          tutorsMap[t['id']] = t;
        }
      }

      /// ===============================
      /// BUILD CHILD DATA
      /// ===============================
      List<Map<String, dynamic>> loaded = [];

      for (var student in students) {
        final courseId = student['assigned_course_id'];
        final tutorId = student['assigned_tutor_id'];

        final studentNotes = progress
            .where((p) => p['user_id'] == student['id'])
            .toList();

        final courseNotes = notes
            .where((n) => n['course_id'] == courseId)
            .toList();

        double progressPercent = 0;

        if (courseNotes.isNotEmpty) {
          progressPercent = (studentNotes.length / courseNotes.length) * 100;
        }

        final courseTopics = topics
            .where((t) => t['course_id'] == courseId)
            .map((t) => {'title': t['title']})
            .toList();

        loaded.add({
          'id': student['id'],
          'name': student['full_name'] ?? 'Unnamed Student',
          'email': student['email'],
          'courseTitle': coursesMap[courseId]?['title'] ?? 'No Course Assigned',
          'progress': progressPercent,
          'topics': courseTopics,

          /// tutor
          'teacherId': tutorsMap[tutorId]?['id'] ?? '',
          'teacherName': tutorsMap[tutorId]?['full_name'] ?? 'No Tutor',
          'teacherEmail': tutorsMap[tutorId]?['email'] ?? '',

          /// package
          'subscription': student['subscription_tier'] ?? 'Starter',
          'classesRemaining': student['classes_remaining'] ?? 0,
          'totalClasses': student['total_classes'] ?? 0,
        });
      }

      if (!mounted) return;

      setState(() {
        children = loaded;
      });
    } catch (e) {
      debugPrint("ERROR LOADING PARENTS DASHBOARD: $e");
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  /// ===============================
  /// 🔔 NOTIFICATIONS
  /// ===============================
  Future<void> _listenNotifications() async {
    final uid = supabase.auth.currentUser?.id;

    if (uid == null) return;

    supabase
        .from('notifications')
        .stream(primaryKey: ['id'])
        .eq('user_id', uid)
        .listen((data) {
          if (!mounted) return;

          setState(() {
            hasUnreadNotifications = data.isNotEmpty;
          });
        });
  }

  /// ===============================
  /// 💬 OPEN CHAT
  /// ===============================
  void _openTeacherChat(String teacherId, String teacherName) {
    if (teacherId.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("No tutor assigned yet")));
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ParentChatScreen(
          otherUserId: teacherId,
          otherUserName: teacherName,
        ),
      ),
    );
  }

  /// ===============================
  /// UI
  /// ===============================
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,

      appBar: AppBar(
        elevation: 0,
        backgroundColor: AppTheme.primaryColor,
        title: const Text("Parents Dashboard"),

        actions: [
          /// logout
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await logout(context);
            },
          ),

          /// notifications
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications),
                onPressed: () {
                  Navigator.pushNamed(context, "/notifications");
                },
              ),

              if (hasUnreadNotifications)
                Positioned(
                  right: 10,
                  top: 10,
                  child: Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),

      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadChildren,
              child: children.isEmpty
                  ? const Center(child: Text("No children found"))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: children.length,
                      itemBuilder: (context, index) {
                        final child = children[index];

                        return Card(
                          elevation: 3,
                          margin: const EdgeInsets.only(bottom: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(18),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                /// ===============================
                                /// NAME
                                /// ===============================
                                Row(
                                  children: [
                                    CircleAvatar(
                                      radius: 26,
                                      backgroundColor: AppTheme.primaryColor,
                                      child: Text(
                                        child['name']
                                            .toString()
                                            .substring(0, 1)
                                            .toUpperCase(),
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),

                                    const SizedBox(width: 14),

                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            child['name'],
                                            style: const TextStyle(
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),

                                          Text(
                                            child['courseTitle'],
                                            style: TextStyle(
                                              color: Colors.grey.shade700,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),

                                const SizedBox(height: 20),

                                /// ===============================
                                /// PROGRESS
                                /// ===============================
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text(
                                      "Course Progress",
                                      style: TextStyle(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    Text(
                                      "${child['progress'].toStringAsFixed(0)}%",
                                      style: TextStyle(
                                        color: AppTheme.primaryColor,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),

                                const SizedBox(height: 8),

                                ClipRRect(
                                  borderRadius: BorderRadius.circular(20),
                                  child: LinearProgressIndicator(
                                    value: (child['progress'] / 100).clamp(
                                      0.0,
                                      1.0,
                                    ),
                                    minHeight: 10,
                                    backgroundColor: Colors.grey.shade300,
                                    color: AppTheme.primaryColor,
                                  ),
                                ),

                                const SizedBox(height: 18),

                                /// ===============================
                                /// PACKAGE INFO
                                /// ===============================
                                Container(
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: Colors.blue.shade50,
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  child: Column(
                                    children: [
                                      _infoRow(
                                        "Subscription",
                                        child['subscription'],
                                      ),

                                      const SizedBox(height: 10),

                                      _infoRow(
                                        "Classes Remaining",
                                        "${child['classesRemaining']}",
                                      ),

                                      const SizedBox(height: 10),

                                      _infoRow(
                                        "Total Classes",
                                        "${child['totalClasses']}",
                                      ),
                                    ],
                                  ),
                                ),

                                const SizedBox(height: 18),

                                /// ===============================
                                /// TOPICS
                                /// ===============================
                                if ((child['topics'] as List).isNotEmpty)
                                  Wrap(
                                    spacing: 8,
                                    runSpacing: 8,
                                    children: (child['topics'] as List)
                                        .map<Widget>((topic) {
                                          return Chip(
                                            label: Text(topic['title']),
                                            backgroundColor:
                                                Colors.orange.shade50,
                                          );
                                        })
                                        .toList(),
                                  ),

                                const SizedBox(height: 20),

                                /// ===============================
                                /// TUTOR
                                /// ===============================
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        "Tutor: ${child['teacherName']}",
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),

                                    ElevatedButton.icon(
                                      onPressed: () => _openTeacherChat(
                                        child['teacherId'],
                                        child['teacherName'],
                                      ),
                                      icon: const Icon(
                                        Icons.chat_bubble_outline,
                                        size: 18,
                                      ),
                                      label: const Text("Chat"),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor:
                                            AppTheme.secondaryColor,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }

  /// ===============================
  /// REUSABLE INFO ROW
  /// ===============================
  Widget _infoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: Colors.grey.shade700)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
      ],
    );
  }
}
// // lib/screens/parent/parents_dashboard.dart

// import 'package:flutter/material.dart';
// import 'package:supabase_flutter/supabase_flutter.dart';
// import 'package:firebase_messaging/firebase_messaging.dart';

// import 'package:techtalk/constants/app_theme.dart';
// import 'package:techtalk/models/chat.dart' as parentchat;
// import 'package:techtalk/widgets/logout_button.dart';

// class ParentsDashboard extends StatefulWidget {
//   const ParentsDashboard({super.key});

//   @override
//   State<ParentsDashboard> createState() => _ParentsDashboardState();
// }

// class _ParentsDashboardState extends State<ParentsDashboard> {
//   final supabase = Supabase.instance.client;

//   late final FirebaseMessaging _messaging;

//   List<Map<String, dynamic>> children = [];

//   bool hasUnreadNotifications = false;
//   bool _loading = false;

//   @override
//   void initState() {
//     super.initState();

//     _setupFCM();
//     _loadChildren();
//     _listenNotifications();
//   }

//   /// ===============================
//   /// 🔔 FCM
//   /// ===============================
//   Future<void> _setupFCM() async {
//     _messaging = FirebaseMessaging.instance;

//     await _messaging.requestPermission();

//     FirebaseMessaging.onMessage.listen((RemoteMessage message) {
//       if (!mounted) return;

//       final notification = message.notification;

//       if (notification != null) {
//         ScaffoldMessenger.of(context).showSnackBar(
//           SnackBar(
//             content: Text(notification.body ?? "New update"),
//             backgroundColor: AppTheme.primaryColor,
//           ),
//         );
//       }
//     });
//   }

//   /// ===============================
//   /// 👧 LOAD CHILDREN
//   /// ===============================
//   Future<void> _loadChildren() async {
//     final parentId = supabase.auth.currentUser?.id;

//     if (parentId == null) return;

//     setState(() => _loading = true);

//     try {
//       /// 1. Load students linked to parent phone/email
//       ///
//       /// Adjust this logic depending on your parent relationship system.
//       /// Right now:
//       /// - users.role = student
//       /// - assigned_tutor_id
//       /// - assigned_course_id
//       ///
//       /// We assume:
//       /// parent email = auth email
//       final parentEmail = supabase.auth.currentUser?.email;

//       // final studentsResponse = await supabase
//       //     .from('users')
//       //     .select('''
//       //       id,
//       //       full_name,
//       //       email,
//       //       assigned_course_id,
//       //       assigned_tutor_id,
//       //       total_classes,
//       //       classes_remaining,
//       //       subscription_tier
//       //     ''')
//       //     .eq('role', 'student');
//       final studentsResponse = await supabase
//           .from('users')
//           .select('''
//       id,
//       full_name,
//       email,
//       assigned_course_id,
//       assigned_tutor_id,
//       total_classes,
//       classes_remaining,
//       subscription_tier,
//       parent_id
//     ''')
//           .eq('role', 'student')
//           .eq('parent_id', parentId);

//       final List students = studentsResponse;

//       if (students.isEmpty) {
//         setState(() => children = []);
//         return;
//       }

//       /// collect ids
//       final courseIds = students
//           .map((e) => e['assigned_course_id'])
//           .where((e) => e != null)
//           .toSet()
//           .toList();

//       final tutorIds = students
//           .map((e) => e['assigned_tutor_id'])
//           .where((e) => e != null)
//           .toSet()
//           .toList();

//       /// ===============================
//       /// COURSES
//       /// ===============================
//       Map<String, dynamic> coursesMap = {};

//       if (courseIds.isNotEmpty) {
//         final courseRes = await supabase
//             .from('courses')
//             .select()
//             .inFilter('id', courseIds);

//         for (var c in courseRes) {
//           coursesMap[c['id']] = c;
//         }
//       }

//       /// ===============================
//       /// TOPICS
//       /// ===============================
//       List topics = [];

//       if (courseIds.isNotEmpty) {
//         topics = await supabase
//             .from('topics')
//             .select()
//             .inFilter('course_id', courseIds);
//       }

//       /// ===============================
//       /// NOTES PROGRESS
//       /// ===============================
//       final allStudentIds = students.map((e) => e['id']).toList();

//       List progress = [];

//       if (allStudentIds.isNotEmpty) {
//         progress = await supabase
//             .from('user_notes_progress')
//             .select('user_id,note_id');
//       }

//       /// ===============================
//       /// NOTES
//       /// ===============================
//       List notes = [];

//       if (courseIds.isNotEmpty) {
//         notes = await supabase.from('notes').select('id,course_id');
//       }

//       /// ===============================
//       /// TUTORS
//       /// ===============================
//       Map<String, dynamic> tutorsMap = {};

//       if (tutorIds.isNotEmpty) {
//         final tutorRes = await supabase
//             .from('users')
//             .select('id,full_name,email')
//             .inFilter('id', tutorIds);

//         for (var t in tutorRes) {
//           tutorsMap[t['id']] = t;
//         }
//       }

//       /// ===============================
//       /// BUILD CHILD DATA
//       /// ===============================
//       List<Map<String, dynamic>> loaded = [];

//       for (var student in students) {
//         final courseId = student['assigned_course_id'];
//         final tutorId = student['assigned_tutor_id'];

//         final studentNotes = progress
//             .where((p) => p['user_id'] == student['id'])
//             .toList();

//         final courseNotes = notes
//             .where((n) => n['course_id'] == courseId)
//             .toList();

//         double progressPercent = 0;

//         if (courseNotes.isNotEmpty) {
//           progressPercent = (studentNotes.length / courseNotes.length) * 100;
//         }

//         final courseTopics = topics
//             .where((t) => t['course_id'] == courseId)
//             .map((t) => {'title': t['title']})
//             .toList();

//         loaded.add({
//           'id': student['id'],
//           'name': student['full_name'] ?? 'Unnamed Student',
//           'email': student['email'],
//           'courseTitle': coursesMap[courseId]?['title'] ?? 'No Course Assigned',
//           'progress': progressPercent,
//           'topics': courseTopics,
//           'teacherName': tutorsMap[tutorId]?['full_name'] ?? 'No Tutor',
//           'teacherEmail': tutorsMap[tutorId]?['email'] ?? '',
//           'subscription': student['subscription_tier'] ?? 'Starter',
//           'classesRemaining': student['classes_remaining'] ?? 0,
//           'totalClasses': student['total_classes'] ?? 0,
//         });
//       }

//       if (!mounted) return;

//       setState(() {
//         children = loaded;
//       });
//     } catch (e) {
//       debugPrint("ERROR LOADING PARENTS DASHBOARD: $e");
//     } finally {
//       if (mounted) {
//         setState(() => _loading = false);
//       }
//     }
//   }

//   /// ===============================
//   /// 🔔 NOTIFICATIONS
//   /// ===============================
//   Future<void> _listenNotifications() async {
//     final uid = supabase.auth.currentUser?.id;

//     if (uid == null) return;

//     supabase
//         .from('notifications')
//         .stream(primaryKey: ['id'])
//         .eq('user_id', uid)
//         .listen((data) {
//           if (!mounted) return;

//           setState(() {
//             hasUnreadNotifications = data.isNotEmpty;
//           });
//         });
//   }

//   /// ===============================
//   /// 💬 OPEN CHAT
//   /// ===============================
//   void _openTeacherChat(String teacherEmail) {
//     if (teacherEmail.isEmpty) {
//       ScaffoldMessenger.of(
//         context,
//       ).showSnackBar(const SnackBar(content: Text("No tutor assigned yet")));
//       return;
//     }

//     Navigator.push(
//       context,
//       MaterialPageRoute(
//         // builder: (_) =>
//         //     parentchat.ParentChatScreen(otherUserEmail: teacherEmail),
//         builder: (_) => parentchat.ParentChatScreen(
//           otherUserId: child['teacherId'],
//           otherUserName: child['teacherName'],
//         ),
//       ),
//     );
//   }

//   /// ===============================
//   /// UI
//   /// ===============================
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       backgroundColor: Colors.grey.shade100,

//       appBar: AppBar(
//         elevation: 0,
//         backgroundColor: AppTheme.primaryColor,
//         title: const Text("Parents Dashboard"),

//         actions: [
//           /// logout
//           IconButton(
//             icon: const Icon(Icons.logout),
//             onPressed: () async {
//               await logout(context);
//             },
//           ),

//           /// notifications
//           Stack(
//             children: [
//               IconButton(
//                 icon: const Icon(Icons.notifications),
//                 onPressed: () {
//                   Navigator.pushNamed(context, "/notifications");
//                 },
//               ),

//               if (hasUnreadNotifications)
//                 Positioned(
//                   right: 10,
//                   top: 10,
//                   child: Container(
//                     width: 10,
//                     height: 10,
//                     decoration: const BoxDecoration(
//                       color: Colors.red,
//                       shape: BoxShape.circle,
//                     ),
//                   ),
//                 ),
//             ],
//           ),
//         ],
//       ),

//       body: _loading
//           ? const Center(child: CircularProgressIndicator())
//           : RefreshIndicator(
//               onRefresh: _loadChildren,
//               child: children.isEmpty
//                   ? const Center(child: Text("No children found"))
//                   : ListView.builder(
//                       padding: const EdgeInsets.all(16),
//                       itemCount: children.length,
//                       itemBuilder: (context, index) {
//                         final child = children[index];

//                         return Card(
//                           elevation: 3,
//                           margin: const EdgeInsets.only(bottom: 16),
//                           shape: RoundedRectangleBorder(
//                             borderRadius: BorderRadius.circular(20),
//                           ),

//                           child: Padding(
//                             padding: const EdgeInsets.all(18),

//                             child: Column(
//                               crossAxisAlignment: CrossAxisAlignment.start,

//                               children: [
//                                 /// ===============================
//                                 /// NAME
//                                 /// ===============================
//                                 Row(
//                                   children: [
//                                     CircleAvatar(
//                                       radius: 26,
//                                       backgroundColor: AppTheme.primaryColor,
//                                       child: Text(
//                                         child['name']
//                                             .toString()
//                                             .substring(0, 1)
//                                             .toUpperCase(),
//                                         style: const TextStyle(
//                                           color: Colors.white,
//                                           fontWeight: FontWeight.bold,
//                                         ),
//                                       ),
//                                     ),

//                                     const SizedBox(width: 14),

//                                     Expanded(
//                                       child: Column(
//                                         crossAxisAlignment:
//                                             CrossAxisAlignment.start,
//                                         children: [
//                                           Text(
//                                             child['name'],
//                                             style: const TextStyle(
//                                               fontSize: 18,
//                                               fontWeight: FontWeight.bold,
//                                             ),
//                                           ),

//                                           Text(
//                                             child['courseTitle'],
//                                             style: TextStyle(
//                                               color: Colors.grey.shade700,
//                                             ),
//                                           ),
//                                         ],
//                                       ),
//                                     ),
//                                   ],
//                                 ),

//                                 const SizedBox(height: 20),

//                                 /// ===============================
//                                 /// PROGRESS
//                                 /// ===============================
//                                 Row(
//                                   mainAxisAlignment:
//                                       MainAxisAlignment.spaceBetween,
//                                   children: [
//                                     const Text(
//                                       "Course Progress",
//                                       style: TextStyle(
//                                         fontWeight: FontWeight.w600,
//                                       ),
//                                     ),
//                                     Text(
//                                       "${child['progress'].toStringAsFixed(0)}%",
//                                       style: TextStyle(
//                                         color: AppTheme.primaryColor,
//                                         fontWeight: FontWeight.bold,
//                                       ),
//                                     ),
//                                   ],
//                                 ),

//                                 const SizedBox(height: 8),

//                                 ClipRRect(
//                                   borderRadius: BorderRadius.circular(20),
//                                   child: LinearProgressIndicator(
//                                     value: (child['progress'] / 100).clamp(
//                                       0.0,
//                                       1.0,
//                                     ),
//                                     minHeight: 10,
//                                     backgroundColor: Colors.grey.shade300,
//                                     color: AppTheme.primaryColor,
//                                   ),
//                                 ),

//                                 const SizedBox(height: 18),

//                                 /// ===============================
//                                 /// PACKAGE INFO
//                                 /// ===============================
//                                 Container(
//                                   padding: const EdgeInsets.all(14),
//                                   decoration: BoxDecoration(
//                                     color: Colors.blue.shade50,
//                                     borderRadius: BorderRadius.circular(14),
//                                   ),

//                                   child: Column(
//                                     children: [
//                                       _infoRow(
//                                         "Subscription",
//                                         child['subscription'],
//                                       ),

//                                       const SizedBox(height: 10),

//                                       _infoRow(
//                                         "Classes Remaining",
//                                         "${child['classesRemaining']}",
//                                       ),

//                                       const SizedBox(height: 10),

//                                       _infoRow(
//                                         "Total Classes",
//                                         "${child['totalClasses']}",
//                                       ),
//                                     ],
//                                   ),
//                                 ),

//                                 const SizedBox(height: 18),

//                                 /// ===============================
//                                 /// TOPICS
//                                 /// ===============================
//                                 if ((child['topics'] as List).isNotEmpty)
//                                   Wrap(
//                                     spacing: 8,
//                                     runSpacing: 8,
//                                     children: (child['topics'] as List)
//                                         .map<Widget>((topic) {
//                                           return Chip(
//                                             label: Text(topic['title']),
//                                             backgroundColor:
//                                                 Colors.orange.shade50,
//                                           );
//                                         })
//                                         .toList(),
//                                   ),

//                                 const SizedBox(height: 20),

//                                 /// ===============================
//                                 /// TUTOR
//                                 /// ===============================
//                                 Row(
//                                   mainAxisAlignment:
//                                       MainAxisAlignment.spaceBetween,
//                                   children: [
//                                     Expanded(
//                                       child: Text(
//                                         "Tutor: ${child['teacherName']}",
//                                         style: const TextStyle(
//                                           fontWeight: FontWeight.w600,
//                                         ),
//                                       ),
//                                     ),

//                                     ElevatedButton.icon(
//                                       onPressed: () => _openTeacherChat(
//                                         child['teacherEmail'],
//                                       ),

//                                       icon: const Icon(
//                                         Icons.chat_bubble_outline,
//                                         size: 18,
//                                       ),

//                                       label: const Text("Chat"),

//                                       style: ElevatedButton.styleFrom(
//                                         backgroundColor:
//                                             AppTheme.secondaryColor,
//                                         shape: RoundedRectangleBorder(
//                                           borderRadius: BorderRadius.circular(
//                                             12,
//                                           ),
//                                         ),
//                                       ),
//                                     ),
//                                   ],
//                                 ),
//                               ],
//                             ),
//                           ),
//                         );
//                       },
//                     ),
//             ),
//     );
//   }

//   /// ===============================
//   /// REUSABLE INFO ROW
//   /// ===============================
//   Widget _infoRow(String label, String value) {
//     return Row(
//       mainAxisAlignment: MainAxisAlignment.spaceBetween,
//       children: [
//         Text(label, style: TextStyle(color: Colors.grey.shade700)),
//         Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
//       ],
//     );
//   }
// }
// // // lib/screens/parent/parents_dashboard.dart
// // import 'package:flutter/material.dart';
// // import 'package:cloud_firestore/cloud_firestore.dart';
// // import 'package:firebase_auth/firebase_auth.dart';
// // import 'package:firebase_messaging/firebase_messaging.dart';
// // import 'package:techtalk/constants/app_theme.dart';
// // import 'package:techtalk/models/chat.dart' as parentchat;
// // import 'package:techtalk/widgets/logout_button.dart';

// // class ParentsDashboard extends StatefulWidget {
// //   const ParentsDashboard({super.key});

// //   @override
// //   State<ParentsDashboard> createState() => _ParentsDashboardState();
// // }

// // class _ParentsDashboardState extends State<ParentsDashboard> {
// //   late final FirebaseMessaging _messaging;
// //   List<Map<String, dynamic>> children = [];
// //   bool hasUnreadNotifications = false;
// //   bool _loading = false;

// //   @override
// //   void initState() {
// //     super.initState();
// //     // debugPrint("[ParentsDashboard] initState called");
// //     _setupFCM();
// //     _loadChildren();
// //     _listenNotifications();
// //   }

// //   /// 🔔 Setup FCM Notifications
// //   Future<void> _setupFCM() async {
// //     // debugPrint("[ParentsDashboard] Setting up FCM");
// //     _messaging = FirebaseMessaging.instance;
// //     await _messaging.requestPermission();
// //     FirebaseMessaging.onMessage.listen((RemoteMessage message) {
// //       if (!mounted) return;
// //       final notification = message.notification;
// //       // debugPrint("[ParentsDashboard] FCM message received: $notification");
// //       if (notification != null) {
// //         ScaffoldMessenger.of(context).showSnackBar(
// //           SnackBar(
// //             content: Text(notification.body ?? "New update"),
// //             backgroundColor: AppTheme.primaryColor,
// //           ),
// //         );
// //       }
// //     });
// //   }

// //   /// 👧 Load Children and related data
// //   Future<void> _loadChildren() async {
// //     final parentUid = FirebaseAuth.instance.currentUser?.uid;
// //     // debugPrint("[ParentsDashboard] Loading children for parentUid=$parentUid");
// //     if (parentUid == null) return;
// //     setState(() => _loading = true);

// //     try {
// //       final studentQuery = await FirebaseFirestore.instance
// //           .collection('users')
// //           .where('role', isEqualTo: 'student')
// //           .where('parentIds', arrayContains: parentUid)
// //           .get();

// //       // debugPrint("[ParentsDashboard] Found ${studentQuery.docs.length} children");

// //       if (!mounted || studentQuery.docs.isEmpty) {
// //         setState(() => children = []);
// //         // debugPrint("[ParentsDashboard] No children found");
// //         return;
// //       }

// //       Set<String> allCourseIds = {};
// //       Set<String> allTeacherIds = {};
// //       for (var doc in studentQuery.docs) {
// //         final data = doc.data();
// //         (data['courseIds'] as List?)?.forEach((id) => allCourseIds.add(id));
// //         (data['teacherIds'] as List?)?.forEach((id) => allTeacherIds.add(id));
// //       }

// //       // debugPrint("[ParentsDashboard] Unique courseIds=${allCourseIds.toList()}");
// //       // debugPrint("[ParentsDashboard] Unique teacherIds=${allTeacherIds.toList()}");

// //       final futures = await Future.wait([
// //         if (allCourseIds.isNotEmpty)
// //           FirebaseFirestore.instance
// //               .collection('courses')
// //               .where(FieldPath.documentId, whereIn: allCourseIds.toList())
// //               .get(),
// //         if (allCourseIds.isNotEmpty)
// //           FirebaseFirestore.instance
// //               .collection('topics')
// //               .where('courseId', whereIn: allCourseIds.toList())
// //               .get(),
// //         if (allCourseIds.isNotEmpty)
// //           FirebaseFirestore.instance
// //               .collection('quizzes')
// //               .where('courseId', whereIn: allCourseIds.toList())
// //               .get(),
// //         if (allTeacherIds.isNotEmpty)
// //           FirebaseFirestore.instance
// //               .collection('users')
// //               .where(FieldPath.documentId, whereIn: allTeacherIds.toList())
// //               .get(),
// //       ]);

// //       // debugPrint("[ParentsDashboard] Futures fetched");

// //       final courseDocs = futures.isNotEmpty && allCourseIds.isNotEmpty ? futures[0].docs : [];
// //       final topicDocs = futures.length > 1 && allCourseIds.isNotEmpty ? futures[1].docs : [];
// //       final quizDocs = futures.length > 2 && allCourseIds.isNotEmpty ? futures[2].docs : [];
// //       final teacherDocs = futures.length > 3 && allTeacherIds.isNotEmpty ? futures[3].docs : [];

// //       // debugPrint("[ParentsDashboard] courseDocs=${courseDocs.length}, topicDocs=${topicDocs.length}, quizDocs=${quizDocs.length}, teacherDocs=${teacherDocs.length}");

// //       final courseMap = {for (var doc in courseDocs) doc.id: doc.data()};
// //       final teacherMap = {for (var doc in teacherDocs) doc.id: doc.data()};

// //       final topicQuizCount = <String, Map<String, int>>{};
// //       for (var quizDoc in quizDocs) {
// //         final data = quizDoc.data();
// //         final courseId = data['courseId'] as String?;
// //         final topicId = data['topicId'] as String?;
// //         if (courseId != null && topicId != null) {
// //           topicQuizCount.putIfAbsent(courseId, () => {});
// //           topicQuizCount[courseId]![topicId] = (topicQuizCount[courseId]![topicId] ?? 0) + 1;
// //         }
// //       }

// //       final List<Map<String, dynamic>> loaded = studentQuery.docs.map((doc) {
// //         final data = doc.data();
// //         final List<String> courseIds = List<String>.from(data['courseIds'] ?? []);
// //         Map<String, String> courseTitles = {};
// //         Map<String, double> courseProgress = {};
// //         Map<String, List<Map<String, dynamic>>> courseTopics = {};
// //         Map<String, List<String>> courseTeachers = {};

// //         for (String courseId in courseIds) {
// //           courseTitles[courseId] = courseMap[courseId]?['title'] ?? 'Untitled';
// //           courseProgress[courseId] = (data['progressMap']?[courseId] as num?)?.toDouble() ?? 0.0;

// //           final teacherEmails = <String>[];
// //           final teacherIds = List<String>.from(data['teacherIds'] ?? []);
// //           for (var tId in teacherIds) {
// //             teacherEmails.add(teacherMap[tId]?['email'] ?? 'Unknown');
// //           }
// //           courseTeachers[courseId] = teacherEmails;

// //           final topics = topicDocs
// //               .where((tDoc) => tDoc['courseId'] == courseId)
// //               .map((tDoc) {
// //                 final topicId = tDoc.id;
// //                 final quizCount = topicQuizCount[courseId]?[topicId] ?? 0;
// //                 return {
// //                   'title': tDoc['title'],
// //                   'quizzesCount': quizCount,
// //                 };
// //               })
// //               .toList();
// //           courseTopics[courseId] = topics;
// //         }

// //         return {
// //           'id': doc.id,
// //           'name': data['name'] ?? data['email'] ?? 'Unnamed',
// //           'courseIds': courseIds,
// //           'courseTitles': courseTitles,
// //           'courseProgress': courseProgress,
// //           'courseTopics': courseTopics,
// //           'courseTeachers': courseTeachers,
// //         };
// //       }).toList();

// //       // debugPrint("[ParentsDashboard] Loaded children: ${loaded.map((c) => c['name']).toList()}");
// //       setState(() => children = loaded);
// //     } catch (e, st) {
// //       // debugPrint("[ParentsDashboard] Error loading children: $e\n$st");
// //     } finally {
// //       setState(() => _loading = false);
// //       // debugPrint("[ParentsDashboard] Finished loading children");
// //     }
// //   }

// //   /// 🔔 Listen for Firestore Notifications
// //   Future<void> _listenNotifications() async {
// //     final uid = FirebaseAuth.instance.currentUser?.uid;
// //     // debugPrint("[ParentsDashboard] Listening notifications for uid=$uid");
// //     if (uid == null) return;
// //     FirebaseFirestore.instance
// //         .collection('notifications')
// //         .where('uid', isEqualTo: uid)
// //         .where('read', isEqualTo: false)
// //         .snapshots()
// //         .listen((snapshot) {
// //       if (!mounted) return;
// //       //debugPrint("[ParentsDashboard] Unread notifications count=${snapshot.docs.length}");
// //       setState(() {
// //         hasUnreadNotifications = snapshot.docs.isNotEmpty;
// //       });
// //     });
// //   }

// //   /// 💬 Open Chat with a Teacher
// //   void _openTeacherChat(String teacherEmail) {
// //     //debugPrint("[ParentsDashboard] Opening chat with teacherEmail=$teacherEmail");
// //     if (teacherEmail.isEmpty || teacherEmail == 'Unknown') {
// //       ScaffoldMessenger.of(context).showSnackBar(
// //         const SnackBar(content: Text("A teacher has not been assigned yet.")),
// //       );
// //       return;
// //     }
// //     Navigator.push(
// //       context,
// //       MaterialPageRoute(
// //         builder: (_) => parentchat.ParentChatScreen(otherUserEmail: teacherEmail),
// //       ),
// //     );
// //   }

// //   /// 🧱 UI BUILD
// //   @override
// //   Widget build(BuildContext context) {
// //     //debugPrint("[ParentsDashboard] build called, loading=$_loading, childrenCount=${children.length}");
// //     return Scaffold(
// //       appBar: AppBar(
// //         title: const Text("Parents Dashboard"),
// //         backgroundColor: AppTheme.primaryColor,
// //         actions: [
// //           // Logout button
// //           // IconButton(
// //           //   icon: const Icon(Icons.logout),
// //           //   onPressed: () async {
// //           //     debugPrint("[ParentsDashboard] Logging out");
// //           //     await FirebaseAuth.instance.signOut();
// //           //     Navigator.pushReplacementNamed(context, '/login');
// //           //   },
// //           // ),
// //             IconButton(
// //     icon: const Icon(Icons.logout),
// //     onPressed: () async {
// //       //debugPrint("[ParentsDashboard] Logging out");
// //       await logout(context); // use the centralized logout function
// //     },
// //   ),
// //           // Notifications button with unread indicator
// //           Stack(
// //             children: [
// //               IconButton(
// //                 icon: const Icon(Icons.notifications),
// //                 onPressed: () => Navigator.pushNamed(context, "/notifications"),
// //               ),
// //               if (hasUnreadNotifications)
// //                 Positioned(
// //                   right: 10,
// //                   bottom: 10,
// //                   child: Container(
// //                     width: 10,
// //                     height: 10,
// //                     decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.red),
// //                   ),
// //                 )
// //             ],
// //           )
// //         ],
// //       ),
// //       body: _loading
// //           ? const Center(child: CircularProgressIndicator())
// //           : RefreshIndicator(
// //               onRefresh: _loadChildren,
// //               child: children.isEmpty
// //                   ? const Center(child: Text("No children found"))
// //                   : ListView.builder(
// //                       padding: const EdgeInsets.all(16),
// //                       itemCount: children.length,
// //                       itemBuilder: (context, index) {
// //                         final child = children[index];
// //                         final courseTitles = child['courseTitles'] as Map<String, String>;
// //                         final courseProgress = child['courseProgress'] as Map<String, double>;
// //                         final courseTopics = child['courseTopics'] as Map<String, List<Map<String, dynamic>>>;
// //                         final courseTeachers = child['courseTeachers'] as Map<String, List<String>>;

// //                         return Card(
// //                           elevation: 4,
// //                           margin: const EdgeInsets.symmetric(vertical: 8),
// //                           shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
// //                           child: Padding(
// //                             padding: const EdgeInsets.all(16),
// //                             child: Column(
// //                               crossAxisAlignment: CrossAxisAlignment.start,
// //                               children: [
// //                                 Text(child['name'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
// //                                 const SizedBox(height: 12),
// //                                 // Courses
// //                                 ...courseTitles.entries.map((entry) {
// //                                   final courseId = entry.key;
// //                                   final title = entry.value;
// //                                   final progress = courseProgress[courseId] ?? 0.0;
// //                                   final topics = courseTopics[courseId] ?? [];
// //                                   final teachers = courseTeachers[courseId] ?? [];

// //                                   return Column(
// //                                     crossAxisAlignment: CrossAxisAlignment.start,
// //                                     children: [
// //                                       Row(
// //                                         mainAxisAlignment: MainAxisAlignment.spaceBetween,
// //                                         children: [
// //                                           Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
// //                                           if (teachers.isNotEmpty)
// //                                             ElevatedButton.icon(
// //                                               onPressed: () => _openTeacherChat(teachers.first),
// //                                               icon: const Icon(Icons.chat_bubble_outline, size: 16),
// //                                               label: const Text("Chat with teacher", style: TextStyle(fontSize: 12)),
// //                                               style: ElevatedButton.styleFrom(
// //                                                 backgroundColor: AppTheme.secondaryColor,
// //                                               ),
// //                                             ),
// //                                         ],
// //                                       ),
// //                                       const SizedBox(height: 4),
// //                                       LinearProgressIndicator(
// //                                         value: (progress / 100).clamp(0.0, 1.0),
// //                                         backgroundColor: Colors.grey.shade300,
// //                                         color: AppTheme.primaryColor,
// //                                         minHeight: 8,
// //                                       ),
// //                                       const SizedBox(height: 6),
// //                                       if (topics.isNotEmpty)
// //                                         Wrap(
// //                                           spacing: 6,
// //                                           runSpacing: -4,
// //                                           children: topics.map((t) {
// //                                             return Chip(
// //                                               label: Text("${t['title']} (${t['quizzesCount']} quizzes)",
// //                                                   style: const TextStyle(fontSize: 12)),
// //                                               backgroundColor: Colors.blue.shade50,
// //                                               side: BorderSide(color: Colors.blue.shade100),
// //                                             );
// //                                           }).toList(),
// //                                         ),
// //                                       const SizedBox(height: 12),
// //                                     ],
// //                                   );
// //                                 }),
// //                               ],
// //                             ),
// //                           ),
// //                         );
// //                       },
// //                     ),
// //             ),
// //     );
// //   }
// // }
