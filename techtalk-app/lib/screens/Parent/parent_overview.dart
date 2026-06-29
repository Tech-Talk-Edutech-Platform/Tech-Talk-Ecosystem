// lib/screens/parent/parents_overview.dart

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:techtalk/screens/Parent/parent_children_progress.dart';
import 'package:techtalk/screens/Parent/parent_dashboard.dart';

class ParentsOverviewScreen extends StatelessWidget {
  const ParentsOverviewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final parentId = Supabase.instance.client.auth.currentUser?.id;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),

      body: parentId == null
          ? const Center(
              child: Text(
                "Parent not logged in",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            )
          : SafeArea(
              child: RefreshIndicator(
                onRefresh: () async {
                  await Future.delayed(const Duration(milliseconds: 600));
                },

                child: ListView(
                  padding: EdgeInsets.zero,

                  children: [
                    /// ===============================
                    /// TOP DASHBOARD
                    /// ===============================
                    SizedBox(
                      height: MediaQuery.of(context).size.height * 0.82,
                      child: const ParentsDashboard(),
                    ),

                    const SizedBox(height: 10),

                    /// ===============================
                    /// CHILDREN PROGRESS
                    /// ===============================
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: ParentChildrenProgress(parentId: parentId),
                    ),

                    const SizedBox(height: 30),
                  ],
                ),
              ),
            ),
    );
  }
}
// // lib/screens/parent/parents_overview.dart
// import 'package:flutter/material.dart';
// import 'package:techtalk/screens/Parent/parent_children_progress.dart';
// import 'package:techtalk/screens/Parent/parent_dashboard.dart';
// import 'package:firebase_auth/firebase_auth.dart';

// class ParentsOverviewScreen extends StatelessWidget {
//   const ParentsOverviewScreen({super.key});

//   @override
//   Widget build(BuildContext context) {
//     final parentId = FirebaseAuth.instance.currentUser?.uid;

//     return Scaffold(
//       // appBar: AppBar(
//       //   title: const Text("Parents Overview"),
//       //   backgroundColor: AppTheme.primaryColor,
//       //   actions: [
//       //     IconButton(
//       //       icon: const Icon(Icons.logout),
//       //       onPressed: () async {
//       //         await logout(context); // centralized logout function
//       //       },
//       //     ),
//       //   ],
//       // ),
//       body: parentId == null
//           ? const Center(child: Text("Parent not logged in"))
//           : SingleChildScrollView(
//               child: Column(
//                 children: [
//                   // Top: Full ParentsDashboard
//                   SizedBox(
//                     height: 500, // adjust as needed or make dynamic
//                     child: const ParentsDashboard(),
//                   ),

//                   // const SizedBox(height:5), // space between

//                   // Bottom: Children progress summary
//                   ParentChildrenProgress(parentId: parentId),
//                 ],
//               ),
//             ),
//     );
//   }
// }
