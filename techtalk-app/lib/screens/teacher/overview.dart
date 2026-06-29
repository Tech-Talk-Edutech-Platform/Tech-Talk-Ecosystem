import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:techtalk/screens/teacher/profile.dart';
import 'package:techtalk/screens/teacher/project_upload.dart';
import 'package:techtalk/screens/teacher/quiz_upload.dart';
import 'package:techtalk/screens/teacher/student_list.dart';
import 'package:techtalk/screens/teacher/teacher_courses.dart';
import 'package:techtalk/screens/teacher/teacher_parents_screen.dart';

class TeacherDashboardHeader extends StatefulWidget {
  final String teacherId;
  final String teacherName;

  const TeacherDashboardHeader({
    super.key,
    required this.teacherId,
    required this.teacherName,
  });

  @override
  State<TeacherDashboardHeader> createState() => _TeacherDashboardHeaderState();
}

class _TeacherDashboardHeaderState extends State<TeacherDashboardHeader> {
  final supabase = Supabase.instance.client;

  int? courseCount;
  int? studentCount;
  int? parentCount;

  @override
  void initState() {
    super.initState();
    _loadCounts();
  }

  Future<void> _loadCounts() async {
    try {
      final courses = await supabase.from('courses').select('id');

      final students = await supabase
          .from('users')
          .select('id')
          .eq('role', 'student');

      final parents = await supabase
          .from('users')
          .select('id')
          .eq('role', 'parent');

      setState(() {
        courseCount = courses.length;
        studentCount = students.length;
        parentCount = parents.length;
      });
    } catch (e) {
      debugPrint("Error loading counts: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final crossAxisCount = width < 600 ? 2 : 3;

    final topItems = [
      _DashboardItem(
        title: 'My Courses',
        icon: Icons.menu_book,
        color: Colors.orangeAccent,
        count: courseCount,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => TeacherCoursesScreen(teacherId: widget.teacherId),
          ),
        ),
      ),
      _DashboardItem(
        title: 'Students',
        icon: Icons.people_alt,
        color: Colors.lightBlueAccent,
        count: studentCount,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) =>
                TeacherStudentMessagingScreen(teacherId: widget.teacherId),
          ),
        ),
      ),
      _DashboardItem(
        title: 'Parents',
        icon: Icons.family_restroom,
        color: Colors.purpleAccent,
        count: parentCount,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => TeacherParentsScreen(teacherId: widget.teacherId),
          ),
        ),
      ),
    ];

    final bottomItems = [
      _DashboardItem(
        title: 'Projects',
        icon: Icons.build_circle_rounded,
        color: Colors.greenAccent,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => TeacherProjectsScreen(teacherId: widget.teacherId),
          ),
        ),
      ),
      _DashboardItem(
        title: 'Quizzes',
        icon: Icons.quiz_rounded,
        color: Colors.deepOrangeAccent,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => QuizUploadScreen(teacherId: widget.teacherId),
          ),
        ),
      ),
      _DashboardItem(
        title: 'Notes',
        icon: Icons.sticky_note_2_rounded,
        color: Colors.amberAccent,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => TeacherCoursesScreen(teacherId: widget.teacherId),
          ),
        ),
      ),
    ];

    return Scaffold(
      appBar: TeacherAppBar(teacherName: widget.teacherName),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            GridView.count(
              crossAxisCount: crossAxisCount,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: topItems.map((e) => _DashboardCard(item: e)).toList(),
            ),
            const SizedBox(height: 16),
            GridView.count(
              crossAxisCount: crossAxisCount,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: bottomItems
                  .map((e) => _DashboardCard(item: e))
                  .toList(),
            ),
          ],
        ),
      ),
    );
  }
}

class _DashboardItem {
  final String title;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
  final int? count;

  _DashboardItem({
    required this.title,
    required this.icon,
    required this.color,
    required this.onTap,
    this.count,
  });
}

class _DashboardCard extends StatelessWidget {
  final _DashboardItem item;

  const _DashboardCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: item.onTap,
      child: Card(
        color: item.color.withOpacity(0.15),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(item.icon, size: 30),
            Text(item.title),
            if (item.count != null) Text("${item.count}"),
          ],
        ),
      ),
    );
  }
}
// // lib/widgets/teacher_dashboard_header.dart
// import 'package:flutter/material.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:techtalk/screens/teacher/profile.dart';
// import 'package:techtalk/screens/teacher/project_upload.dart';
// import 'package:techtalk/screens/teacher/quiz_upload.dart';
// import 'package:techtalk/screens/teacher/student_list.dart';
// import 'package:techtalk/screens/teacher/teacher_courses.dart';
// import 'package:techtalk/screens/teacher/teacher_parents_screen.dart';

