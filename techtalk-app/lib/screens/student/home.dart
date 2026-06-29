import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:techtalk/constants/app_theme.dart';
import 'package:techtalk/screens/student/playful_student_dashboard.dart';
import 'package:techtalk/screens/student/student_courses.dart';
import 'package:techtalk/screens/student/student_quiz.dart';
import 'package:techtalk/screens/student/student_teachers.dart';

class StudentHomeScreen extends StatefulWidget {
  const StudentHomeScreen({super.key});

  @override
  State<StudentHomeScreen> createState() => _StudentHomeScreenState();
}

class _StudentHomeScreenState extends State<StudentHomeScreen> {
  final supabase = Supabase.instance.client;

  String _studentName = "Student";
  List<String> _courseIds = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadStudentData();
  }

  Future<void> _loadStudentData() async {
    try {
      final user = supabase.auth.currentUser;
      if (user == null) return;

      final data = await supabase
          .from('users')
          .select('full_name, assigned_course_id')
          .eq('id', user.id)
          .single();

      setState(() {
        _studentName = data['full_name'] ?? 'Student';

        // adjust later if you store multiple courses properly
        _courseIds = data['assigned_course_id'] != null
            ? [data['assigned_course_id'].toString()]
            : [];
      });
    } catch (e) {
      debugPrint("Error loading student: $e");
    } finally {
      setState(() => _loading = false);
    }
  }

  Widget _buildCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    Color? color,
  }) {
    final cardColor = color ?? AppTheme.primaryColor;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cardColor.withOpacity(0.15),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: cardColor.withOpacity(0.4)),
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 28,
              backgroundColor: cardColor,
              child: Icon(icon, color: Colors.white, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(subtitle, style: const TextStyle(color: Colors.black54)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 18, color: Colors.grey),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = supabase.auth.currentUser;

    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: Text("👋 Welcome, $_studentName"),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              if (user != null) StudentSummaryTop(studentId: user.id),

              const SizedBox(height: 24),

              _buildCard(
                icon: Icons.school,
                title: "My Courses",
                subtitle: "Explore and continue learning",
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => StudentCoursesScreen(studentId: user!.id),
                    ),
                  );
                },
              ),

              const SizedBox(height: 16),

              _buildCard(
                icon: Icons.person,
                title: "My Teachers",
                subtitle: "View your teachers",
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) =>
                          StudentTeachersScreen(studentId: user!.id),
                    ),
                  );
                },
              ),

              const SizedBox(height: 16),

              _buildCard(
                icon: Icons.quiz,
                title: "My Quizzes",
                subtitle: "Attempt quizzes and track progress",
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => StudentQuizScreen(courseIds: _courseIds),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
// import 'package:flutter/material.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:techtalk/constants/app_theme.dart';
// import 'package:techtalk/screens/student/playful_student_dashboard.dart';
// import 'package:techtalk/screens/student/student_courses.dart';
// import 'package:techtalk/screens/student/student_quiz.dart';
// import 'package:techtalk/screens/student/student_teachers.dart';
// // import 'package:techtalk/widgets/student_summary_top.dart'; // 👈 added import

// class StudentHomeScreen extends StatefulWidget {
//   const StudentHomeScreen({super.key});

//   @override
//   State<StudentHomeScreen> createState() => _StudentHomeScreenState();
// }

// class _StudentHomeScreenState extends State<StudentHomeScreen> {
//   final _firestore = FirebaseFirestore.instance;
//   final _auth = FirebaseAuth.instance;

//   String _studentName = "Student";
//   List<String> _courseIds = [];
//   bool _loading = true;

//   @override
//   void initState() {
//     super.initState();
//     _loadStudentData();
//   }

//   Future<void> _loadStudentData() async {
//     try {
//       final user = _auth.currentUser;
//       if (user == null) return;

//       final doc = await _firestore.collection('users').doc(user.uid).get();
//       if (doc.exists && doc.data() != null) {
//         final data = doc.data()!;
//         setState(() {
//           _studentName = data['name'] ?? 'Student';
//           _courseIds = List<String>.from(data['courseIds'] ?? []);
//         });
//       }
//     } catch (e) {
//       e;
//     } finally {
//       setState(() => _loading = false);
//     }
//   }

//   Widget _buildCard({
//     required IconData icon,
//     required String title,
//     required String subtitle,
//     required VoidCallback onTap,
//     Color? color,
//   }) {
//     final cardColor = color ?? AppTheme.primaryColor;

//     return GestureDetector(
//       onTap: onTap,
//       child: Container(
//         padding: const EdgeInsets.all(16),
//         decoration: BoxDecoration(
//           color: cardColor.withOpacity(0.15),
//           borderRadius: BorderRadius.circular(20),
//           border: Border.all(color: cardColor.withOpacity(0.4)),
//         ),
//         child: Row(
//           children: [
//             CircleAvatar(
//               radius: 28,
//               backgroundColor: cardColor,
//               child: Icon(icon, color: Colors.white, size: 28),
//             ),
//             const SizedBox(width: 16),
//             Expanded(
//               child: Column(
//                 crossAxisAlignment: CrossAxisAlignment.start,
//                 children: [
//                   Text(title,
//                       style: const TextStyle(
//                           fontSize: 18, fontWeight: FontWeight.bold)),
//                   const SizedBox(height: 4),
//                   Text(subtitle,
//                       style: const TextStyle(color: Colors.black54)),
//                 ],
//               ),
//             ),
//             const Icon(Icons.arrow_forward_ios, size: 18, color: Colors.grey),
//           ],
//         ),
//       ),
//     );
//   }

//   @override
//   Widget build(BuildContext context) {
//     if (_loading) {
//       return const Scaffold(
//         body: Center(child: CircularProgressIndicator()),
//       );
//     }

//     return Scaffold(
//       backgroundColor: AppTheme.backgroundColor,
//       appBar: AppBar(
//         title: Text("👋 Welcome, $_studentName"),
//         backgroundColor: AppTheme.primaryColor,
//         foregroundColor: Colors.white,
//         elevation: 2,
//       ),
//       body: SingleChildScrollView( // 👈 allows smooth scroll if content grows
//         child: Padding(
//           padding: const EdgeInsets.all(16),
//           child: Column(
//             children: [
//               // 👇 added summary widget here
//               StudentSummaryTop(studentId: _auth.currentUser!.uid),
//               const SizedBox(height: 24),

//               _buildCard(
//                 icon: Icons.school,
//                 title: "My Courses",
//                 subtitle: "Explore and continue learning",
//                 onTap: () {
//                   Navigator.push(
//                     context,
//                     MaterialPageRoute(
//                       builder: (_) => StudentCoursesScreen(
//                         studentId: _auth.currentUser!.uid,
//                       ),
//                     ),
//                   );
//                 },
//                 color: AppTheme.primaryColor,
//               ),
//               const SizedBox(height: 16),

//               _buildCard(
//                 icon: Icons.person,
//                 title: "My Teachers",
//                 subtitle: "View your teachers",
//                 onTap: () {
//                   Navigator.push(
//                     context,
//                     MaterialPageRoute(
//                       builder: (_) => StudentTeachersScreen(
//                         studentId: _auth.currentUser!.uid,
//                       ),
//                     ),
//                   );
//                 },
//                 color: AppTheme.secondaryColor,
//               ),
//               const SizedBox(height: 16),

//               _buildCard(
//                 icon: Icons.quiz,
//                 title: "My Quizzes",
//                 subtitle: "Attempt quizzes and track progress",
//                 onTap: () {
//                   Navigator.push(
//                     context,
//                     MaterialPageRoute(
//                       builder: (_) =>
//                           StudentQuizScreen(courseIds: _courseIds),
//                     ),
//                   );
//                 },
//                 color: Colors.greenAccent,
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }
