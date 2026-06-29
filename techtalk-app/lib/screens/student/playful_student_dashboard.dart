import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:confetti/confetti.dart';
import 'package:fl_chart/fl_chart.dart';

class StudentSummaryTop extends StatefulWidget {
  final String studentId;
  const StudentSummaryTop({super.key, required this.studentId});

  @override
  State<StudentSummaryTop> createState() => _StudentSummaryTopState();
}

class _StudentSummaryTopState extends State<StudentSummaryTop> {
  final supabase = Supabase.instance.client;

  late ConfettiController _confettiController;
  int _prevBadges = 0;
  int _prevLevel = 1;

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

  void _triggerConfetti(int badgeCount, int level) {
    if (badgeCount > _prevBadges || level > _prevLevel) {
      _confettiController.play();
      _prevBadges = badgeCount;
      _prevLevel = level;
    }
  }

  @override
  Widget build(BuildContext context) {
    final userId = widget.studentId;

    return StreamBuilder<List<Map<String, dynamic>>>(
      stream: supabase
          .from('user_xp')
          .stream(primaryKey: ['id'])
          .eq('user_id', userId),
      builder: (context, xpSnap) {
        return StreamBuilder<List<Map<String, dynamic>>>(
          stream: supabase
              .from('user_badges')
              .stream(primaryKey: ['id'])
              .eq('user_id', userId),
          builder: (context, badgeSnap) {
            if (!xpSnap.hasData || xpSnap.data!.isEmpty) {
              return const Text("No XP data");
            }

            final xpData = xpSnap.data!.first;

            final totalXp = (xpData['total_xp'] ?? 0) as int;
            int level = (xpData['level'] ?? 1) as int;

            final badges = badgeSnap.data ?? [];

            const xpPerLevel = 1000;
            final xpProgress = (totalXp % xpPerLevel) / xpPerLevel;

            level = (totalXp ~/ xpPerLevel) + 1;

            WidgetsBinding.instance.addPostFrameCallback((_) {
              _triggerConfetti(badges.length, level);
            });

            return Wrap(
              spacing: 16,
              children: [
                _card("⭐ XP", "$totalXp", Colors.green),
                _xpCircle(xpProgress, level, totalXp),
                Stack(
                  alignment: Alignment.center,
                  children: [
                    _card("🏅 Badges", "${badges.length}", Colors.orange),
                    ConfettiWidget(
                      confettiController: _confettiController,
                      blastDirectionality: BlastDirectionality.explosive,
                      numberOfParticles: 20,
                    ),
                  ],
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _card(String title, String value, Color color) {
    return Container(
      width: 140,
      height: 120,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            title,
            style: const TextStyle(color: Colors.white, fontSize: 14),
          ),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _xpCircle(double progress, int level, int xp) {
    return Container(
      width: 140,
      height: 120,
      decoration: BoxDecoration(
        color: Colors.blue,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text("XP: $xp", style: const TextStyle(color: Colors.white)),
            Text("Level $level", style: const TextStyle(color: Colors.white70)),
            SizedBox(
              height: 60,
              width: 60,
              child: PieChart(
                PieChartData(
                  sections: [
                    PieChartSectionData(
                      value: progress * 100,
                      color: Colors.yellow,
                      radius: 10,
                    ),
                    PieChartSectionData(
                      value: (1 - progress) * 100,
                      color: Colors.white24,
                      radius: 10,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
// import 'package:flutter/material.dart';
// import 'package:supabase_flutter/supabase_flutter.dart';
// import 'package:confetti/confetti.dart';
// import 'package:fl_chart/fl_chart.dart';

// class StudentSummaryTop extends StatefulWidget {
//   final String studentId;
//   const StudentSummaryTop({super.key, required this.studentId});

//   @override
//   State<StudentSummaryTop> createState() => _StudentSummaryTopState();
// }

// class _StudentSummaryTopState extends State<StudentSummaryTop> {
//   final supabase = Supabase.instance.client;

//   late ConfettiController _confettiController;
//   int _prevBadges = 0;
//   int _prevLevel = 1;

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

//   void _triggerConfetti(int badgeCount, int level) {
//     if (badgeCount > _prevBadges || level > _prevLevel) {
//       _confettiController.play();
//       _prevBadges = badgeCount;
//       _prevLevel = level;
//     }
//   }

//   // ===============================
//   // ✅ XP + BADGE + ACTIVITY UPDATE
//   // CALL THIS FROM QUIZ / LESSON / ASSIGNMENT
//   // ===============================
//   Future<void> addXp({
//     required String userId,
//     required int gainedXp,
//     int quizScore = 0,
//     bool giveBadge = false,
//   }) async {
//     // 1. Get current XP
//     final xpRes = await supabase
//         .from('user_xp')
//         .select()
//         .eq('user_id', userId)
//         .maybeSingle();

//     final currentXp = xpRes?['total_xp'] ?? 0;
//     final newXp = currentXp + gainedXp;

//     final newLevel = (newXp ~/ 1000) + 1;

//     // 2. Update XP
//     await supabase.from('user_xp').upsert({
//       'user_id': userId,
//       'total_xp': newXp,
//       'level': newLevel,
//     });

//     // 3. Log activity
//     await supabase.from('user_activity_logs').insert({
//       'user_id': userId,
//       'activity_type': 'quiz_completed',
//       'meta': {'score': quizScore, 'xp': gainedXp},
//     });

//     // 4. Optional badge
//     if (giveBadge) {
//       await supabase.from('user_badges').insert({
//         'user_id': userId,
//         'badge_name': 'Fast Learner',
//       });
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     final userId = widget.studentId;

//     return StreamBuilder<List<Map<String, dynamic>>>(
//       stream: supabase
//           .from('user_xp')
//           .stream(primaryKey: ['id'])
//           .eq('user_id', userId),
//       builder: (context, xpSnap) {
//         return StreamBuilder<List<Map<String, dynamic>>>(
//           stream: supabase
//               .from('user_badges')
//               .stream(primaryKey: ['id'])
//               .eq('user_id', userId),
//           builder: (context, badgeSnap) {
//             if (!xpSnap.hasData || xpSnap.data!.isEmpty) {
//               return const Text("No XP data");
//             }

//             final xpData = xpSnap.data!.first;

//             final totalXp = xpData['total_xp'] ?? 0;
//             int level = xpData['level'] ?? 1;

//             final badges = badgeSnap.data ?? [];

//             const xpPerLevel = 1000;
//             final xpProgress = (totalXp % xpPerLevel) / xpPerLevel;

//             level = (totalXp ~/ xpPerLevel) + 1;

//             WidgetsBinding.instance.addPostFrameCallback((_) {
//               _triggerConfetti(badges.length, level);
//             });

//             return Column(
//               children: [
//                 Wrap(
//                   spacing: 16,
//                   children: [
//                     _card("⭐ XP", "$totalXp", Colors.green),
//                     _xpCircle(xpProgress, level, totalXp),
//                     Stack(
//                       alignment: Alignment.center,
//                       children: [
//                         _card("🏅 Badges", "${badges.length}", Colors.orange),
//                         ConfettiWidget(
//                           confettiController: _confettiController,
//                           blastDirectionality: BlastDirectionality.explosive,
//                           numberOfParticles: 20,
//                         ),
//                       ],
//                     ),
//                   ],
//                 ),
//               ],
//             );
//           },
//         );
//       },
//     );
//   }

//   Widget _card(String title, String value, Color color) {
//     return Container(
//       width: 140,
//       height: 120,
//       decoration: BoxDecoration(
//         color: color,
//         borderRadius: BorderRadius.circular(16),
//       ),
//       child: Column(
//         mainAxisAlignment: MainAxisAlignment.center,
//         children: [
//           Text(
//             title,
//             style: const TextStyle(color: Colors.white, fontSize: 14),
//           ),
//           Text(
//             value,
//             style: const TextStyle(
//               color: Colors.white,
//               fontSize: 20,
//               fontWeight: FontWeight.bold,
//             ),
//           ),
//         ],
//       ),
//     );
//   }

//   Widget _xpCircle(double progress, int level, int xp) {
//     return Container(
//       width: 140,
//       height: 120,
//       decoration: BoxDecoration(
//         color: Colors.blue,
//         borderRadius: BorderRadius.circular(16),
//       ),
//       child: Center(
//         child: Column(
//           mainAxisAlignment: MainAxisAlignment.center,
//           children: [
//             Text("XP: $xp", style: const TextStyle(color: Colors.white)),
//             Text("Level $level", style: const TextStyle(color: Colors.white70)),
//             SizedBox(
//               height: 60,
//               width: 60,
//               child: PieChart(
//                 PieChartData(
//                   sections: [
//                     PieChartSectionData(
//                       value: progress * 100,
//                       color: Colors.yellow,
//                       radius: 10,
//                     ),
//                     PieChartSectionData(
//                       value: (1 - progress) * 100,
//                       color: Colors.white24,
//                       radius: 10,
//                     ),
//                   ],
//                 ),
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }
// // import 'package:flutter/material.dart';
// // import 'package:supabase_flutter/supabase_flutter.dart';
// // import 'package:confetti/confetti.dart';
// // import 'package:fl_chart/fl_chart.dart';
// // import 'dart:math';

// // class StudentSummaryTop extends StatefulWidget {
// //   final String studentId;
// //   const StudentSummaryTop({super.key, required this.studentId});

// //   @override
// //   State<StudentSummaryTop> createState() => _StudentSummaryTopState();
// // }

// // class _StudentSummaryTopState extends State<StudentSummaryTop> {
// //   final supabase = Supabase.instance.client;

// //   late ConfettiController _confettiController;
// //   int _prevBadges = 0;
// //   int _prevLevel = 1;

// //   @override
// //   void initState() {
// //     super.initState();
// //     _confettiController = ConfettiController(
// //       duration: const Duration(seconds: 2),
// //     );
// //   }

// //   @override
// //   void dispose() {
// //     _confettiController.dispose();
// //     super.dispose();
// //   }

// //   void _triggerConfetti(int badgeCount, int level) {
// //     if (badgeCount > _prevBadges || level > _prevLevel) {
// //       _confettiController.play();
// //       _prevBadges = badgeCount;
// //       _prevLevel = level;
// //     }
// //   }

// //   @override
// //   Widget build(BuildContext context) {
// //     final userId = widget.studentId;

// //     return StreamBuilder(
// //       stream: supabase
// //           .from('user_xp')
// //           .stream(primaryKey: ['id'])
// //           .eq('user_id', userId),
// //       builder: (context, xpSnap) {
// //         return StreamBuilder<List<Map<String, dynamic>>>(
// //           stream: supabase
// //               .from('user_badges')
// //               .stream(primaryKey: ['id'])
// //               .eq('user_id', userId),
// //           builder: (context, badgeSnap) {
// //             if (!xpSnap.hasData || xpSnap.data!.isEmpty) {
// //               return const Text("No XP data");
// //             }

// //             final xpData = xpSnap.data!.first;

// //             final totalXp = xpData['total_xp'] ?? 0;
// //             int level = xpData['level'] ?? 1;

// //             final badges = badgeSnap.data ?? [];

// //             const xpPerLevel = 1000;
// //             final xpProgress = (totalXp % xpPerLevel) / xpPerLevel;

// //             level = (totalXp ~/ xpPerLevel) + 1;

// //             WidgetsBinding.instance.addPostFrameCallback((_) {
// //               _triggerConfetti(badges.length, level);
// //             });

// //             return Column(
// //               children: [
// //                 Wrap(
// //                   spacing: 16,
// //                   children: [
// //                     _card("⭐ XP", "$totalXp", Colors.green),
// //                     _xpCircle(xpProgress, level, totalXp),
// //                     Stack(
// //                       alignment: Alignment.center,
// //                       children: [
// //                         _card("🏅 Badges", "${badges.length}", Colors.orange),
// //                         ConfettiWidget(
// //                           confettiController: _confettiController,
// //                           blastDirectionality: BlastDirectionality.explosive,
// //                           numberOfParticles: 20,
// //                         ),
// //                       ],
// //                     ),
// //                   ],
// //                 ),
// //               ],
// //             );
// //           },
// //         );
// //       },
// //     );
// //   }

// //   Widget _card(String title, String value, Color color) {
// //     return Container(
// //       width: 140,
// //       height: 120,
// //       decoration: BoxDecoration(
// //         color: color,
// //         borderRadius: BorderRadius.circular(16),
// //       ),
// //       child: Column(
// //         mainAxisAlignment: MainAxisAlignment.center,
// //         children: [
// //           Text(
// //             title,
// //             style: const TextStyle(color: Colors.white, fontSize: 14),
// //           ),
// //           Text(
// //             value,
// //             style: const TextStyle(
// //               color: Colors.white,
// //               fontSize: 20,
// //               fontWeight: FontWeight.bold,
// //             ),
// //           ),
// //         ],
// //       ),
// //     );
// //   }

// //   Widget _xpCircle(double progress, int level, int xp) {
// //     return Container(
// //       width: 140,
// //       height: 120,
// //       decoration: BoxDecoration(
// //         color: Colors.blue,
// //         borderRadius: BorderRadius.circular(16),
// //       ),
// //       child: Center(
// //         child: Column(
// //           mainAxisAlignment: MainAxisAlignment.center,
// //           children: [
// //             Text("XP: $xp", style: const TextStyle(color: Colors.white)),
// //             Text("Level $level", style: const TextStyle(color: Colors.white70)),
// //             SizedBox(
// //               height: 60,
// //               width: 60,
// //               child: PieChart(
// //                 PieChartData(
// //                   sections: [
// //                     PieChartSectionData(
// //                       value: progress * 100,
// //                       color: Colors.yellow,
// //                       radius: 10,
// //                     ),
// //                     PieChartSectionData(
// //                       value: (1 - progress) * 100,
// //                       color: Colors.white24,
// //                       radius: 10,
// //                     ),
// //                   ],
// //                 ),
// //               ),
// //             ),
// //           ],
// //         ),
// //       ),
// //     );
// //   }
// // }
// // // import 'package:flutter/material.dart';
// // // import 'package:cloud_firestore/cloud_firestore.dart';
// // // import 'package:confetti/confetti.dart';
// // // import 'package:fl_chart/fl_chart.dart';
// // // import 'dart:math';

// // // class StudentSummaryTop extends StatefulWidget {
// // //   final String studentId;
// // //   const StudentSummaryTop({super.key, required this.studentId});

// // //   @override
// // //   State<StudentSummaryTop> createState() => _StudentSummaryTopState();
// // // }

// // // class _StudentSummaryTopState extends State<StudentSummaryTop>
// // //     with TickerProviderStateMixin {
// // //   late ConfettiController _confettiController;
// // //   int _prevBadgeCount = 0;
// // //   int _prevLevel = 1;

// // //   @override
// // //   void initState() {
// // //     super.initState();
// // //     _confettiController =
// // //         ConfettiController(duration: const Duration(seconds: 2));
// // //   }

// // //   @override
// // //   void dispose() {
// // //     _confettiController.dispose();
// // //     super.dispose();
// // //   }

// // //   void _showConfettiIfNewBadgeOrLevel(int badgeCount, int level) {
// // //     if (badgeCount > _prevBadgeCount || level > _prevLevel) {
// // //       _confettiController.play();
// // //       _prevBadgeCount = badgeCount;
// // //       _prevLevel = level;
// // //     }
// // //   }

// // //   @override
// // //   Widget build(BuildContext context) {
// // //     return StreamBuilder<DocumentSnapshot>(
// // //       stream: FirebaseFirestore.instance
// // //           .collection('users')
// // //           .doc(widget.studentId)
// // //           .snapshots(),
// // //       builder: (context, snapshot) {
// // //         if (!snapshot.hasData || !snapshot.data!.exists) {
// // //           return const Center(child: Text("No data available"));
// // //         }

// // //         final data = snapshot.data!.data() as Map<String, dynamic>;
// // //         final progress = data['progress'] ?? {};
// // //         final completedTopics =
// // //             (progress['completedTopics'] as List?)?.length ?? 0;
// // //         final totalXp = progress['totalXp'] ?? 0;
// // //         final badges = (progress['badges'] as List?) ?? [];
// // //         int level = progress['level'] ?? 1;

// // //         const xpPerLevel = 1000;
// // //         double xpForThisLevel = (totalXp % xpPerLevel).toDouble();
// // //         if (totalXp >= level * xpPerLevel) {
// // //           level = (totalXp ~/ xpPerLevel) + 1;
// // //         }

// // //         WidgetsBinding.instance.addPostFrameCallback((_) {
// // //           _showConfettiIfNewBadgeOrLevel(badges.length, level);
// // //         });

// // //         final screenWidth = MediaQuery.of(context).size.width;
// // //         final textScale = MediaQuery.of(context).textScaleFactor;
// // //         final isWide = screenWidth > 700;

// // //         return Padding(
// // //           padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
// // //           child: LayoutBuilder(
// // //             builder: (context, constraints) {
// // //               final cardWidth = _cardWidth(constraints.maxWidth, isWide);
// // //               final fontScale = (screenWidth / 400).clamp(0.8, 1.3);

// // //               return ConstrainedBox(
// // //                 constraints: const BoxConstraints(minHeight: 180),
// // //                 child: Wrap(
// // //                   spacing: 16,
// // //                   runSpacing: 16,
// // //                   alignment: WrapAlignment.center,
// // //                   children: [
// // //                     _FancyCard(
// // //                       title: "Completed Topics",
// // //                       emoji: "📘",
// // //                       gradient: const LinearGradient(
// // //                         colors: [Color(0xFF81D4FA), Color(0xFF1565C0)],
// // //                         begin: Alignment.topLeft,
// // //                         end: Alignment.bottomRight,
// // //                       ),
// // //                       width: cardWidth,
// // //                       fontScale: fontScale,
// // //                       child: Column(
// // //                         mainAxisAlignment: MainAxisAlignment.center,
// // //                         children: [
// // //                           Text(
// // //                             "$completedTopics",
// // //                             style: TextStyle(
// // //                               fontSize: 28 * fontScale,
// // //                               fontWeight: FontWeight.bold,
// // //                               color: Colors.white,
// // //                             ),
// // //                           ),
// // //                           const SizedBox(height: 6),
// // //                           Container(
// // //                             padding: const EdgeInsets.symmetric(
// // //                                 horizontal: 8, vertical: 4),
// // //                             decoration: BoxDecoration(
// // //                               color: Colors.white24,
// // //                               borderRadius: BorderRadius.circular(8),
// // //                             ),
// // //                             child: Text(
// // //                               "Level $level",
// // //                               style: TextStyle(
// // //                                 color: Colors.white,
// // //                                 fontWeight: FontWeight.bold,
// // //                                 fontSize: 13 * fontScale,
// // //                               ),
// // //                             ),
// // //                           ),
// // //                         ],
// // //                       ),
// // //                     ),
// // //                     _FancyCard(
// // //                       title: "Total XP",
// // //                       emoji: "⭐",
// // //                       gradient: const LinearGradient(
// // //                         colors: [Color(0xFF4CAF50), Color(0xFF1B5E20)],
// // //                         begin: Alignment.topLeft,
// // //                         end: Alignment.bottomRight,
// // //                       ),
// // //                       width: cardWidth,
// // //                       fontScale: fontScale,
// // //                       child: TweenAnimationBuilder<double>(
// // //                         tween: Tween<double>(
// // //                             begin: 0, end: xpForThisLevel / xpPerLevel),
// // //                         duration: const Duration(seconds: 1),
// // //                         builder: (context, value, _) {
// // //                           return SizedBox(
// // //                             width: 100 * fontScale,
// // //                             height: 100 * fontScale,
// // //                             child: Stack(
// // //                               alignment: Alignment.center,
// // //                               children: [
// // //                                 PieChart(
// // //                                   PieChartData(
// // //                                     sections: [
// // //                                       PieChartSectionData(
// // //                                         color: Colors.yellowAccent,
// // //                                         value: value * 100,
// // //                                         radius: 38 * fontScale,
// // //                                         showTitle: false,
// // //                                       ),
// // //                                       PieChartSectionData(
// // //                                         color: Colors.white.withOpacity(0.3),
// // //                                         value: (1 - value) * 100,
// // //                                         radius: 38 * fontScale,
// // //                                         showTitle: false,
// // //                                       ),
// // //                                     ],
// // //                                     centerSpaceRadius: 30 * fontScale,
// // //                                   ),
// // //                                 ),
// // //                                 Column(
// // //                                   mainAxisAlignment: MainAxisAlignment.center,
// // //                                   children: [
// // //                                     Text(
// // //                                       "$totalXp",
// // //                                       style: TextStyle(
// // //                                         fontSize: 14 * fontScale,
// // //                                         fontWeight: FontWeight.bold,
// // //                                         color: Colors.white,
// // //                                       ),
// // //                                     ),
// // //                                     Text(
// // //                                       "XP\nLv.$level",
// // //                                       textAlign: TextAlign.center,
// // //                                       style: TextStyle(
// // //                                         fontSize: 10 * fontScale,
// // //                                         color: Colors.white70,
// // //                                       ),
// // //                                     ),
// // //                                   ],
// // //                                 ),
// // //                               ],
// // //                             ),
// // //                           );
// // //                         },
// // //                       ),
// // //                     ),
// // //                     Stack(
// // //                       alignment: Alignment.center,
// // //                       children: [
// // //                         GestureDetector(
// // //                           onTap: () => showDialog(
// // //                             context: context,
// // //                             builder: (context) =>
// // //                                 BadgeListDialog(badges: badges),
// // //                           ),
// // //                           child: _FancyCard(
// // //                             title: "Badges",
// // //                             emoji: "🏅",
// // //                             gradient: const LinearGradient(
// // //                               colors: [Color(0xFFFFA726), Color(0xFFF57C00)],
// // //                               begin: Alignment.topLeft,
// // //                               end: Alignment.bottomRight,
// // //                             ),
// // //                             width: cardWidth,
// // //                             fontScale: fontScale,
// // //                             child: Text(
// // //                               "${badges.length}",
// // //                               style: TextStyle(
// // //                                 fontSize: 32 * fontScale,
// // //                                 fontWeight: FontWeight.bold,
// // //                                 color: Colors.white,
// // //                               ),
// // //                             ),
// // //                           ),
// // //                         ),
// // //                         ConfettiWidget(
// // //                           confettiController: _confettiController,
// // //                           blastDirectionality:
// // //                               BlastDirectionality.explosive,
// // //                           shouldLoop: false,
// // //                           colors: const [
// // //                             Colors.red,
// // //                             Colors.yellow,
// // //                             Colors.green,
// // //                             Colors.blue,
// // //                             Colors.orange,
// // //                             Colors.purple
// // //                           ],
// // //                           numberOfParticles: 25,
// // //                           maxBlastForce: 25,
// // //                           minBlastForce: 5,
// // //                           emissionFrequency: 0.05,
// // //                           gravity: 0.4,
// // //                         ),
// // //                       ],
// // //                     ),
// // //                   ],
// // //                 ),
// // //               );
// // //             },
// // //           ),
// // //         );
// // //       },
// // //     );
// // //   }

// // //   double _cardWidth(double maxWidth, bool isWide) {
// // //     if (isWide) return (maxWidth - 64) / 3;
// // //     if (maxWidth > 500) return (maxWidth - 48) / 2;
// // //     return maxWidth - 32;
// // //   }
// // // }

// // // // ───────────────────── CARD ─────────────────────
// // // class _FancyCard extends StatelessWidget {
// // //   final String title;
// // //   final String emoji;
// // //   final LinearGradient gradient;
// // //   final Widget child;
// // //   final double width;
// // //   final double fontScale;

// // //   const _FancyCard({
// // //     required this.title,
// // //     required this.emoji,
// // //     required this.gradient,
// // //     required this.child,
// // //     required this.width,
// // //     required this.fontScale,
// // //   });

// // //   @override
// // //   Widget build(BuildContext context) {
// // //     return Container(
// // //       width: width,
// // //       height: 180 * fontScale.clamp(0.9, 1.2),
// // //       decoration: BoxDecoration(
// // //         gradient: gradient,
// // //         borderRadius: BorderRadius.circular(20),
// // //         boxShadow: const [
// // //           BoxShadow(
// // //             color: Colors.black26,
// // //             blurRadius: 6,
// // //             offset: Offset(2, 3),
// // //           ),
// // //         ],
// // //       ),
// // //       padding: const EdgeInsets.all(12),
// // //       child: Column(
// // //         mainAxisAlignment: MainAxisAlignment.spaceBetween,
// // //         children: [
// // //           Text(
// // //             "$emoji $title",
// // //             textAlign: TextAlign.center,
// // //             style: TextStyle(
// // //               color: Colors.white,
// // //               fontWeight: FontWeight.bold,
// // //               fontSize: 14 * fontScale,
// // //             ),
// // //           ),
// // //           Expanded(child: Center(child: child)),
// // //         ],
// // //       ),
// // //     );
// // //   }
// // // }

// // // // ───────────────────── BADGES DIALOG ─────────────────────
// // // class BadgeListDialog extends StatelessWidget {
// // //   final List badges;
// // //   const BadgeListDialog({super.key, required this.badges});

// // //   @override
// // //   Widget build(BuildContext context) {
// // //     return AlertDialog(
// // //       backgroundColor: Colors.orange.shade50,
// // //       title: const Text("🏅 Your Badges",
// // //           style: TextStyle(fontWeight: FontWeight.bold)),
// // //       content: SizedBox(
// // //         width: double.maxFinite,
// // //         child: badges.isEmpty
// // //             ? const Text("No badges yet! Keep learning! 🚀",
// // //                 style: TextStyle(fontSize: 16))
// // //             : GridView.count(
// // //                 crossAxisCount: 2,
// // //                 crossAxisSpacing: 8,
// // //                 mainAxisSpacing: 8,
// // //                 shrinkWrap: true,
// // //                 children: badges
// // //                     .map((badge) => Container(
// // //                           decoration: BoxDecoration(
// // //                             color: Colors
// // //                                 .primaries[
// // //                                     Random().nextInt(Colors.primaries.length)]
// // //                                 .withOpacity(0.4),
// // //                             borderRadius: BorderRadius.circular(16),
// // //                           ),
// // //                           padding: const EdgeInsets.all(8),
// // //                           child: Column(
// // //                             mainAxisAlignment: MainAxisAlignment.center,
// // //                             children: [
// // //                               const Text("🏅",
// // //                                   style: TextStyle(fontSize: 36)),
// // //                               const SizedBox(height: 6),
// // //                               Text(
// // //                                 badge.toString(),
// // //                                 textAlign: TextAlign.center,
// // //                                 style: const TextStyle(
// // //                                     fontWeight: FontWeight.bold,
// // //                                     fontSize: 14),
// // //                               ),
// // //                             ],
// // //                           ),
// // //                         ))
// // //                     .toList(),
// // //               ),
// // //       ),
// // //       actions: [
// // //         TextButton(
// // //           onPressed: () => Navigator.pop(context),
// // //           child: const Text("Close",
// // //               style: TextStyle(fontWeight: FontWeight.bold)),
// // //         )
// // //       ],
// // //     );
// // //   }
// // // }