// class TeacherDashboardHeader extends StatefulWidget {
//   final String teacherId;
//   final String teacherName;

//   const TeacherDashboardHeader({
//     super.key,
//     required this.teacherId,
//     required this.teacherName,
//   });

//   @override
//   State<TeacherDashboardHeader> createState() => _TeacherDashboardHeaderState();
// }

// class _TeacherDashboardHeaderState extends State<TeacherDashboardHeader> {
//   int? courseCount;
//   int? studentCount;
//   int? parentCount;

//   @override
//   void initState() {
//     super.initState();
//     _loadCounts();
//   }

//   Future<void> _loadCounts() async {
//     try {
//       final coursesSnap = await FirebaseFirestore.instance
//           .collection('courses')
//           .where('teacherId', isEqualTo: widget.teacherId)
//           .get();

//       final studentsSnap = await FirebaseFirestore.instance
//           .collection('users')
//           .where('role', isEqualTo: 'student')
//           .get();

//       final parentsSnap = await FirebaseFirestore.instance
//           .collection('users')
//           .where('role', isEqualTo: 'parent')
//           .get();

//       setState(() {
//         courseCount = coursesSnap.docs.length;
//         studentCount = studentsSnap.docs.length;
//         parentCount = parentsSnap.docs.length;
//       });
//     } catch (e) {
//       // debugPrint("Error loading counts: $e");
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     // Force exactly 2 even columns on mobile (<600px), else 3 on larger screens
//     final width = MediaQuery.of(context).size.width;
//     final crossAxisCount = width < 600 ? 2 : 3;

//     // --- Top three items (with counts) ---
//     final topItems = [
//       _DashboardItem(
//         title: 'My Courses',
//         icon: Icons.menu_book,
//         color: Colors.orangeAccent,
//         count: courseCount,
//         onTap: () => Navigator.push(
//           context,
//           MaterialPageRoute(
//             builder: (_) => TeacherCoursesScreen(teacherId: widget.teacherId),
//           ),
//         ),
//       ),
//       _DashboardItem(
//         title: 'Students',
//         icon: Icons.people_alt,
//         color: Colors.lightBlueAccent,
//         count: studentCount,
//         onTap: () => Navigator.push(
//           context,
//           MaterialPageRoute(
//             builder: (_) =>
//                 TeacherStudentMessagingScreen(teacherId: widget.teacherId),
//           ),
//         ),
//       ),
//       _DashboardItem(
//         title: 'Parents',
//         icon: Icons.family_restroom,
//         color: Colors.purpleAccent,
//         count: parentCount,
//         onTap: () => Navigator.push(
//           context,
//           MaterialPageRoute(
//             builder: (_) => TeacherParentsScreen(teacherId: widget.teacherId),
//           ),
//         ),
//       ),
//     ];

//     // --- Remaining items ---
//     final bottomItems = [
//       _DashboardItem(
//         title: 'Projects',
//         icon: Icons.build_circle_rounded,
//         color: Colors.greenAccent,
//         onTap: () => Navigator.push(
//           context,
//           MaterialPageRoute(
//             builder: (_) => TeacherProjectsScreen(teacherId: widget.teacherId),
//           ),
//         ),
//       ),
//       _DashboardItem(
//         title: 'Quizzes',
//         icon: Icons.quiz_rounded,
//         color: Colors.deepOrangeAccent,
//         onTap: () => Navigator.push(
//           context,
//           MaterialPageRoute(
//             builder: (_) => QuizUploadScreen(teacherId: widget.teacherId),
//           ),
//         ),
//       ),
//       _DashboardItem(
//         title: 'Notes',
//         icon: Icons.sticky_note_2_rounded,
//         color: Colors.amberAccent,
//         onTap: () => Navigator.push(
//           context,
//           MaterialPageRoute(
//             builder: (_) => TeacherCoursesScreen(teacherId: widget.teacherId),
//           ),
//         ),
//       ),
//     ];

//     return Scaffold(
//       appBar: TeacherAppBar(teacherName: widget.teacherName),
//       body: Container(
//         color: Colors.white,
//         padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
//         child: SingleChildScrollView(
//           child: Column(
//             children: [
//               const SizedBox(height: 8),
//               GridView.count(
//                 crossAxisCount: crossAxisCount,
//                 physics: const NeverScrollableScrollPhysics(),
//                 shrinkWrap: true,
//                 childAspectRatio: width < 600
//                     ? 1.05
//                     : 1.15, // slightly smaller cards
//                 crossAxisSpacing: 10,
//                 mainAxisSpacing: 10,
//                 children: topItems
//                     .map((item) => _DashboardCard(item: item))
//                     .toList(),
//               ),
//               const SizedBox(height: 16),
//               GridView.count(
//                 crossAxisCount: crossAxisCount,
//                 physics: const NeverScrollableScrollPhysics(),
//                 shrinkWrap: true,
//                 childAspectRatio: width < 600 ? 1.05 : 1.15,
//                 crossAxisSpacing: 10,
//                 mainAxisSpacing: 10,
//                 children: bottomItems
//                     .map((item) => _DashboardCard(item: item))
//                     .toList(),
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }

// class _DashboardItem {
//   final String title;
//   final IconData icon;
//   final Color color;
//   final VoidCallback onTap;
//   final int? count;

//   _DashboardItem({
//     required this.title,
//     required this.icon,
//     required this.color,
//     required this.onTap,
//     this.count,
//   });
// }

// class _DashboardCard extends StatelessWidget {
//   final _DashboardItem item;

//   const _DashboardCard({required this.item});

//   @override
//   Widget build(BuildContext context) {
//     final isLoading =
//         item.count == null &&
//         (item.title == 'My Courses' ||
//             item.title == 'Students' ||
//             item.title == 'Parents');

//     return GestureDetector(
//       onTap: item.onTap,
//       child: AnimatedContainer(
//         duration: const Duration(milliseconds: 400),
//         curve: Curves.easeInOut,
//         decoration: BoxDecoration(
//           color: item.color.withOpacity(0.15),
//           borderRadius: BorderRadius.circular(14),
//           border: Border.all(color: item.color.withOpacity(0.4), width: 1),
//           boxShadow: [
//             BoxShadow(
//               color: item.color.withOpacity(0.25),
//               blurRadius: 5,
//               offset: const Offset(0, 3),
//             ),
//           ],
//         ),
//         child: Column(
//           mainAxisAlignment: MainAxisAlignment.center,
//           children: [
//             CircleAvatar(
//               radius: 22,
//               backgroundColor: item.color.withOpacity(0.9),
//               child: Icon(item.icon, color: Colors.white, size: 24),
//             ),
//             const SizedBox(height: 8),
//             Text(
//               item.title,
//               textAlign: TextAlign.center,
//               style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
//             ),
//             const SizedBox(height: 4),
//             if (isLoading)
//               const SizedBox(
//                 height: 18,
//                 width: 18,
//                 child: CircularProgressIndicator(strokeWidth: 2),
//               )
//             else if (item.count != null)
//               Text(
//                 '${item.count}',
//                 style: TextStyle(
//                   color: item.color.withOpacity(0.9),
//                   fontSize: 13,
//                   fontWeight: FontWeight.w600,
//                 ),
//               ),
//           ],
//         ),
//       ),
//     );
//   }
// }

// // // lib/widgets/teacher_dashboard_header.dart
// // import 'package:flutter/material.dart';
// // import 'package:techtalk/constants/app_theme.dart';
// // import 'package:techtalk/screens/teacher/project_upload.dart';
// // import 'package:techtalk/screens/teacher/quiz_upload.dart';
// // import 'package:techtalk/screens/teacher/student_list.dart';
// // import 'package:techtalk/screens/teacher/teacher_courses.dart';
// // import 'package:techtalk/screens/teacher/teacher_parents_screen.dart';

// // class TeacherDashboardHeader extends StatelessWidget {
// //   final String teacherId;
// //   final String teacherName;

// //   const TeacherDashboardHeader({
// //     super.key,
// //     required this.teacherId,
// //     required this.teacherName,
// //   });

