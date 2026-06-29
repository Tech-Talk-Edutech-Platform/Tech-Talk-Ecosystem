// lib/screens/teacher/teacher_dashboard.dart

import 'package:flutter/material.dart';
import 'package:techtalk/screens/teacher/overview.dart';
import 'package:techtalk/screens/teacher/project_upload.dart';
import 'package:techtalk/screens/teacher/quiz_upload.dart';
import 'package:techtalk/screens/teacher/teacher_courses.dart';
import 'package:techtalk/screens/teacher/teacher_parents_screen.dart';

class TeacherDashboard extends StatefulWidget {
  final String teacherId;
  final String teacherName;

  const TeacherDashboard({
    super.key,
    required this.teacherId,
    required this.teacherName,
  });

  @override
  State<TeacherDashboard> createState() => _TeacherDashboardState();
}

class _TeacherDashboardState extends State<TeacherDashboard> {
  int _currentIndex = 0;

  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();

    _screens = [
      TeacherDashboardHeader(
        teacherId: widget.teacherId,
        teacherName: widget.teacherName,
      ),

      TeacherProjectsScreen(teacherId: widget.teacherId),

      QuizUploadScreen(teacherId: widget.teacherId),

      TeacherCoursesScreen(teacherId: widget.teacherId),

      TeacherParentsScreen(teacherId: widget.teacherId),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),

      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.orangeAccent,
        unselectedItemColor: Colors.grey,

        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },

        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_rounded),
            label: 'Home',
          ),

          BottomNavigationBarItem(
            icon: Icon(Icons.folder_copy_rounded),
            label: 'Projects',
          ),

          BottomNavigationBarItem(
            icon: Icon(Icons.quiz_rounded),
            label: 'Quizzes',
          ),

          BottomNavigationBarItem(
            icon: Icon(Icons.menu_book_rounded),
            label: 'Courses',
          ),

          BottomNavigationBarItem(
            icon: Icon(Icons.family_restroom_rounded),
            label: 'Parents',
          ),
        ],
      ),
    );
  }
}

// import 'package:flutter/material.dart';
// import 'package:techtalk/screens/teacher/overview.dart';
// import 'package:techtalk/screens/teacher/project_upload.dart';
// import 'package:techtalk/screens/teacher/quiz_upload.dart';
// import 'package:techtalk/screens/teacher/teacher_courses.dart';
// import 'package:techtalk/screens/teacher/teacher_parents_screen.dart';

// class TeacherDashboard extends StatefulWidget {
//   final String teacherId;
//   final String teacherName;

//   const TeacherDashboard({super.key, required this.teacherId, required this.teacherName});

//   @override
//   State<TeacherDashboard> createState() => _TeacherDashboardState();
// }

// class _TeacherDashboardState extends State<TeacherDashboard> {
//   int _currentIndex = 0;

//   late final List<Widget> _screens;

//   @override
//   void initState() {
//     super.initState();
//     _screens = [
      
//       TeacherDashboardHeader(teacherId: widget.teacherId, teacherName: widget.teacherName,),
//       TeacherProjectsScreen(teacherId: widget.teacherId),
//       QuizUploadScreen(teacherId: widget.teacherId,),
//       TeacherCoursesScreen(teacherId: widget.teacherId,),
//       TeacherParentsScreen(teacherId: widget.teacherId,),
      
//     ];
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       // appBar: TeacherAppBar(teacherName: widget.teacherName),
//       body: _screens[_currentIndex],
//       bottomNavigationBar: BottomNavigationBar(
//         currentIndex: _currentIndex,
//         onTap: (index) => setState(() => _currentIndex = index),
//         type: BottomNavigationBarType.fixed,
//         selectedItemColor: Colors.orangeAccent,
//         unselectedItemColor: Colors.grey,
//         items: const [
//             BottomNavigationBarItem(
//             icon: Icon(Icons.home),
//             label: 'Home',
//           ),
//           BottomNavigationBarItem(
//             icon: Icon(Icons.file_copy),
//             label: 'Projects',
//           ),
//           BottomNavigationBarItem(
//             icon: Icon(Icons.quiz),
//             label: 'Quizzes', ),
//           BottomNavigationBarItem(
//             icon: Icon(Icons.menu_book),
//             label: 'Courses',
//           ),      
//           BottomNavigationBarItem(
//             icon: Icon(Icons.school),
//             label: 'Parents',
//           ),
          
           
//           // BottomNavigationBarItem(
//           //   icon: Icon(Icons.emoji_events),
//           //   label: 'Statistics',
//           // ),
//         ],
//       ),
//     );
//   }
// }
