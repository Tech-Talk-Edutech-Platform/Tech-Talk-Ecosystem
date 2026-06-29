import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:techtalk/constants/user_roles.dart';
import 'package:techtalk/screens/Parent/parent_overview.dart';
import 'package:techtalk/screens/admin/admin_dashboard.dart';
import 'package:techtalk/screens/student/student_dashboard.dart';
import 'package:techtalk/screens/teacher/teacher_dashboard.dart';
import '../screens/guest_user.dart';
import 'role_manager.dart';

final supabase = Supabase.instance.client;

Future<Widget> getDashboardForUser(String email) async {
  final user = supabase.auth.currentUser;

  if (user == null) {
    return const NotRegisteredScreen();
  }

  final uid = user.id;

  final data = await supabase
      .from('users')
      .select('id, role, full_name')
      .eq('id', uid)
      .maybeSingle();

  // 🆕 Create user if missing
  if (data == null) {
    await supabase.from('users').insert({
      'id': uid,
      'email': email,
      'full_name': user.userMetadata?['full_name'] ?? 'User',
      'role': UserRoles.nonUser,
    });

    return const NotRegisteredScreen();
  }

  final role = (data['role'] ?? UserRoles.nonUser).toString();
  final name = (data['full_name'] ?? 'User').toString();

  await RoleManager.saveRole(role);

  // 🟡 Guest / blocked user
  if (role == UserRoles.nonUser) {
    return const NotRegisteredScreen();
  }

  switch (role) {
    case UserRoles.student:
      return StudentDashboard(studentId: uid, studentName: name);

    case UserRoles.tutor:
      return TeacherDashboard(teacherId: uid, teacherName: name);

    case UserRoles.owner:
    case UserRoles.operationsAdmin:
    case UserRoles.techAdmin:
      return const AdminDashboard();

    default:
      return const NotRegisteredScreen();
  }
}
// import 'package:flutter/material.dart';
// import 'package:supabase_flutter/supabase_flutter.dart';

// import 'package:techtalk/constants/user_roles.dart';
// import 'package:techtalk/screens/Parent/parent_overview.dart';
// import 'package:techtalk/screens/admin/admin_dashboard.dart';
// import 'package:techtalk/screens/student/student_dashboard.dart';
// import 'package:techtalk/screens/teacher/teacher_dashboard.dart';
// import '../screens/guest_user.dart';
// import 'role_manager.dart';

// final supabase = Supabase.instance.client;


// Future<Widget> getDashboardForUser(String email) async {
//   final user = supabase.auth.currentUser;

//   if (user == null) {
//     return const NotRegisteredScreen();
//   }

//   final uid = user.id;

//   final data = await supabase
//       .from('users')
//       .select('id, role, full_name')
//       .eq('id', uid)
//       .maybeSingle();

//   // 🆕 If no record exists → create guest user
//   if (data == null) {
//     await supabase.from('users').insert({
//       'id': uid,
//       'email': email,
//       'full_name': user.userMetadata?['full_name'] ?? 'User',
//       'role': 'non_user',
//     });

//     return const NotRegisteredScreen();
//   }

//   final String role = (data['role'] ?? 'non_user').toString();
//   final String name = (data['full_name'] ?? 'User').toString();

//   await RoleManager.saveRole(role);

//   // 🟡 Guest
//   if (role == 'non_user') {
//     return const NotRegisteredScreen();
//   }

//   switch (role) {
//     case 'student':
//       return StudentDashboard(studentId: uid, studentName: name);

//     case 'tutor':
//       return TeacherDashboard(teacherId: uid, teacherName: name);

//     case 'owner':
//       return const AdminDashboard();
//     case 'operations_admin':
//     case 'tech_admin':
//     case 'non_user':
//     default:
//       return const NotRegisteredScreen();
//   }
// }
// // // // getDashboardForUser.dart
// // // //
// // // // Determines and returns the appropriate dashboard widget for the current user
// // // // based on their single role stored in Firestore and persisted with RoleManager.
// // // // - Creates a guest user doc if none exists
// // // // - Logs guest visits once per day
// // // // - Supports roles: student, teacher, admin, parent (optional), and guest
// // // // - Persists role locally, but Firestore is always the source of truth

// // // import 'package:flutter/material.dart';
// // // import 'package:supabase_flutter/supabase_flutter.dart';

// // // // your dashboards
// // // import 'package:techtalk/screens/admin/admin_dashboard.dart';
// // // import 'package:techtalk/screens/student/student_dashboard.dart';
// // // import 'package:techtalk/screens/teacher/teacher_dashboard.dart';
// // // import '../screens/guest_user.dart';

// // // Future<Widget> getDashboardForUser(String email) async {
// // //   final supabase = Supabase.instance.client;

// // //   final user = supabase.auth.currentUser;

// // //   if (user == null) {
// // //     return const NotRegisteredScreen();
// // //   }

// // //   final userId = user.id;

// // //   // 🔥 Fetch role from Supabase (THIS is what you asked)
// // //   final res = await supabase
// // //       .from('users')
// // //       .select('role, full_name')
// // //       .eq('id', userId)
// // //       .single();

// // //   final role = res['role'];
// // //   final name = res['full_name'] ?? "User";