// //   @override
// //   Widget build(BuildContext context) {
// //     final items = [
// //       _DashboardItem(
// //         title: 'My Courses',
// //         icon: Icons.menu_book,
// //         color: Colors.orangeAccent,
// //         onTap: () => Navigator.push(
// //           context,
// //           MaterialPageRoute(
// //             builder: (_) => TeacherCoursesScreen(teacherId: teacherId),
// //           ),
// //         ),
// //       ),
// //       _DashboardItem(
// //         title: 'Students',
// //         icon: Icons.people_alt,
// //         color: Colors.lightBlueAccent,
// //         onTap: () => Navigator.push(
// //           context,
// //           MaterialPageRoute(
// //             builder: (_) =>
// //                 TeacherStudentMessagingScreen(teacherId: teacherId),
// //           ),
// //         ),
// //       ),
// //       _DashboardItem(
// //         title: 'Parents',
// //         icon: Icons.family_restroom,
// //         color: Colors.purpleAccent,
// //         onTap: () => Navigator.push(
// //           context,
// //           MaterialPageRoute(
// //             builder: (_) => TeacherParentsScreen(teacherId: teacherId),
// //           ),
// //         ),
// //       ),
// //       _DashboardItem(
// //         title: 'Projects',
// //         icon: Icons.build_circle_rounded,
// //         color: Colors.greenAccent,
// //         onTap: () => Navigator.push(
// //           context,
// //           MaterialPageRoute(
// //             builder: (_) => TeacherProjectsScreen(teacherId: teacherId),
            
// //           ),
// //         ),
// //       ),
// //       _DashboardItem(
// //         title: 'Quizzes',
// //         icon: Icons.quiz_rounded,
// //         color: Colors.deepOrangeAccent,
// //         onTap: () => Navigator.push(
// //           context,
// //           MaterialPageRoute(
// //             builder: (_) =>  QuizUploadScreen(teacherId:teacherId,),
           
// //           ),
// //         ),
// //       ),
// //       _DashboardItem(
// //         title: 'Notes',
// //         icon: Icons.sticky_note_2_rounded,
// //         color: Colors.amberAccent,
// //         onTap: () => Navigator.push(
// //           context,
// //           MaterialPageRoute(
// //             builder: (_) => 
    
// //       TeacherCoursesScreen(teacherId: teacherId,),

// //           ),
// //         ),
// //       ),
// //     ];

// //     return Scaffold(
// //       // appBar: AppBar(
// //       //   title: Text("👋 Welcome, $teacherName"),
// //       //   backgroundColor: AppTheme.primaryColor,
// //       //   foregroundColor: Colors.white,
// //       //   elevation: 2,
// //       // ),
// //       body: Container(
// //         color: Colors.white,
// //         child: Column(
// //           children: [
// //             const SizedBox(height: 12),
// //             Padding(
// //               padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
// //               child: Text(
// //                 "Quick Actions",
// //                 style: TextStyle(
// //                   color: Colors.grey[700],
// //                   fontSize: 16,
// //                   fontWeight: FontWeight.bold,
// //                 ),
// //               ),
// //             ),
// //             Expanded(
// //               child: GridView.count(
// //                 crossAxisCount: 2,
// //                 padding:
// //                     const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
// //                 crossAxisSpacing: 16,
// //                 mainAxisSpacing: 16,
// //                 children: items
// //                     .map(
// //                       (item) => GestureDetector(
// //                         onTap: item.onTap,
// //                         child: Container(
// //                           decoration: BoxDecoration(
// //                             color: item.color.withOpacity(0.2),
// //                             borderRadius: BorderRadius.circular(20),
// //                             border: Border.all(
// //                                 color: item.color.withOpacity(0.5), width: 1),
// //                             boxShadow: [
// //                               BoxShadow(
// //                                 color: item.color.withOpacity(0.3),
// //                                 blurRadius: 8,
// //                                 offset: const Offset(0, 4),
// //                               ),
// //                             ],
// //                           ),
// //                           child: Column(
// //                             mainAxisAlignment: MainAxisAlignment.center,
// //                             children: [
// //                               CircleAvatar(
// //                                 radius: 30,
// //                                 backgroundColor: item.color.withOpacity(0.9),
// //                                 child: Icon(item.icon,
// //                                     color: Colors.white, size: 30),
// //                               ),
// //                               const SizedBox(height: 10),
// //                               Text(
// //                                 item.title,
// //                                 textAlign: TextAlign.center,
// //                                 style: const TextStyle(
// //                                   fontSize: 15,
// //                                   fontWeight: FontWeight.bold,
// //                                 ),
// //                               ),
// //                             ],
// //                           ),
// //                         ),
// //                       ),
// //                     )
// //                     .toList(),
// //               ),
// //             ),
// //           ],
// //         ),
// //       ),
// //     );
// //   }
// // }

// // class _DashboardItem {
// //   final String title;
// //   final IconData icon;
// //   final Color color;
// //   final VoidCallback onTap;

// //   _DashboardItem({
// //     required this.title,
// //     required this.icon,
// //     required this.color,
// //     required this.onTap,
// //   });
// // }
