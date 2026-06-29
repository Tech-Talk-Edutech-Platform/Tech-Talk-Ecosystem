import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:techtalk/constants/app_theme.dart';

class NotificationScreen extends StatelessWidget {
  NotificationScreen({super.key});

  final supabase = Supabase.instance.client;

  Future<void> _markAsRead(String id) async {
    await supabase.from('notifications').update({'read': true}).eq('id', id);
  }

  @override
  Widget build(BuildContext context) {
    final user = supabase.auth.currentUser;

    if (user == null) {
      return const Scaffold(body: Center(child: Text("Not logged in")));
    }

    final stream = supabase
        .from('notifications')
        .stream(primaryKey: ['id'])
        .eq('user_id', user.id)
        .order('created_at');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: AppTheme.primaryColor,
      ),
      body: StreamBuilder<List<Map<String, dynamic>>>(
        stream: stream,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          final docs = snapshot.data!;

          if (docs.isEmpty) {
            return const Center(child: Text("No notifications yet."));
          }

          return ListView.separated(
            padding: const EdgeInsets.all(12),
            itemCount: docs.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, i) {
              final data = docs[i];
              final isRead = data['read'] == true;

              return ListTile(
                tileColor: isRead ? Colors.grey[100] : Colors.orange[50],
                title: Text(
                  data['message'] ?? '',
                  style: TextStyle(
                    fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                  ),
                ),
                trailing: isRead
                    ? null
                    : IconButton(
                        icon: const Icon(Icons.check, color: Colors.orange),
                        onPressed: () => _markAsRead(data['id']),
                      ),
              );
            },
          );
        },
      ),
    );
  }
}
// import 'package:flutter/material.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:techtalk/constants/app_theme.dart';

// class NotificationScreen extends StatelessWidget {
//   const NotificationScreen({super.key});

//   Future<void> _markAsRead(String id) async {
//     await FirebaseFirestore.instance.collection('notifications').doc(id).update(
//       {'read': true},
//     );
//   }

//   @override
//   Widget build(BuildContext context) {
//     final uid = FirebaseAuth.instance.currentUser?.uid;

//     if (uid == null) {
//       return const Scaffold(body: Center(child: Text("Not logged in")));
//     }

//     final stream = FirebaseFirestore.instance
//         .collection('notifications')
//         .where('uid', isEqualTo: uid)
//         .orderBy('receivedAt', descending: true)
//         .snapshots();

//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('Notifications'),
//         backgroundColor: AppTheme.primaryColor,
//       ),
//       body: StreamBuilder<QuerySnapshot>(
//         stream: stream,
//         builder: (context, snapshot) {
//           if (!snapshot.hasData) {
//             return const Center(child: CircularProgressIndicator());
//           }

//           final docs = snapshot.data!.docs;

//           if (docs.isEmpty) {
//             return const Center(child: Text("No notifications yet."));
//           }

//           return ListView.separated(
//             padding: const EdgeInsets.all(12),
//             itemCount: docs.length,
//             separatorBuilder: (_, __) => const SizedBox(height: 8),
//             itemBuilder: (context, i) {
//               final doc = docs[i];
//               final data = doc.data() as Map<String, dynamic>;
//               final isRead = data['read'] == true;

//               return ListTile(
//                 tileColor: isRead ? Colors.grey[100] : Colors.orange[50],
//                 title: Text(
//                   data['title'] ?? '',
//                   style: TextStyle(
//                     fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
//                   ),
//                 ),
//                 subtitle: Text(data['body'] ?? ''),
//                 trailing: isRead
//                     ? null
//                     : IconButton(
//                         icon: const Icon(Icons.check, color: Colors.orange),
//                         onPressed: () => _markAsRead(doc.id),
//                       ),
//               );
//             },
//           );
//         },
//       ),
//     );
//   }
// }
// // import 'package:flutter/material.dart';
// // import 'package:cloud_firestore/cloud_firestore.dart';
// // import 'package:firebase_auth/firebase_auth.dart';
// // import 'package:techtalk/constants/app_theme.dart';

// // class NotificationScreen extends StatelessWidget {
// //   const NotificationScreen({super.key});

// //   Future<void> _markAsRead(String docId) async {
// //     await FirebaseFirestore.instance
// //         .collection('notifications')
// //         .doc(docId)
// //         .update({
// //       'read': true,
// //     });
// //   }

// //   @override
// //   Widget build(BuildContext context) {
// //     final uid = FirebaseAuth.instance.currentUser?.uid;

// //     if (uid == null) {
// //       return const Center(child: Text("Not logged in"));
// //     }

// //     final notificationsRef = FirebaseFirestore.instance
// //         .collection('notifications')
// //         .where('uid', isEqualTo: uid)
// //         .orderBy('receivedAt', descending: true);

// //     return Scaffold(
// //       appBar: AppBar(
// //         title: const Text('Notifications'),
// //         backgroundColor: AppTheme.primaryColor,
// //       ),
// //       body: StreamBuilder(
// //         stream: notificationsRef.snapshots(),
// //         builder: (context, AsyncSnapshot<QuerySnapshot> snapshot) {
// //           if (snapshot.connectionState == ConnectionState.waiting) {
// //             return const Center(child: CircularProgressIndicator());
// //           }

// //           if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
// //             return const Center(child: Text("No notifications yet."));
// //           }

// //           final docs = snapshot.data!.docs;

// //           return ListView.separated(
// //             padding: const EdgeInsets.all(12),
// //             itemCount: docs.length,
// //             // separatorBuilder: (_, __) => const SizedBox(height: 8),
// //             separatorBuilder: (_, index) => const SizedBox(height: 8),
// //             itemBuilder: (context, index) {
// //               final doc = docs[index];
// //               final data = doc.data() as Map<String, dynamic>;
// //               final isRead = data['read'] == true;

// //               return ListTile(
// //                 tileColor:
// //                     isRead ? Colors.grey[100] : AppTheme.receivedMessageColor,
// //                 title: Text(
// //                   data['title'] ?? 'No Title',
// //                   style: TextStyle(
// //                     fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
// //                     color: AppTheme.textColor,
// //                   ),
// //                 ),
// //                 subtitle: Text(
// //                   data['body'] ?? 'No Body',
// //                   style: TextStyle(color: AppTheme.textColor),
// //                 ),
// //                 trailing: isRead
// //                     ? null
// //                     : IconButton(
// //                         icon:
// //                             const Icon(Icons.check, color: Colors.orangeAccent),
// //                         onPressed: () => _markAsRead(doc.id),
// //                       ),
// //               );
// //             },
// //           );
// //         },
// //       ),
// //     );
// //   }
// // }


// // // notifications collection
// // // {
// // //   "uid": "parentUserUid",
// // //   "title": "Class Reminder",
// // //   "body": "Your child has a session tomorrow at 5PM.",
// // //   "read": false,
// // //   "receivedAt": "2025-10-18T12:00:00Z"
// // // }
// // // // students collection
// // // {
// // //   "name": "Aiden",
// // //   "parentEmail": "parent@example.com",
// // //   "courseId": "PythonKids101",
// // //   "assignedTeachers": ["teacher1@example.com"],
// // //   "progress": 75,
// // //   "classesTaken": 15,
// // //   "totalClasses": 20,
// // //   "topics": ["Loops", "Variables", "Scratch"],
// // //   "quizResults": [
// // //     {"topic": "Loops", "score": 90},
// // //     {"topic": "Variables", "score": 85}
// // //   ]
// // // }