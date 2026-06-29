import 'package:flutter/material.dart';
import 'package:confetti/confetti.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:math';

import 'package:techtalk/screens/Parent/ParentResultsScreen.dart';

class ParentChildrenProgress extends StatefulWidget {
  final String parentId;

  const ParentChildrenProgress({super.key, required this.parentId});

  @override
  State<ParentChildrenProgress> createState() => _ParentChildrenProgressState();
}

class _ParentChildrenProgressState extends State<ParentChildrenProgress>
    with TickerProviderStateMixin {
  final supabase = Supabase.instance.client;

  late ConfettiController _confettiController;

  @override
  void initState() {
    super.initState();

    _confettiController = ConfettiController(
      duration: const Duration(seconds: 2),
    );
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  Future<List<Map<String, dynamic>>> _loadChildrenResults() async {
    // Assumes parentId is stored in users.assigned_tutor_id
    // Change if you use another relationship

    final students = await supabase
        .from('users')
        .select()
        // .eq('assigned_tutor_id', widget.parentId)
        .eq('parent_id', widget.parentId)
        .eq('role', 'student');

    List<Map<String, dynamic>> results = [];

    for (final student in students) {
      final latestResult = await supabase
          .from('student_results')
          .select()
          .eq('student_name', student['full_name'])
          .order('created_at', ascending: false)
          .limit(1)
          .maybeSingle();

      results.add({'student': student, 'result': latestResult});
    }

    return results;
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: _loadChildrenResults(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(child: Text("No children found"));
        }

        final children = snapshot.data!;

        return Padding(
          padding: const EdgeInsets.all(16),
          child: Wrap(
            spacing: 20,
            runSpacing: 20,
            alignment: WrapAlignment.center,
            children: children.map((childData) {
              final student = childData['student'];
              final result = childData['result'];

              final overallScore = result?['overall_score'] ?? 0;

              final level = ((overallScore / 10).floor()).clamp(1, 10);

              final badges = [
                if (overallScore >= 90) "🏆",
                if (overallScore >= 70) "⭐",
                if (result?['is_passed'] == true) "✅",
              ];

              return _ChildSummaryCard(
                studentId: student['id'],
                childName: student['full_name'] ?? 'Student',
                totalXp: overallScore * 10,
                level: level,
                completedTopics: overallScore ~/ 10,
                badges: badges,
                avatarUrl: result?['avatar_url'],
                courseName: result?['course_name'] ?? 'Coding',
                performanceLabel: result?['performance_label'] ?? 'In Progress',
                overallScore: overallScore,
                onCelebrate: () {
                  if (overallScore >= 85) {
                    _confettiController.play();
                  }
                },
              );
            }).toList(),
          ),
        );
      },
    );
  }
}

class _ChildSummaryCard extends StatelessWidget {
  final String studentId;
  final String childName;
  final int totalXp;
  final int level;
  final int completedTopics;
  final List badges;
  final String? avatarUrl;
  final String courseName;
  final String performanceLabel;
  final int overallScore;
  final VoidCallback onCelebrate;

  const _ChildSummaryCard({
    required this.studentId,
    required this.childName,
    required this.totalXp,
    required this.level,
    required this.completedTopics,
    required this.badges,
    required this.avatarUrl,
    required this.courseName,
    required this.performanceLabel,
    required this.overallScore,
    required this.onCelebrate,
  });

  @override
  Widget build(BuildContext context) {
    final progressPercent = overallScore / 100;

    return GestureDetector(
      onTap: () {
        onCelebrate();

        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ParentResultsScreen(
              studentId: studentId,
              studentName: childName,
            ),
          ),
        );
      },
      child: Container(
        width: 340,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF6366F1), Color(0xFF4338CA)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.12),
              blurRadius: 15,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: Colors.white24,
                  backgroundImage: avatarUrl != null
                      ? NetworkImage(avatarUrl!)
                      : null,
                  child: avatarUrl == null
                      ? const Icon(Icons.person, color: Colors.white, size: 30)
                      : null,
                ),

                const SizedBox(width: 14),

                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        childName,
                        style: const TextStyle(
                          fontSize: 19,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),

                      const SizedBox(height: 4),

                      Text(
                        courseName,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),

                const Icon(
                  Icons.arrow_forward_ios,
                  color: Colors.white70,
                  size: 16,
                ),
              ],
            ),

            const SizedBox(height: 20),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "Level $level",
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Text(
                  "$overallScore%",
                  style: const TextStyle(
                    color: Colors.yellowAccent,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 8),

            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: LinearProgressIndicator(
                value: progressPercent,
                minHeight: 10,
                backgroundColor: Colors.white24,
                color: Colors.yellowAccent,
              ),
            ),

            const SizedBox(height: 18),

            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.12),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Text(
                performanceLabel,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),

            const SizedBox(height: 20),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _StatItem(label: "XP", value: "$totalXp", icon: Icons.flash_on),
                _StatItem(
                  label: "Topics",
                  value: "$completedTopics",
                  icon: Icons.menu_book,
                ),
                _StatItem(
                  label: "Badges",
                  value: "${badges.length}",
                  icon: Icons.workspace_premium,
                ),
              ],
            ),

            const SizedBox(height: 18),

            if (badges.isNotEmpty)
              Wrap(
                spacing: 8,
                children: badges.map((badge) {
                  return Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.12),
                      shape: BoxShape.circle,
                    ),
                    child: Text(badge, style: const TextStyle(fontSize: 18)),
                  );
                }).toList(),
              ),

            const SizedBox(height: 18),

            const Text(
              "Tap to view detailed reports",
              style: TextStyle(
                color: Colors.white70,
                fontSize: 11,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _StatItem({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: Colors.yellowAccent, size: 20),
        const SizedBox(height: 6),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 11),
        ),
      ],
    );
  }
}
// // // // lib/widgets/parent_children_progress.dart
// // // import 'package:flutter/material.dart';
// // // import 'package:cloud_firestore/cloud_firestore.dart';
// // // import 'package:confetti/confetti.dart';
// // // import 'dart:math';

// // // import 'package:techtalk/screens/Parent/ParentResultsScreen.dart';

// // // class ParentChildrenProgress extends StatefulWidget {
// // //   final String parentId;
// // //   const ParentChildrenProgress({super.key, required this.parentId});

// // //   @override
// // //   State<ParentChildrenProgress> createState() => _ParentChildrenProgressState();
// // // }

// // // class _ParentChildrenProgressState extends State<ParentChildrenProgress> {
// // //   late ConfettiController _confettiController;

// // //   @override
// // //   void initState() {
// // //     super.initState();
// // //     _confettiController = ConfettiController(
// // //       duration: const Duration(seconds: 2),
// // //     );
// // //   }

// // //   @override
// // //   void dispose() {
// // //     _confettiController.dispose();
// // //     super.dispose();
// // //   }

// // //   @override
// // //   Widget build(BuildContext context) {
// // //     return StreamBuilder<DocumentSnapshot>(
// // //       stream: FirebaseFirestore.instance
// // //           .collection('users')
// // //           .doc(widget.parentId)
// // //           .snapshots(),
// // //       builder: (context, parentSnap) {
// // //         if (!parentSnap.hasData) return const CircularProgressIndicator();

// // //         final childrenIds = List<String>.from(
// // //           parentSnap.data!['childrenIds'] ?? [],
// // //         );
// // //         if (childrenIds.isEmpty) return const SizedBox.shrink();

// // //         return StreamBuilder<QuerySnapshot>(
// // //           stream: FirebaseFirestore.instance
// // //               .collection('users')
// // //               .where(FieldPath.documentId, whereIn: childrenIds)
// // //               .snapshots(),
// // //           builder: (context, snapshot) {
// // //             if (!snapshot.hasData) return const SizedBox.shrink();

// // //             return Column(
// // //               children: snapshot.data!.docs.map((studentDoc) {
// // //                 final data = studentDoc.data() as Map<String, dynamic>;
// // //                 return _ChildSummaryCard(
// // //                   studentId: studentDoc.id, // Pass ID for navigation
// // //                   childName: data['name'] ?? 'Student',
// // //                   progress: data['progress'] ?? {},
// // //                   onCelebrate: () => _confettiController.play(),
// // //                 );
// // //               }).toList(),
// // //             );
// // //           },
// // //         );
// // //       },
// // //     );
// // //   }
// // // }

// // // class _ChildSummaryCard extends StatelessWidget {
// // //   final String studentId;
// // //   final String childName;
// // //   final Map<String, dynamic> progress;
// // //   final VoidCallback onCelebrate;

// // //   const _ChildSummaryCard({
// // //     required this.studentId,
// // //     required this.childName,
// // //     required this.progress,
// // //     required this.onCelebrate,
// // //   });

// // //   @override
// // //   Widget build(BuildContext context) {
// // //     return GestureDetector(
// // //       onTap: () {
// // //         // Navigate to the High-Fidelity Results Screen
// // //         Navigator.push(
// // //           context,
// // //           MaterialPageRoute(
// // //             builder: (context) => ParentResultsScreen(
// // //               studentId: studentId,
// // //               studentName: childName,
// // //             ),
// // //           ),
// // //         );
// // //       },
// // //       child: Container(
// // //         margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
// // //         padding: const EdgeInsets.all(16),
// // //         decoration: BoxDecoration(
// // //           gradient: const LinearGradient(
// // //             colors: [Color(0xFF6366F1), Color(0xFF4338CA)],
// // //           ),
// // //           borderRadius: BorderRadius.circular(20),
// // //         ),
// // //         child: Column(
// // //           children: [
// // //             Row(
// // //               mainAxisAlignment: MainAxisAlignment.spaceBetween,
// // //               children: [
// // //                 Text(
// // //                   "👧 $childName",
// // //                   style: const TextStyle(
// // //                     color: Colors.white,
// // //                     fontWeight: FontWeight.bold,
// // //                     fontSize: 18,
// // //                   ),
// // //                 ),
// // //                 const Icon(
// // //                   Icons.arrow_forward_ios,
// // //                   color: Colors.white,
// // //                   size: 16,
// // //                 ),
// // //               ],
// // //             ),
// // //             const SizedBox(height: 10),
// // //             const Text(
// // //               "Tap to view detailed exam reports",
// // //               style: TextStyle(color: Colors.white70, fontSize: 12),
// // //             ),
// // //           ],
// // //         ),
// // //       ),
// // //     );
// // //   }
// // // }
// // // lib/widgets/parent_children_progress.dart
// // import 'package:flutter/material.dart';
// // import 'package:cloud_firestore/cloud_firestore.dart';
// // import 'package:confetti/confetti.dart';
// // import 'dart:math';

// // class ParentChildrenProgress extends StatefulWidget {
// //   final String parentId;
// //   const ParentChildrenProgress({super.key, required this.parentId});

// //   @override
// //   State<ParentChildrenProgress> createState() => _ParentChildrenProgressState();
// // }

// // class _ParentChildrenProgressState extends State<ParentChildrenProgress>
// //     with TickerProviderStateMixin {
// //   late ConfettiController _confettiController;

// //   @override
// //   void initState() {
// //     super.initState();
// //     _confettiController = ConfettiController(
// //       duration: const Duration(seconds: 2),
// //     );
// //     // debugPrint("👨‍👩‍👧‍👦 ParentChildrenProgress initialized for ${widget.parentId}");
// //   }

// //   @override
// //   void dispose() {
// //     _confettiController.dispose();
// //     super.dispose();
// //   }

// //   void _triggerConfetti() {
// //     _confettiController.play();
// //   }

// //   @override
// //   Widget build(BuildContext context) {
// //     final screenWidth = MediaQuery.of(context).size.width;
// //     final isWide = screenWidth > 700;

// //     return StreamBuilder<DocumentSnapshot>(
// //       stream: FirebaseFirestore.instance
// //           .collection('users')
// //           .doc(widget.parentId)
// //           .snapshots(),
// //       builder: (context, parentSnap) {
// //         if (parentSnap.connectionState == ConnectionState.waiting) {
// //           return const Center(child: CircularProgressIndicator());
// //         }
// //         if (!parentSnap.hasData || !parentSnap.data!.exists) {
// //           return const Center(child: Text("Parent data not found"));
// //         }

// //         final parentData = parentSnap.data!.data() as Map<String, dynamic>;
// //         final childrenIds = List<String>.from(parentData['childrenIds'] ?? []);

// //         if (childrenIds.isEmpty) {
// //           return const Center(child: Text("No linked children found"));
// //         }

// //         return StreamBuilder<QuerySnapshot>(
// //           stream: FirebaseFirestore.instance
// //               .collection('users')
// //               .where(FieldPath.documentId, whereIn: childrenIds)
// //               .where('role', isEqualTo: 'student')
// //               .snapshots(),
// //           builder: (context, snapshot) {
// //             if (snapshot.connectionState == ConnectionState.waiting) {
// //               return const Center(child: CircularProgressIndicator());
// //             }

// //             if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
// //               return const Center(child: Text("No student data found"));
// //             }

// //             final students = snapshot.data!.docs;

// //             return Padding(
// //               padding: const EdgeInsets.all(16.0),
// //               child: LayoutBuilder(
// //                 builder: (context, constraints) {
// //                   return Flex(
// //                     direction: isWide ? Axis.horizontal : Axis.vertical,
// //                     crossAxisAlignment: CrossAxisAlignment.start,
// //                     mainAxisAlignment: MainAxisAlignment.center,
// //                     mainAxisSize: MainAxisSize.min,
// //                     children: students.map((studentDoc) {
// //                       final data =
// //                           studentDoc.data() as Map<String, dynamic>? ?? {};
// //                       final name = data['name'] ?? data['email'] ?? 'Student';
// //                       final progress = data['progress'] ?? {};
// //                       final totalXp = progress['totalXp'] ?? 0;
// //                       final level = progress['level'] ?? 1;
// //                       final completed =
// //                           (progress['completedTopics'] as List?)?.length ?? 0;
// //                       final badges = (progress['badges'] as List?) ?? [];
// //                       final completedCourses =
// //                           (data['completedCourses'] as List?) ?? [];
// //                       final certificates =
// //                           (data['certificates'] as List?) ?? [];

// //                       return Padding(
// //                         padding: const EdgeInsets.all(8.0),
// //                         child: _ChildSummaryCard(
// //                           childName: name,
// //                           totalXp: totalXp,
// //                           level: level,
// //                           completedTopics: completed,
// //                           badges: badges,
// //                           completedCourses: completedCourses,
// //                           certificates: certificates,
// //                           onCelebrate: _triggerConfetti,
// //                         ),
// //                       );
// //                     }).toList(),
// //                   );
// //                 },
// //               ),
// //             );
// //           },
// //         );
// //       },
// //     );
// //   }
// // }

// // // ------------------ CHILD CARD ------------------
// // class _ChildSummaryCard extends StatelessWidget {
// //   final String childName;
// //   final int totalXp;
// //   final int level;
// //   final int completedTopics;
// //   final List badges;
// //   final List completedCourses;
// //   final List certificates;
// //   final VoidCallback onCelebrate;

// //   const _ChildSummaryCard({
// //     required this.childName,
// //     required this.totalXp,
// //     required this.level,
// //     required this.completedTopics,
// //     required this.badges,
// //     required this.completedCourses,
// //     required this.certificates,
// //     required this.onCelebrate,
// //   });

// //   @override
// //   Widget build(BuildContext context) {
// //     final xpPerLevel = 1000;
// //     final progressPercent = (totalXp % xpPerLevel) / xpPerLevel;
// //     final screenWidth = MediaQuery.of(context).size.width;
// //     final isWide = screenWidth > 500;

// //     return Container(
// //       width: isWide ? 300 : double.infinity,
// //       decoration: BoxDecoration(
// //         gradient: const LinearGradient(
// //           colors: [Color(0xFF81D4FA), Color(0xFF1565C0)],
// //           begin: Alignment.topLeft,
// //           end: Alignment.bottomRight,
// //         ),
// //         borderRadius: BorderRadius.circular(20),
// //         boxShadow: const [
// //           BoxShadow(color: Colors.black26, blurRadius: 6, offset: Offset(2, 3)),
// //         ],
// //       ),
// //       padding: const EdgeInsets.all(16),
// //       child: Column(
// //         crossAxisAlignment: CrossAxisAlignment.start,
// //         children: [
// //           // 🧒 Child Name
// //           Row(
// //             mainAxisAlignment: MainAxisAlignment.spaceBetween,
// //             children: [
// //               Text(
// //                 "👧 $childName",
// //                 style: const TextStyle(
// //                   fontSize: 18,
// //                   color: Colors.white,
// //                   fontWeight: FontWeight.bold,
// //                 ),
// //               ),
// //               GestureDetector(
// //                 onTap: onCelebrate,
// //                 child: const Icon(Icons.celebration, color: Colors.white),
// //               ),
// //             ],
// //           ),
// //           const SizedBox(height: 10),

// //           // XP Progress Bar
// //           LinearProgressIndicator(
// //             value: progressPercent,
// //             color: Colors.yellowAccent,
// //             backgroundColor: Colors.white24,
// //             minHeight: 10,
// //           ),
// //           const SizedBox(height: 8),
// //           Text(
// //             "XP: $totalXp  |  Level $level",
// //             style: const TextStyle(color: Colors.white70, fontSize: 13),
// //           ),
// //           const SizedBox(height: 12),

// //           // Stats Row
// //           Wrap(
// //             spacing: 10,
// //             runSpacing: 6,
// //             children: [
// //               _MiniStat(
// //                 label: "Topics",
// //                 value: "$completedTopics",
// //                 icon: Icons.menu_book,
// //               ),
// //               _MiniStat(
// //                 label: "Badges",
// //                 value: "${badges.length}",
// //                 icon: Icons.emoji_events,
// //               ),
// //               _MiniStat(
// //                 label: "Courses",
// //                 value: "${completedCourses.length}",
// //                 icon: Icons.school,
// //               ),
// //               _MiniStat(
// //                 label: "Certificates",
// //                 value: "${certificates.length}",
// //                 icon: Icons.card_membership,
// //               ),
// //             ],
// //           ),
// //           const SizedBox(height: 8),

// //           // Badge list preview
// //           if (badges.isNotEmpty)
// //             Wrap(
// //               spacing: 6,
// //               runSpacing: 4,
// //               children: badges
// //                   .take(3)
// //                   .map(
// //                     (b) => Chip(
// //                       label: Text(
// //                         b.toString(),
// //                         style: const TextStyle(
// //                           fontSize: 12,
// //                           color: Colors.white,
// //                         ),
// //                       ),
// //                       backgroundColor: Colors
// //                           .primaries[Random().nextInt(Colors.primaries.length)]
// //                           .withOpacity(0.6),
// //                     ),
// //                   )
// //                   .toList(),
// //             ),
// //         ],
// //       ),
// //     );
// //   }
// // }

// // // ------------------ MINI STAT ------------------
// // class _MiniStat extends StatelessWidget {
// //   final String label;
// //   final String value;
// //   final IconData icon;

// //   const _MiniStat({
// //     required this.label,
// //     required this.value,
// //     required this.icon,
// //   });

