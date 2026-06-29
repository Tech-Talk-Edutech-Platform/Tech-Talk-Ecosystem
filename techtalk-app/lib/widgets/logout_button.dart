import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:techtalk/services/role_manager.dart';
import 'package:techtalk/services/session_manager.dart';

Future<void> logout(BuildContext context) async {
  try {
    final supabase = Supabase.instance.client;

    await supabase.auth.signOut();

    await _cleanupSession();

    if (!context.mounted) return;

    Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
  } catch (_) {
    // optionally handle silently or show error UI
  }
}

Future<void> _cleanupSession() async {
  await RoleManager.clearRole();
  SessionManager.currentRole = null;
}
// // Signs out the current Firebase user and navigates to the login screen.
// // After successfully signing out, this function clears the navigation stack
// // and pushes the login route (`'/login'`), preventing the user from returning
// // to the previous screens.
// // It also clears the saved role from RoleManager and resets SessionManager.currentRole.
// // If sign-out fails, the error is caught and logged using `debugPrint`.
// // Requires a valid [BuildContext] for navigation.
// //
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:flutter/material.dart';
// import 'package:techtalk/services/role_manager.dart';
// import 'package:techtalk/services/session_manager.dart';

// Future<void> logout(BuildContext context) async {
//   try {
//     await FirebaseAuth.instance.signOut();

//     // clear cached role info
//     await _cleanupSession();

//     // Ensure the context is still valid before performing navigation
//     if (!context.mounted) return;

//     Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);

//     // debugPrint('User signed out successfully');
//   } catch (e) {
//     // debugPrint('Logout error: $e');
//   }
// }

// // Helper function to clean up session data (role, memory, etc.)
// Future<void> _cleanupSession() async {
//   await RoleManager.clearRole();
//   SessionManager.currentRole = null;
// }
