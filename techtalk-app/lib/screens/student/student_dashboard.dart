import 'package:flutter/material.dart';

import 'package:techtalk/screens/student/home.dart';
import 'package:techtalk/screens/student/course_notes.dart';
import 'package:techtalk/screens/student/project_instructions.dart';
import 'package:techtalk/screens/student/student_quiz.dart';
import 'package:techtalk/screens/student/student_teachers.dart';

class StudentDashboard extends StatefulWidget {
  final String studentId;
  final String studentName;

  const StudentDashboard({
    super.key,
    required this.studentId,
    required this.studentName,
  });

  @override
  State<StudentDashboard> createState() => _StudentDashboardState();
}

class _StudentDashboardState extends State<StudentDashboard> {
  int _index = 0;

  late final List<Widget> screens;

  @override
  void initState() {
    super.initState();

    screens = [
      StudentHomeScreen(),
      CourseNotesFlipBook(),
      const CourseProjectsPanel(),
      StudentQuizScreen(),
      StudentTeachersScreen(studentId: widget.studentId),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.studentName),
        backgroundColor: Colors.orangeAccent,
      ),
      body: screens[_index],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.orange,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "Home"),
          BottomNavigationBarItem(icon: Icon(Icons.book), label: "Notes"),
          BottomNavigationBarItem(icon: Icon(Icons.code), label: "Projects"),
          BottomNavigationBarItem(icon: Icon(Icons.quiz), label: "Quiz"),
          BottomNavigationBarItem(icon: Icon(Icons.school), label: "Teachers"),
        ],
      ),
    );
  }
}

// import 'package:flutter/material.dart';
// import 'package:techtalk/screens/student/course_notes.dart';
// import 'package:techtalk/screens/student/home.dart';
// import 'package:techtalk/screens/student/profile.dart';
// import 'package:techtalk/screens/student/project_instructions.dart';
// import 'package:techtalk/screens/student/student_quiz.dart';
// import 'package:techtalk/screens/student/student_teachers.dart';

// class StudentDashboard extends StatefulWidget {
//   final String studentId;
//   final String studentName;

//   const StudentDashboard({super.key, required this.studentId, required this.studentName});

//   @override
//   State<StudentDashboard> createState() => _StudentDashboardState();
// }

// class _StudentDashboardState extends State<StudentDashboard> {
//   int _currentIndex = 0;

//   late final List<Widget> _screens;

//   @override
//   void initState() {
//     super.initState();
//     _screens = [
//       // HomeScreen(studentId: widget.studentId,),
//       StudentHomeScreen (),
//       CourseNotesFlipBook(),
//       CourseProjectsPanel(),
//       StudentQuizScreen(),
//       StudentTeachersScreen(studentId: widget.studentId),
//       // StudentSummaryTop(studentId: widget.studentId,)
//     ];
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: StudentAppBar(studentName: widget.studentName),
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
//             icon: Icon(Icons.menu_book),
//             label: 'Notes',
//           ),
//           BottomNavigationBarItem(
//             icon: Icon(Icons.file_copy),
//             label: 'Projects',
//           ),
//           BottomNavigationBarItem(
//             icon: Icon(Icons.quiz),
//             label: 'Quizzes',
//           ),
//           BottomNavigationBarItem(
//             icon: Icon(Icons.school),
//             label: 'Teachers',
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