// //   @override
// //   Widget build(BuildContext context) {
// //     return Container(
// //       padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
// //       decoration: BoxDecoration(
// //         color: Colors.white24,
// //         borderRadius: BorderRadius.circular(10),
// //       ),
// //       child: Row(
// //         mainAxisSize: MainAxisSize.min,
// //         children: [
// //           Icon(icon, size: 14, color: Colors.white),
// //           const SizedBox(width: 4),
// //           Text(
// //             "$label: $value",
// //             style: const TextStyle(color: Colors.white, fontSize: 12),
// //           ),
// //         ],
// //       ),
// //     );
// //   }
// // }
// import 'package:flutter/material.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:confetti/confetti.dart';
// import 'dart:math';

// import 'package:techtalk/screens/Parent/ParentResultsScreen.dart';

// class ParentChildrenProgress extends StatefulWidget {
//   final String parentId;
//   const ParentChildrenProgress({super.key, required this.parentId});

//   @override
//   State<ParentChildrenProgress> createState() => _ParentChildrenProgressState();
// }

// class _ParentChildrenProgressState extends State<ParentChildrenProgress>
//     with TickerProviderStateMixin {
//   late ConfettiController _confettiController;

//   @override
//   void initState() {
//     super.initState();
//     _confettiController = ConfettiController(
//       duration: const Duration(seconds: 2),
//     );
//   }

//   @override
//   void dispose() {
//     _confettiController.dispose();
//     super.dispose();
//   }

//   @override
//   Widget build(BuildContext context) {
//     final isWide = MediaQuery.of(context).size.width > 700;

//     return StreamBuilder<DocumentSnapshot>(
//       stream: FirebaseFirestore.instance
//           .collection('users')
//           .doc(widget.parentId)
//           .snapshots(),
//       builder: (context, parentSnap) {
//         if (parentSnap.connectionState == ConnectionState.waiting) {
//           return const Center(child: CircularProgressIndicator());
//         }
//         if (!parentSnap.hasData || !parentSnap.data!.exists) {
//           return const Center(child: Text("Parent data not found"));
//         }

//         final childrenIds = List<String>.from(
//           parentSnap.data!['childrenIds'] ?? [],
//         );
//         if (childrenIds.isEmpty) {
//           return const Center(child: Text("No linked children found"));
//         }

//         return StreamBuilder<QuerySnapshot>(
//           stream: FirebaseFirestore.instance
//               .collection('users')
//               .where(FieldPath.documentId, whereIn: childrenIds)
//               .snapshots(),
//           builder: (context, snapshot) {
//             if (snapshot.connectionState == ConnectionState.waiting) {
//               return const Center(child: CircularProgressIndicator());
//             }

//             final students = snapshot.data?.docs ?? [];

//             return Padding(
//               padding: const EdgeInsets.all(16.0),
//               child: Wrap(
//                 alignment: WrapAlignment.center,
//                 spacing: 20,
//                 runSpacing: 20,
//                 children: students.map((studentDoc) {
//                   final data = studentDoc.data() as Map<String, dynamic>;
//                   final progress = data['progress'] ?? {};

//                   return _ChildSummaryCard(
//                     studentId: studentDoc.id,
//                     childName: data['name'] ?? 'Student',
//                     totalXp: progress['totalXp'] ?? 0,
//                     level: progress['level'] ?? 1,
//                     completedTopics:
//                         (progress['completedTopics'] as List?)?.length ?? 0,
//                     badges: (progress['badges'] as List?) ?? [],
//                     onCelebrate: () => _confettiController.play(),
//                   );
//                 }).toList(),
//               ),
//             );
//           },
//         );
//       },
//     );
//   }
// }

// class _ChildSummaryCard extends StatelessWidget {
//   final String studentId;
//   final String childName;
//   final int totalXp;
//   final int level;
//   final int completedTopics;
//   final List badges;
//   final VoidCallback onCelebrate;

//   const _ChildSummaryCard({
//     required this.studentId,
//     required this.childName,
//     required this.totalXp,
//     required this.level,
//     required this.completedTopics,
//     required this.badges,
//     required this.onCelebrate,
//   });

