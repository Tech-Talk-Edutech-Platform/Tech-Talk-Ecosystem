// lib/screens/parent/parent_results_screen.dart

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ParentResultsScreen extends StatefulWidget {
  final String studentId;
  final String studentName;

  const ParentResultsScreen({
    super.key,
    required this.studentId,
    required this.studentName,
  });

  @override
  State<ParentResultsScreen> createState() => _ParentResultsScreenState();
}

class _ParentResultsScreenState extends State<ParentResultsScreen> {
  final supabase = Supabase.instance.client;

  bool loading = true;

  Map<String, dynamic>? student;
  List assignments = [];

  double overallScore = 0;

  @override
  void initState() {
    super.initState();
    _loadResults();
  }

  Future<void> _loadResults() async {
    try {
      /// ===============================
      /// STUDENT
      /// ===============================
      final studentRes = await supabase
          .from('users')
          .select()
          .eq('id', widget.studentId)
          .single();

      /// ===============================
      /// ASSIGNMENTS
      /// ===============================
      final assignmentsRes = await supabase
          .from('student_assignments')
          .select()
          .eq('student_id', widget.studentId)
          .order('created_at', ascending: false);

      double total = 0;
      int count = 0;

      for (var a in assignmentsRes) {
        final grade = a['grade'];

        if (grade != null) {
          final parsed = double.tryParse(grade.toString()) ?? 0;

          total += parsed;
          count++;
        }
      }

      setState(() {
        student = studentRes;
        assignments = assignmentsRes;
        overallScore = count == 0 ? 0 : total / count;
        loading = false;
      });
    } catch (e) {
      debugPrint("RESULTS ERROR: $e");

      setState(() {
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FE),

      appBar: AppBar(
        elevation: 0,
        backgroundColor: const Color(0xFF4338CA),

        title: const Text(
          "Exam Results",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),

        iconTheme: const IconThemeData(color: Colors.white),
      ),

      body: loading
          ? const Center(child: CircularProgressIndicator())
          : student == null
          ? const Center(child: Text("Student not found"))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),

              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,

                children: [
                  /// ===============================
                  /// PROFILE
                  /// ===============================
                  _buildCard(
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 30,
                          backgroundColor: Colors.indigo.shade50,

                          child: const Icon(
                            Icons.person,
                            size: 30,
                            color: Color(0xFF4338CA),
                          ),
                        ),

                        const SizedBox(width: 15),

                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,

                            children: [
                              Text(
                                widget.studentName,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),

                              const SizedBox(height: 5),

                              Text(
                                "${student!['subscription_tier'] ?? 'Starter'} Plan",
                                style: const TextStyle(color: Colors.grey),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 25),

                  /// ===============================
                  /// OVERALL PERFORMANCE
                  /// ===============================
                  const Text(
                    "Overall Performance",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),

                  const SizedBox(height: 15),

                  _buildCard(
                    child: Row(
                      children: [
                        Stack(
                          alignment: Alignment.center,

                          children: [
                            SizedBox(
                              height: 85,
                              width: 85,

                              child: CircularProgressIndicator(
                                value: overallScore / 100,
                                strokeWidth: 8,
                                color: overallScore >= 70
                                    ? Colors.green
                                    : overallScore >= 50
                                    ? Colors.orange
                                    : Colors.red,
                                backgroundColor: Colors.grey.shade200,
                              ),
                            ),

                            Text(
                              "${overallScore.toStringAsFixed(0)}%",
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(width: 20),

                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,

                            children: [
                              Text(
                                overallScore >= 70
                                    ? "Excellent Progress"
                                    : overallScore >= 50
                                    ? "Good Effort"
                                    : "Needs Improvement",
                                style: TextStyle(
                                  color: overallScore >= 70
                                      ? Colors.green
                                      : overallScore >= 50
                                      ? Colors.orange
                                      : Colors.red,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),

                              const SizedBox(height: 6),

                              const Text(
                                "Performance calculated from submitted assignments and tutor grading.",
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 30),

                  /// ===============================
                  /// ASSIGNMENTS
                  /// ===============================
                  const Text(
                    "Assignment Results",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),

                  const SizedBox(height: 15),

                  if (assignments.isEmpty)
                    _buildCard(
                      child: const Center(
                        child: Padding(
                          padding: EdgeInsets.all(10),
                          child: Text("No assignments submitted yet"),
                        ),
                      ),
                    ),

                  ...assignments.map((assignment) {
                    final grade =
                        double.tryParse(
                          assignment['grade']?.toString() ?? '0',
                        ) ??
                        0;

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),

                      child: _buildCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,

                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,

                              children: [
                                Expanded(
                                  child: Text(
                                    assignment['task_name'] ?? 'Assignment',

                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                ),

                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),

                                  decoration: BoxDecoration(
                                    color: grade >= 70
                                        ? Colors.green.shade50
                                        : Colors.orange.shade50,
                                    borderRadius: BorderRadius.circular(20),
                                  ),

                                  child: Text(
                                    "${grade.toStringAsFixed(0)}%",

                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: grade >= 70
                                          ? Colors.green
                                          : Colors.orange,
                                    ),
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 14),

                            LinearProgressIndicator(
                              value: grade / 100,
                              minHeight: 8,
                              borderRadius: BorderRadius.circular(20),
                              color: grade >= 70 ? Colors.green : Colors.orange,
                              backgroundColor: Colors.grey.shade200,
                            ),

                            const SizedBox(height: 16),

                            if (assignment['description'] != null)
                              Text(
                                assignment['description'],
                                style: TextStyle(color: Colors.grey.shade700),
                              ),

                            if (assignment['tutor_feedback'] != null)
                              Container(
                                margin: const EdgeInsets.only(top: 16),

                                padding: const EdgeInsets.all(14),

                                decoration: BoxDecoration(
                                  color: const Color(0xFFEEF2FF),

                                  borderRadius: BorderRadius.circular(14),
                                ),

                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,

                                  children: [
                                    const Icon(
                                      Icons.chat_bubble_outline,
                                      color: Color(0xFF4338CA),
                                    ),

                                    const SizedBox(width: 12),

                                    Expanded(
                                      child: Text(
                                        assignment['tutor_feedback'],

                                        style: const TextStyle(height: 1.5),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      ),
                    );
                  }),

                  const SizedBox(height: 20),

                  /// ===============================
                  /// PACKAGE
                  /// ===============================
                  _buildCard(
                    child: Column(
                      children: [
                        _infoRow(
                          "Subscription",
                          student!['subscription_tier'] ?? 'Starter',
                        ),

                        const SizedBox(height: 14),

                        _infoRow(
                          "Total Classes",
                          "${student!['total_classes'] ?? 0}",
                        ),

                        const SizedBox(height: 14),

                        _infoRow(
                          "Classes Remaining",
                          "${student!['classes_remaining'] ?? 0}",
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 30),
                ],
              ),
            ),
    );
  }

  Widget _buildCard({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),

      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),

        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10),
        ],
      ),

      child: child,
    );
  }

  Widget _infoRow(String title, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,

      children: [
        Text(title, style: TextStyle(color: Colors.grey.shade700)),

        Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
      ],
    );
  }
}
// // // lib/screens/parent/parent_results_screen.dart
// // import 'package:flutter/material.dart';
// // import 'package:cloud_firestore/cloud_firestore.dart';

// // class ParentResultsScreen extends StatelessWidget {
// //   final String studentId;
// //   final String studentName;

// //   const ParentResultsScreen({
// //     super.key,
// //     required this.studentId,
// //     required this.studentName,
// //   });

// //   @override
// //   Widget build(BuildContext context) {
// //     return Scaffold(
// //       backgroundColor: const Color(0xFFF8F9FE),
// //       appBar: AppBar(
// //         title: const Text(
// //           "Exam Results",
// //           style: TextStyle(fontWeight: FontWeight.bold),
// //         ),
// //         backgroundColor: const Color(0xFF4338CA),
// //         elevation: 0,
// //       ),
// //       body: FutureBuilder<DocumentSnapshot>(
// //         future: FirebaseFirestore.instance
// //             .collection('users')
// //             .doc(studentId)
// //             .get(),
// //         builder: (context, snapshot) {
// //           if (!snapshot.hasData)
// //             return const Center(child: CircularProgressIndicator());

// //           final data = snapshot.data!.data() as Map<String, dynamic>;
// //           final progress = data['progress'] ?? {};
// //           final totalXp = progress['totalXp'] ?? 0;
// //           final level = progress['level'] ?? 1;

// //           return SingleChildScrollView(
// //             padding: const EdgeInsets.all(20),
// //             child: Column(
// //               children: [
// //                 // 1. Profile Header
// //                 _buildHeader(studentName, level),
// //                 const SizedBox(height: 20),

// //                 // 2. Performance Gauge
// //                 _buildPerformanceCard(totalXp),
// //                 const SizedBox(height: 20),

// //                 // 3. Section Breakdown (Matches your Image)
// //                 const Align(
// //                   alignment: Alignment.centerLeft,
// //                   child: Text(
// //                     "Section Breakdown",
// //                     style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
// //                   ),
// //                 ),
// //                 const SizedBox(height: 15),
// //                 _buildStatRow("Concepts & Theory", 0.90, Colors.red),
// //                 _buildStatRow("Practical Implementation", 0.80, Colors.blue),
// //                 _buildStatRow("Problem Solving", 0.85, Colors.orange),
// //                 _buildStatRow("Creativity & Logic", 0.85, Colors.purple),

// //                 const SizedBox(height: 25),

// //                 // 4. Tutor Feedback
// //                 _buildFeedbackCard(),

// //                 const SizedBox(height: 30),

// //                 // 5. Action Buttons
// //                 Row(
// //                   children: [
// //                     Expanded(
// //                       child: _actionButton(
// //                         "Download Report",
// //                         Icons.download,
// //                         isPrimary: false,
// //                       ),
// //                     ),
// //                     const SizedBox(width: 12),
// //                     Expanded(
// //                       child: _actionButton(
// //                         "Share Result",
// //                         Icons.share,
// //                         isPrimary: true,
// //                       ),
// //                     ),
// //                   ],
// //                 ),
// //               ],
// //             ),
// //           );
// //         },
// //       ),
// //     );
// //   }

// //   Widget _buildHeader(String name, int level) {
// //     return Container(
// //       padding: const EdgeInsets.all(16),
// //       decoration: BoxDecoration(
// //         color: Colors.white,
// //         borderRadius: BorderRadius.circular(20),
// //       ),
// //       child: Row(
// //         children: [
// //           CircleAvatar(
// //             radius: 30,
// //             backgroundColor: Colors.blue.shade100,
// //             child: const Icon(Icons.person),
// //           ),
// //           const SizedBox(width: 15),
// //           Column(
// //             crossAxisAlignment: CrossAxisAlignment.start,
// //             children: [
// //               Text(
// //                 name,
// //                 style: const TextStyle(
// //                   fontSize: 18,
// //                   fontWeight: FontWeight.bold,
// //                 ),
// //               ),
// //               Text(
// //                 "Level $level - Scratch Programming",
// //                 style: const TextStyle(color: Colors.grey),
// //               ),
// //             ],
// //           ),
// //         ],
// //       ),
// //     );
// //   }

// //   Widget _buildPerformanceCard(int xp) {
// //     return Container(
// //       padding: const EdgeInsets.all(20),
// //       decoration: BoxDecoration(
// //         color: Colors.white,
// //         borderRadius: BorderRadius.circular(20),
// //       ),
// //       child: Row(
// //         children: [
// //           Stack(
// //             alignment: Alignment.center,
// //             children: [
// //               SizedBox(
// //                 height: 80,
// //                 width: 80,
// //                 child: CircularProgressIndicator(
// //                   value: 0.85,
// //                   strokeWidth: 8,
// //                   color: Colors.green,
// //                   backgroundColor: Colors.grey.shade100,
// //                 ),
// //               ),
// //               const Text(
// //                 "85%",
// //                 style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
// //               ),
// //             ],
// //           ),
// //           const SizedBox(width: 20),
// //           const Expanded(
// //             child: Column(
// //               crossAxisAlignment: CrossAxisAlignment.start,
// //               children: [
// //                 Text(
// //                   "Great job! Performance is Excellent",
// //                   style: TextStyle(
// //                     fontWeight: FontWeight.bold,
// //                     color: Colors.green,
// //                   ),
// //                 ),
// //                 SizedBox(height: 5),
// //                 Text("Daniel is performing above average in most topics."),
// //               ],
// //             ),
// //           ),
// //         ],
// //       ),
// //     );
// //   }

// //   Widget _buildStatRow(String title, double val, Color color) {
// //     return Padding(
// //       padding: const EdgeInsets.symmetric(vertical: 8.0),
// //       child: Column(
// //         children: [
// //           Row(
// //             mainAxisAlignment: MainAxisAlignment.spaceBetween,
// //             children: [Text(title), Text("${(val * 100).toInt()}%")],
// //           ),
// //           const SizedBox(height: 5),
// //           LinearProgressIndicator(
// //             value: val,
// //             color: color,
// //             backgroundColor: color.withOpacity(0.1),
// //             minHeight: 8,
// //           ),
// //         ],
// //       ),
// //     );
// //   }

// //   Widget _buildFeedbackCard() {
// //     return Container(
// //       padding: const EdgeInsets.all(16),
// //       decoration: BoxDecoration(
// //         color: Colors.indigo.shade50,
// //         borderRadius: BorderRadius.circular(15),
// //       ),
// //       child: const Column(
// //         crossAxisAlignment: CrossAxisAlignment.start,
// //         children: [
// //           Text(
// //             "Tutor Feedback",
// //             style: TextStyle(
// //               fontWeight: FontWeight.bold,
// //               color: Color(0xFF4338CA),
// //             ),
// //           ),
// //           SizedBox(height: 8),
// //           Text(
// //             "Amina is showing great logic. She should focus on debugging complex loops next.",
// //           ),
// //         ],
// //       ),
// //     );
// //   }

// //   Widget _actionButton(String label, IconData icon, {required bool isPrimary}) {
// //     return ElevatedButton.icon(
// //       onPressed: () {},
// //       icon: Icon(icon, color: isPrimary ? Colors.white : Colors.indigo),
// //       label: Text(
// //         label,
// //         style: TextStyle(color: isPrimary ? Colors.white : Colors.indigo),
// //       ),
// //       style: ElevatedButton.styleFrom(
// //         backgroundColor: isPrimary ? const Color(0xFF4338CA) : Colors.white,
// //         side: isPrimary
// //             ? BorderSide.none
// //             : const BorderSide(color: Color(0xFF4338CA)),
// //         shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
// //         padding: const EdgeInsets.symmetric(vertical: 12),
// //       ),
// //     );
// //   }
// // }
// // // import 'package:flutter/material.dart';
// // // import 'package:supabase_flutter/supabase_flutter.dart';
// // // import 'package:percent_indicator/percent_indicator.dart'; // Added for the circular gauge

// // // class ParentResultsScreen extends StatefulWidget {
// // //   final String studentId;
// // //   final String attemptId;

// // //   const ParentResultsScreen({
// // //     super.key,
// // //     required this.studentId,
// // //     required this.attemptId,
// // //   });

// // //   @override
// // //   State<ParentResultsScreen> createState() => _ParentResultsScreenState();
// // // }

// // // class _ParentResultsScreenState extends State<ParentResultsScreen> {
// // //   final supabase = Supabase.instance.client;
// // //   bool _isLoading = true;
// // //   Map<String, dynamic>? _data;

// // //   @override
// // //   void initState() {
// // //     super.initState();
// // //     _fetchResultDetails();
// // //   }

// // //   Future<void> _fetchResultDetails() async {
// // //     try {
// // //       // 1. Fetch Attempt with Exam info
// // //       // 2. Fetch Answers with Question info (to calculate section breakdowns)
// // //       final response = await supabase
// // //           .from('attempts')
// // //           .select('''
// // //             *,
// // //             exams (title, total_marks),
// // //             answers (
// // //               is_correct,
// // //               questions (type, marks)
// // //             )
// // //           ''')
// // //           .eq('id', widget.attemptId)
// // //           .single();

// // //       setState(() {
// // //         _data = response;
// // //         _isLoading = false;
// // //       });
// // //     } catch (e) {
// // //       debugPrint("Error fetching data: $e");
// // //     }
// // //   }

// // //   @override
// // //   Widget build(BuildContext context) {
// // //     if (_isLoading)
// // //       return const Scaffold(body: Center(child: CircularProgressIndicator()));

// // //     final exam = _data?['exams'];
// // //     final score = _data?['score'] ?? 0;
// // //     final total = exam['total_marks'] ?? 100;
// // //     final percentage = (score / total) * 100;

// // //     return Scaffold(
// // //       backgroundColor: const Color(0xFFF8F9FE),
// // //       appBar: AppBar(
// // //         title: const Text(
// // //           'Exam Results',
// // //           style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
// // //         ),
// // //         backgroundColor: const Color(0xFF4338CA),
// // //         centerTitle: true,
// // //         elevation: 0,
// // //         actions: [
// // //           IconButton(
// // //             icon: const Icon(Icons.notifications_none, color: Colors.white),
// // //             onPressed: () {},
// // //           ),
// // //         ],
// // //       ),
// // //       body: SingleChildScrollView(
// // //         padding: const EdgeInsets.all(20),
// // //         child: Column(
// // //           crossAxisAlignment: CrossAxisAlignment.start,
// // //           children: [
// // //             _buildProfileHeader(),
// // //             const SizedBox(height: 25),
// // //             _buildOverallPerformance(percentage.toInt()),
// // //             const SizedBox(height: 25),
// // //             _buildSectionBreakdown(),
// // //             const SizedBox(height: 25),
// // //             _buildTutorFeedback(),
// // //             const SizedBox(height: 30),
// // //             _buildActionButtons(),
// // //           ],
// // //         ),
// // //       ),
// // //     );
// // //   }

// // //   Widget _buildProfileHeader() {
// // //     return Container(
// // //       padding: const EdgeInsets.all(16),
// // //       decoration: BoxDecoration(
// // //         color: Colors.white,
// // //         borderRadius: BorderRadius.circular(20),
// // //         boxShadow: [
// // //           BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10),
// // //         ],
// // //       ),
// // //       child: Row(
// // //         children: [
// // //           const CircleAvatar(
// // //             radius: 35,
// // //             backgroundImage: NetworkImage(
// // //               'https://placeholder.com/user_image',
// // //             ), // Replace with actual user image URL
// // //           ),
// // //           const SizedBox(width: 15),
// // //           Column(
// // //             crossAxisAlignment: CrossAxisAlignment.start,
// // //             children: [
// // //               const Text(
// // //                 "Daniel Mwangi",
// // //                 style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
// // //               ),
// // //               Text(
// // //                 "Grade 6 • ${_data?['exams']['title']}",
// // //                 style: const TextStyle(color: Colors.grey),
// // //               ),
// // //               const SizedBox(height: 8),
// // //               Container(
// // //                 padding: const EdgeInsets.symmetric(
// // //                   horizontal: 10,
// // //                   vertical: 4,
// // //                 ),
// // //                 decoration: BoxDecoration(
// // //                   color: Colors.green.shade50,
// // //                   borderRadius: BorderRadius.circular(20),
// // //                 ),
// // //                 child: const Text(
// // //                   "Active Student",
// // //                   style: TextStyle(
// // //                     color: Colors.green,
// // //                     fontSize: 12,
// // //                     fontWeight: FontWeight.bold,
// // //                   ),
// // //                 ),
// // //               ),
// // //             ],
// // //           ),
// // //           const Spacer(),
// // //           const Icon(Icons.chevron_right, color: Colors.grey),
// // //         ],
// // //       ),
// // //     );
// // //   }

// // //   Widget _buildOverallPerformance(int percent) {
// // //     return Column(
// // //       crossAxisAlignment: CrossAxisAlignment.start,
// // //       children: [
// // //         const Text(
// // //           "Overall Performance",
// // //           style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
// // //         ),
// // //         const SizedBox(height: 15),
// // //         Container(
// // //           padding: const EdgeInsets.all(20),
// // //           decoration: BoxDecoration(
// // //             color: Colors.white,
// // //             borderRadius: BorderRadius.circular(20),
// // //           ),
// // //           child: Row(
// // //             children: [
// // //               CircularPercentIndicator(
// // //                 radius: 50.0,
// // //                 lineWidth: 10.0,
// // //                 percent: percent / 100,
// // //                 center: Text(
// // //                   "$percent%",
// // //                   style: const TextStyle(
// // //                     fontWeight: FontWeight.bold,
// // //                     fontSize: 18,
// // //                   ),
// // //                 ),
// // //                 progressColor: Colors.green,
// // //                 backgroundColor: Colors.grey.shade100,
// // //                 circularStrokeCap: CircularStrokeCap.round,
// // //               ),
// // //               const SizedBox(width: 20),
// // //               Expanded(
// // //                 child: Column(
// // //                   crossAxisAlignment: CrossAxisAlignment.start,
// // //                   children: [
// // //                     const Text(
// // //                       "Great job! Daniel is performing",
// // //                       style: TextStyle(fontSize: 14),
// // //                     ),
// // //                     const Text(
// // //                       "above average.",
// // //                       style: TextStyle(
// // //                         color: Colors.green,
// // //                         fontWeight: FontWeight.bold,
// // //                         fontSize: 14,
// // //                       ),
// // //                     ),
// // //                     const SizedBox(height: 10),
// // //                     LinearProgressIndicator(
// // //                       value: percent / 100,
// // //                       backgroundColor: Colors.grey.shade100,
// // //                       color: Colors.orange,
// // //                       minHeight: 8,
// // //                       borderRadius: BorderRadius.circular(10),
// // //                     ),
// // //                   ],
// // //                 ),
// // //               ),
// // //             ],
// // //           ),
// // //         ),
// // //       ],
// // //     );
// // //   }

// // //   Widget _buildSectionBreakdown() {
// // //     // In a real app, you would calculate these scores based on the `answers` list
// // //     return Column(
// // //       crossAxisAlignment: CrossAxisAlignment.start,
// // //       children: [
// // //         const Text(
// // //           "Section Breakdown",
// // //           style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
// // //         ),
// // //         const SizedBox(height: 15),
// // //         _breakdownRow("Concepts & Theory", 90, Colors.red.shade400, Icons.code),
// // //         _breakdownRow(
// // //           "Practical Implementation",
// // //           80,
// // //           Colors.blue.shade400,
// // //           Icons.laptop,
// // //         ),
// // //         _breakdownRow(
// // //           "Problem Solving",
// // //           85,
// // //           Colors.orange.shade400,
// // //           Icons.lightbulb_outline,
// // //         ),
// // //         _breakdownRow(
// // //           "Creativity & Logic",
// // //           85,
// // //           Colors.purple.shade400,
// // //           Icons.star_border,
// // //         ),
// // //       ],
// // //     );
// // //   }

// // //   Widget _breakdownRow(String title, int score, Color color, IconData icon) {
// // //     return Padding(
// // //       padding: const EdgeInsets.only(bottom: 15),
// // //       child: Row(
// // //         children: [
// // //           Container(
// // //             padding: const EdgeInsets.all(10),
// // //             decoration: BoxDecoration(
// // //               color: color.withOpacity(0.1),
// // //               borderRadius: BorderRadius.circular(12),
// // //             ),
// // //             child: Icon(icon, color: color, size: 22),
// // //           ),
// // //           const SizedBox(width: 15),
// // //           Expanded(
// // //             child: Column(
// // //               children: [
// // //                 Row(
// // //                   mainAxisAlignment: MainAxisAlignment.spaceBetween,
// // //                   children: [
// // //                     Text(
// // //                       title,
// // //                       style: const TextStyle(fontWeight: FontWeight.w600),
// // //                     ),
// // //                     Text(
// // //                       "$score%",
// // //                       style: const TextStyle(fontWeight: FontWeight.bold),
// // //                     ),
// // //                   ],
// // //                 ),
// // //                 const SizedBox(height: 6),
// // //                 LinearProgressIndicator(
// // //                   value: score / 100,
// // //                   backgroundColor: Colors.grey.shade100,
// // //                   color: color,
// // //                   minHeight: 6,
// // //                   borderRadius: BorderRadius.circular(10),
// // //                 ),
// // //               ],
// // //             ),
// // //           ),
// // //         ],
// // //       ),
// // //     );
// // //   }

// // //   Widget _buildTutorFeedback() {
// // //     return Container(
// // //       padding: const EdgeInsets.all(20),
// // //       decoration: BoxDecoration(
// // //         color: const Color(0xFFEEF2FF),
// // //         borderRadius: BorderRadius.circular(20),
// // //       ),
// // //       child: Column(
// // //         crossAxisAlignment: CrossAxisAlignment.start,
// // //         children: [
// // //           const Row(
// // //             children: [
// // //               Icon(
// // //                 Icons.chat_bubble_outline,
// // //                 color: Color(0xFF4338CA),
// // //                 size: 20,
// // //               ),
// // //               SizedBox(width: 10),
// // //               Text(
// // //                 "Tutor Feedback",
// // //                 style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
// // //               ),
// // //             ],
// // //           ),
// // //           const SizedBox(height: 12),
// // //           const Text(
// // //             "Daniel shows great understanding of programming concepts. Keep practicing loops and try more creative projects.",
// // //             style: TextStyle(color: Color(0xFF374151), height: 1.5),
// // //           ),
// // //           const SizedBox(height: 10),
// // //           Text(
// // //             "- Tutor Alex",
// // //             style: TextStyle(
// // //               color: Colors.grey.shade600,
// // //               fontStyle: FontStyle.italic,
// // //             ),
// // //           ),
// // //         ],
// // //       ),
// // //     );
// // //   }

// // //   Widget _buildActionButtons() {
// // //     return Row(
// // //       children: [
// // //         Expanded(
// // //           child: OutlinedButton.icon(
// // //             onPressed: () {},
// // //             icon: const Icon(Icons.file_download_outlined),
// // //             label: const Text("Download Report"),
// // //             style: OutlinedButton.styleFrom(
// // //               padding: const EdgeInsets.symmetric(vertical: 15),
// // //               side: const BorderSide(color: Color(0xFF4338CA)),
// // //               shape: RoundedRectangleBorder(
// // //                 borderRadius: BorderRadius.circular(15),
// // //               ),
// // //             ),
// // //           ),
// // //         ),
// // //         const SizedBox(width: 15),
// // //         Expanded(
// // //           child: ElevatedButton.icon(
// // //             onPressed: () {},
// // //             icon: const Icon(Icons.share_outlined, color: Colors.white),
// // //             label: const Text(
// // //               "Share Result",
// // //               style: TextStyle(color: Colors.white),
// // //             ),
// // //             style: ElevatedButton.styleFrom(
// // //               backgroundColor: const Color(0xFF4338CA),
// // //               padding: const EdgeInsets.symmetric(vertical: 15),
// // //               shape: RoundedRectangleBorder(
// // //                 borderRadius: BorderRadius.circular(15),
// // //               ),
// // //             ),
// // //           ),
// // //         ),
// // //       ],
// // //     );
// // //   }
// // // }
// // // // import 'package:flutter/material.dart';

// // // // class ParentResultsScreen extends StatelessWidget {
// // // //   const ParentResultsScreen({super.key});

// // // //   @override
// // // //   Widget build(BuildContext context) {
// // // //     return Scaffold(
// // // //       backgroundColor: Colors.white,
// // // //       appBar: AppBar(
// // // //         title: const Text('Child Progress'),
// // // //         backgroundColor: Colors.blue,
// // // //         elevation: 0,
// // // //       ),
// // // //       body: ListView(
// // // //         padding: const EdgeInsets.all(16),
// // // //         children: [
// // // //           // Child Card
// // // //           Container(
// // // //             padding: const EdgeInsets.all(16),
// // // //             decoration: BoxDecoration(
// // // //               color: Colors.blue.shade50,
// // // //               borderRadius: BorderRadius.circular(16),
// // // //             ),
// // // //             child: Row(
// // // //               children: [
// // // //                 const CircleAvatar(radius: 30, child: Icon(Icons.child_care)),
// // // //                 const SizedBox(width: 12),
// // // //                 Column(
// // // //                   crossAxisAlignment: CrossAxisAlignment.start,
// // // //                   children: const [
// // // //                     Text(
// // // //                       "Amina K.",
// // // //                       style: TextStyle(
// // // //                         fontSize: 18,
// // // //                         fontWeight: FontWeight.bold,
// // // //                       ),
// // // //                     ),
// // // //                     Text("Grade 5 - Scratch Programming"),
// // // //                   ],
// // // //                 ),
// // // //               ],
// // // //             ),
// // // //           ),

// // // //           const SizedBox(height: 20),

// // // //           // Overall Progress
// // // //           const Text(
// // // //             "Overall Progress",
// // // //             style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
// // // //           ),
// // // //           const SizedBox(height: 8),
// // // //           LinearProgressIndicator(
// // // //             value: 0.72,
// // // //             minHeight: 10,
// // // //             backgroundColor: Colors.grey.shade300,
// // // //             color: Colors.green,
// // // //           ),
// // // //           const SizedBox(height: 6),
// // // //           const Text("72% Completion"),

// // // //           const SizedBox(height: 24),

// // // //           // Exam Results
// // // //           const Text(
// // // //             "Recent Exam Results",
// // // //             style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
// // // //           ),

// // // //           const SizedBox(height: 10),

// // // //           _resultCard(
// // // //             "Scratch Basics Test",
// // // //             85,
// // // //             "Excellent understanding of loops",
// // // //           ),
// // // //           _resultCard("Variables Quiz", 70, "Good, needs practice"),
// // // //           _resultCard("Final Project", 92, "Outstanding creativity"),

// // // //           const SizedBox(height: 24),

// // // //           // Teacher Feedback
// // // //           const Text(
// // // //             "Tutor Feedback",
// // // //             style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
// // // //           ),
// // // //           const SizedBox(height: 10),

// // // //           Container(
// // // //             padding: const EdgeInsets.all(16),
// // // //             decoration: BoxDecoration(
// // // //               color: Colors.grey.shade100,
// // // //               borderRadius: BorderRadius.circular(12),
// // // //             ),
// // // //             child: const Text(
// // // //               "Amina is improving very well in logic thinking. She should focus more on debugging exercises next week.",
// // // //             ),
// // // //           ),

// // // //           const SizedBox(height: 24),

// // // //           // CTA Button
// // // //           ElevatedButton(
// // // //             onPressed: () {},
// // // //             style: ElevatedButton.styleFrom(
// // // //               padding: const EdgeInsets.all(14),
// // // //               backgroundColor: Colors.blue,
// // // //             ),
// // // //             child: const Text("Download Full Report"),
// // // //           ),
// // // //         ],
// // // //       ),
// // // //     );
// // // //   }

// // // //   Widget _resultCard(String title, int score, String remark) {
// // // //     Color color;

// // // //     if (score >= 80) {
// // // //       color = Colors.green;
// // // //     } else if (score >= 50) {
// // // //       color = Colors.orange;
// // // //     } else {
// // // //       color = Colors.red;
// // // //     }

// // // //     return Container(
// // // //       margin: const EdgeInsets.only(bottom: 12),
// // // //       padding: const EdgeInsets.all(14),
// // // //       decoration: BoxDecoration(
// // // //         borderRadius: BorderRadius.circular(12),
// // // //         border: Border.all(color: Colors.grey.shade300),
// // // //       ),
// // // //       child: Column(
// // // //         crossAxisAlignment: CrossAxisAlignment.start,
// // // //         children: [
// // // //           Row(
// // // //             mainAxisAlignment: MainAxisAlignment.spaceBetween,
// // // //             children: [
// // // //               Expanded(
// // // //                 child: Text(
// // // //                   title,
// // // //                   style: const TextStyle(fontWeight: FontWeight.bold),
// // // //                 ),
// // // //               ),
// // // //               Text(
// // // //                 "$score%",
// // // //                 style: TextStyle(fontWeight: FontWeight.bold, color: color),
// // // //               ),
// // // //             ],
// // // //           ),
// // // //           const SizedBox(height: 6),
// // // //           Text(remark),
// // // //         ],
// // // //       ),
// // // //     );
// // // //   }
// // // // }
// import 'package:flutter/material.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';

// class ParentResultsScreen extends StatelessWidget {
//   final String studentId;
//   final String studentName;

//   const ParentResultsScreen({
//     super.key,
//     required this.studentId,
//     required this.studentName,
//   });

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       backgroundColor: const Color(0xFFF8F9FE),
//       appBar: AppBar(
//         title: const Text(
//           "Exam Results",
//           style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
//         ),
//         backgroundColor: const Color(0xFF4338CA),
//         elevation: 0,
//         iconTheme: const IconThemeData(color: Colors.white),
//       ),
//       body: FutureBuilder<DocumentSnapshot>(
//         future: FirebaseFirestore.instance
//             .collection('users')
//             .doc(studentId)
//             .get(),
//         builder: (context, snapshot) {
//           if (!snapshot.hasData)
//             return const Center(child: CircularProgressIndicator());

//           final data = snapshot.data!.data() as Map<String, dynamic>;
//           final progress = data['progress'] ?? {};
//           final level = progress['level'] ?? 1;

//           return SingleChildScrollView(
//             padding: const EdgeInsets.all(20),
//             child: Column(
//               crossAxisAlignment: CrossAxisAlignment.start,
//               children: [
//                 // Profile Card
//                 _buildCard(
//                   child: Row(
//                     children: [
//                       CircleAvatar(
//                         radius: 30,
//                         backgroundColor: Colors.indigo.shade50,
//                         child: const Icon(
//                           Icons.person,
//                           color: Color(0xFF4338CA),
//                           size: 30,
//                         ),
//                       ),
//                       const SizedBox(width: 15),
//                       Column(
//                         crossAxisAlignment: CrossAxisAlignment.start,
//                         children: [
//                           Text(
//                             studentName,
//                             style: const TextStyle(
//                               fontSize: 18,
//                               fontWeight: FontWeight.bold,
//                             ),
//                           ),
//                           Text(
//                             "Level $level • Active Student",
//                             style: const TextStyle(color: Colors.grey),
//                           ),
//                         ],
//                       ),
//                     ],
//                   ),
//                 ),
//                 const SizedBox(height: 25),

//                 const Text(
//                   "Overall Performance",
//                   style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
//                 ),
//                 const SizedBox(height: 15),

//                 // Performance Gauge Card
//                 _buildCard(
//                   child: Row(
//                     children: [
//                       Stack(
//                         alignment: Alignment.center,
//                         children: [
//                           SizedBox(
//                             height: 80,
//                             width: 80,
//                             child: CircularProgressIndicator(
//                               value: 0.85,
//                               strokeWidth: 8,
//                               color: Colors.green,
//                               backgroundColor: Colors.grey.shade100,
//                             ),
//                           ),
//                           const Text(
//                             "85%",
//                             style: TextStyle(
//                               fontWeight: FontWeight.bold,
//                               fontSize: 18,
//                             ),
//                           ),
//                         ],
//                       ),
//                       const SizedBox(width: 20),
//                       const Expanded(
//                         child: Column(
//                           crossAxisAlignment: CrossAxisAlignment.start,
//                           children: [
//                             Text(
//                               "Great job!",
//                               style: TextStyle(
//                                 fontWeight: FontWeight.bold,
//                                 color: Colors.green,
//                                 fontSize: 16,
//                               ),
//                             ),
//                             Text("Performing above average in most topics."),
//                           ],
//                         ),
//                       ),
//                     ],
//                   ),
//                 ),
//                 const SizedBox(height: 25),

//                 const Text(
//                   "Section Breakdown",
//                   style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
//                 ),
//                 const SizedBox(height: 15),
//                 _buildStatRow(
//                   "Concepts & Theory",
//                   0.90,
//                   Colors.red,
//                   Icons.psychology,
//                 ),
//                 _buildStatRow(
//                   "Practical Implementation",
//                   0.80,
//                   Colors.blue,
//                   Icons.terminal,
//                 ),
//                 _buildStatRow(
//                   "Problem Solving",
//                   0.85,
//                   Colors.orange,
//                   Icons.extension,
//                 ),
//                 _buildStatRow(
//                   "Creativity & Logic",
//                   0.85,
//                   Colors.purple,
//                   Icons.auto_awesome,
//                 ),

//                 const SizedBox(height: 25),

//                 // Feedback Card
//                 Container(
//                   padding: const EdgeInsets.all(20),
//                   decoration: BoxDecoration(
//                     color: const Color(0xFFEEF2FF),
//                     borderRadius: BorderRadius.circular(20),
//                   ),
//                   child: const Column(
//                     crossAxisAlignment: CrossAxisAlignment.start,
//                     children: [
//                       Row(
//                         children: [
//                           Icon(
//                             Icons.chat_bubble_outline,
//                             color: Color(0xFF4338CA),
//                             size: 20,
//                           ),
//                           SizedBox(width: 10),
//                           Text(
//                             "Tutor Feedback",
//                             style: TextStyle(
//                               fontWeight: FontWeight.bold,
//                               color: Color(0xFF4338CA),
//                             ),
//                           ),
//                         ],
//                       ),
//                       SizedBox(height: 10),
//                       Text(
//                         "Showing exceptional growth in logical reasoning. Next milestone: Advanced Loops.",
//                         style: TextStyle(color: Color(0xFF374151), height: 1.4),
//                       ),
//                     ],
//                   ),
//                 ),

//                 const SizedBox(height: 30),
//                 Row(
//                   children: [
//                     Expanded(
//                       child: _actionButton("Download", Icons.download, false),
//                     ),
//                     const SizedBox(width: 15),
//                     Expanded(
//                       child: _actionButton("Share Result", Icons.share, true),
//                     ),
//                   ],
//                 ),
//               ],
//             ),
//           );
//         },
//       ),
//     );
//   }

//   Widget _buildCard({required Widget child}) {
//     return Container(
//       width: double.infinity,
//       padding: const EdgeInsets.all(20),
//       decoration: BoxDecoration(
//         color: Colors.white,
//         borderRadius: BorderRadius.circular(20),
//         boxShadow: [
//           BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10),
//         ],
//       ),
//       child: child,
//     );
//   }

//   Widget _buildStatRow(String title, double val, Color color, IconData icon) {
//     return Padding(
//       padding: const EdgeInsets.only(bottom: 15),
//       child: Row(
//         children: [
//           Icon(icon, color: color, size: 22),
//           const SizedBox(width: 15),
//           Expanded(
//             child: Column(
//               children: [
//                 Row(
//                   mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                   children: [
//                     Text(
//                       title,
//                       style: const TextStyle(fontWeight: FontWeight.w500),
//                     ),
//                     Text(
//                       "${(val * 100).toInt()}%",
//                       style: const TextStyle(fontWeight: FontWeight.bold),
//                     ),
//                   ],
//                 ),
//                 const SizedBox(height: 8),
//                 LinearProgressIndicator(
//                   value: val,
//                   color: color,
//                   backgroundColor: color.withOpacity(0.1),
//                   minHeight: 6,
//                   borderRadius: BorderRadius.circular(10),
//                 ),
//               ],
//             ),
//           ),
//         ],
//       ),
//     );
//   }

//   Widget _actionButton(String label, IconData icon, bool primary) {
//     return ElevatedButton.icon(
//       onPressed: () {},
//       icon: Icon(icon, color: primary ? Colors.white : const Color(0xFF4338CA)),
//       label: Text(label),
//       style: ElevatedButton.styleFrom(
//         backgroundColor: primary ? const Color(0xFF4338CA) : Colors.white,
//         foregroundColor: primary ? Colors.white : const Color(0xFF4338CA),
//         elevation: 0,
//         side: primary
//             ? BorderSide.none
//             : const BorderSide(color: Color(0xFF4338CA)),
//         shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
//         padding: const EdgeInsets.symmetric(vertical: 15),
//       ),
//     );
//   }
// }
