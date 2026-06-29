import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:techtalk/screens/login.dart';
import 'package:techtalk/services/user_router.dart';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<AuthState>(
      stream: Supabase.instance.client.auth.onAuthStateChange,
      builder: (context, snapshot) {
        final session = Supabase.instance.client.auth.currentSession;

        if (session == null) {
          return const LoginScreen();
        }

        final user = session.user;

        return FutureBuilder<Widget>(
          future: getDashboardForUser(user.email ?? "noemail"),
          builder: (context, dashboardSnapshot) {
            if (dashboardSnapshot.connectionState == ConnectionState.waiting) {
              return const Scaffold(
                body: Center(child: CircularProgressIndicator()),
              );
            }

            if (dashboardSnapshot.hasError) {
              return Scaffold(
                body: Center(child: Text("Error: ${dashboardSnapshot.error}")),
              );
            }

            return dashboardSnapshot.data!;
          },
        );
      },
    );
  }
}
// // import 'package:flutter/material.dart';
// // import 'package:supabase_flutter/supabase_flutter.dart';
// // import 'package:techtalk/screens/login.dart';
// // import '../services/user_router.dart';

// // class AuthGate extends StatelessWidget {
// //   const AuthGate({super.key});

// //   @override
// //   Widget build(BuildContext context) {
// //     final supabase = Supabase.instance.client;

// //     return StreamBuilder<AuthState>(
// //       stream: supabase.auth.onAuthStateChange,
// //       builder: (context, snapshot) {
// //         final session = supabase.auth.currentSession;

// //         if (session == null) {
// //           return const LoginScreen();
// //         }

// //         return FutureBuilder<Widget>(
// //           future: getDashboardForUser(session.user.email ?? "noemail"),
// //           builder: (context, dashboardSnapshot) {
// //             if (dashboardSnapshot.connectionState == ConnectionState.waiting) {
// //               return const Scaffold(
// //                 body: Center(child: CircularProgressIndicator()),
// //               );
// //             }

// //             return dashboardSnapshot.data!;
// //           },
// //         );
// //       },
// //     );
// //   }
// // }
// import 'package:flutter/material.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:techtalk/screens/login.dart';
// import 'package:techtalk/services/user_router.dart';

// class AuthGate extends StatelessWidget {
//   const AuthGate({super.key});

//   @override
//   Widget build(BuildContext context) {
//     return StreamBuilder<User?>(
//       stream: FirebaseAuth.instance.authStateChanges(),
//       builder: (context, snapshot) {
//         if (snapshot.connectionState == ConnectionState.waiting) {
//           return const Scaffold(
//             body: Center(child: CircularProgressIndicator()),
//           );
//         }

//         if (!snapshot.hasData) {
//           return const LoginScreen();
//         }

//         final user = snapshot.data!;
//         return FutureBuilder<Widget>(
//           future: getDashboardForUser(user.email ?? "noemail"),
//           builder: (context, dashboardSnapshot) {
//             if (dashboardSnapshot.connectionState ==
//                 ConnectionState.waiting) {
//               return const Scaffold(
//                 body: Center(child: CircularProgressIndicator()),
//               );
//             }
//             if (dashboardSnapshot.hasError) {
//               return Scaffold(
//                 body: Center(child: Text("Error: ${dashboardSnapshot.error}")),
//               );
//             }
//             return dashboardSnapshot.data!;
//           },
//         );
//       },
//     );
//   }
// }