//   @override
//   Widget build(BuildContext context) {
//     final progressPercent = (totalXp % 1000) / 1000;

//     return GestureDetector(
//       onTap: () {
//         Navigator.push(
//           context,
//           MaterialPageRoute(
//             builder: (context) => ParentResultsScreen(
//               studentId: studentId,
//               studentName: childName,
//             ),
//           ),
//         );
//       },
//       child: Container(
//         width: 320,
//         decoration: BoxDecoration(
//           gradient: const LinearGradient(
//             colors: [Color(0xFF6366F1), Color(0xFF4338CA)],
//             begin: Alignment.topLeft,
//             end: Alignment.bottomRight,
//           ),
//           borderRadius: BorderRadius.circular(24),
//           boxShadow: [
//             BoxShadow(
//               color: const Color(0xFF4338CA).withOpacity(0.3),
//               blurRadius: 12,
//               offset: const Offset(0, 6),
//             ),
//           ],
//         ),
//         padding: const EdgeInsets.all(20),
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             Row(
//               mainAxisAlignment: MainAxisAlignment.spaceBetween,
//               children: [
//                 Expanded(
//                   child: Text(
//                     "👧 $childName",
//                     style: const TextStyle(
//                       fontSize: 20,
//                       color: Colors.white,
//                       fontWeight: FontWeight.bold,
//                     ),
//                     overflow: TextOverflow.ellipsis,
//                   ),
//                 ),
//                 const Icon(
//                   Icons.arrow_forward_ios,
//                   color: Colors.white70,
//                   size: 16,
//                 ),
//               ],
//             ),
//             const SizedBox(height: 15),

//             // XP Progress
//             Row(
//               mainAxisAlignment: MainAxisAlignment.spaceBetween,
//               children: [
//                 Text(
//                   "Level $level",
//                   style: const TextStyle(
//                     color: Colors.white,
//                     fontWeight: FontWeight.w600,
//                   ),
//                 ),
//                 Text(
//                   "$totalXp XP",
//                   style: const TextStyle(color: Colors.white70, fontSize: 12),
//                 ),
//               ],
//             ),
//             const SizedBox(height: 6),
//             ClipRRect(
//               borderRadius: BorderRadius.circular(10),
//               child: LinearProgressIndicator(
//                 value: progressPercent,
//                 color: Colors.yellowAccent,
//                 backgroundColor: Colors.white24,
//                 minHeight: 8,
//               ),
//             ),
//             const SizedBox(height: 20),

//             // Stats Grid
//             Row(
//               mainAxisAlignment: MainAxisAlignment.spaceBetween,
//               children: [
//                 _StatItem(
//                   label: "Topics",
//                   value: "$completedTopics",
//                   icon: Icons.book,
//                 ),
//                 _StatItem(
//                   label: "Badges",
//                   value: "${badges.length}",
//                   icon: Icons.stars,
//                 ),
//               ],
//             ),

//             const Divider(color: Colors.white24, height: 25),

//             const Center(
//               child: Text(
//                 "Tap to view detailed reports",
//                 style: TextStyle(
//                   color: Colors.white60,
//                   fontSize: 11,
//                   fontStyle: FontStyle.italic,
//                 ),
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }

// class _StatItem extends StatelessWidget {
//   final String label;
//   final String value;
//   final IconData icon;

//   const _StatItem({
//     required this.label,
//     required this.value,
//     required this.icon,
//   });

//   @override
//   Widget build(BuildContext context) {
//     return Row(
//       children: [
//         Icon(icon, size: 16, color: Colors.yellowAccent),
//         const SizedBox(width: 6),
//         Text(
//           "$label: $value",
//           style: const TextStyle(
//             color: Colors.white,
//             fontSize: 13,
//             fontWeight: FontWeight.w500,
//           ),
//         ),
//       ],
//     );
//   }
// }