// // //   // 🚀 Routing
// // //   if (role == 'student') {
// // //     return StudentDashboard(studentId: userId, studentName: name);
// // //   }

// // //   if (role == 'tutor') {
// // //     return TeacherDashboard(teacherId: userId, teacherName: name);
// // //   }

// // //   if (role == 'operations_admin' || role == 'tech_admin' || role == 'owner') {
// // //     return const AdminDashboard();
// // //   }

// // //   // 👇 Default (non_user)
// // //   return const NotRegisteredScreen();
// // // }
// // import 'package:flutter/material.dart';
// // import 'package:firebase_auth/firebase_auth.dart';
// // import 'package:cloud_firestore/cloud_firestore.dart';
// // import 'package:techtalk/constants/user_roles.dart';
// // import 'package:techtalk/screens/Parent/parent_overview.dart';
// // import 'package:techtalk/screens/admin/admin_dashboard.dart';
// // import 'package:techtalk/screens/student/student_dashboard.dart';
// // import 'package:techtalk/screens/teacher/teacher_dashboard.dart';
// // import '../screens/guest_user.dart';
// // import 'role_manager.dart';

// // Future<Widget> getDashboardForUser(String email) async {
// //   final firestore = FirebaseFirestore.instance;
// //   final user = FirebaseAuth.instance.currentUser!;
// //   final uid = user.uid;
// //   final docRef = firestore.collection('users').doc(uid);
// //    // ✅ Force refresh the token
// //   await user.getIdToken(true);
  
// //   final doc = await docRef.get();

// //   if (doc.exists) {
// //     final data = doc.data()!;
// //     final String role = (data['role'] ?? UserRoles.guest).toString();

// //     // 🔹 Debug print
// //     // if (kDebugMode) {
// //     //   print("🔍 Firestore role for $email (uid=$uid): $role");
// //     // }

// //     // 🔹 Firestore role is always source of truth
// //     await RoleManager.saveRole(role);

// //     if (role == UserRoles.guest) {
// //       // if (kDebugMode) {
// //       //   print("➡️ Routing to NotRegisteredScreen (guest)");
// //       // }
// //       return const NotRegisteredScreen();
// //     }
// //   switch (role) {
// //   case UserRoles.student:
// //     // if (kDebugMode) {
// //     //   print("➡️ Routing to StudentDashboard");
// //     // }

// //     // Get the current Firebase user ID
// //     final userId = FirebaseAuth.instance.currentUser?.uid;

// //     if (userId != null && userId.isNotEmpty) {
// //       // Pass the userId to StudentDashboard
// //       final doc =
// //         await FirebaseFirestore.instance.collection('users').doc(userId).get();
// //       return StudentDashboard(studentId: userId, studentName: doc['name'],);
// //     } else {
// //       // // Optional: handle null UID
// //       // if (kDebugMode) {
// //       //   print('[ERROR] No logged-in student UID found.');
// //       // }
// //       return Scaffold(
// //         body: Center(child: Text('Error: No student logged in')),
// //       );
// //     }

// //       case UserRoles.parent:
// //         // if (kDebugMode) {
// //         //   print("➡️ Routing to ParentDashboard");
// //         // }
// //         // return const ParentsDashboard();
// //         return ParentsOverviewScreen ();
// //       case UserRoles.teacher:
// //         // if (kDebugMode) {
// //         //   print("➡️ Routing to TeacherDashboard");
// //         // }
// //         return TeacherDashboard(teacherId: uid, teacherName:  doc['name'],);
        
// //       case UserRoles.admin:
// //         // if (kDebugMode) {
// //         //   print("➡️ Routing to AdminDashboard");
// //         // }
// //         return const AdminDashboard();
// //       default:
// //         // if (kDebugMode) {
// //         //   print("⚠️ Unknown role: $role → NotRegisteredScreen");
// //         // }
// //         return const NotRegisteredScreen();
// //     }
// //   }

// //   // 🔹 New user → create guest record
// //   // if (kDebugMode) {
// //   //   print("🆕 No Firestore doc found. Creating guest record for $email (uid=$uid)");
// //   // }
// //   await docRef.set({
// //     'uid': uid,
// //     'email': email,
// //     'name': user.displayName ?? 'Guest',
// //     'role': UserRoles.guest,
// //     'createdAt': FieldValue.serverTimestamp(),
// //   });

// //   // 🔹 Log guest visit once per day
// //   final today = DateTime.now();
// //   final startOfDay = DateTime(today.year, today.month, today.day);
// //   final existingVisit = await firestore
// //       .collection('guest_visits')
// //       .where('uid', isEqualTo: uid)
// //       .where('timestamp',
// //           isGreaterThanOrEqualTo: Timestamp.fromDate(startOfDay))
// //       .get();

// //   if (existingVisit.docs.isEmpty) {
// //     await firestore.collection('guest_visits').add({
// //       'uid': uid,
// //       'email': email,
// //       'timestamp': FieldValue.serverTimestamp(),
// //     });
// //     // if (kDebugMode) {
// //     //   print("📌 Guest visit logged for $email");
// //     // }
// //   }

// //   return const NotRegisteredScreen();
// // }

