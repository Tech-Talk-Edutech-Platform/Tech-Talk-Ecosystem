import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:techtalk/widgets/logout_button.dart';

class StudentAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String? imageUrl;
  final String studentName;

  const StudentAppBar({super.key, this.imageUrl, required this.studentName});

  Future<void> _logout(BuildContext context) async {
    await Supabase.instance.client.auth.signOut();

    if (context.mounted) {
      Navigator.of(context).pushReplacementNamed('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: const Text('Student Dashboard'),
      actions: [
        PopupMenuButton(
          icon: CircleAvatar(
            backgroundColor: Colors.orangeAccent,
            backgroundImage: imageUrl != null ? NetworkImage(imageUrl!) : null,
            child: imageUrl == null
                ? Text(
                    studentName.isNotEmpty ? studentName[0].toUpperCase() : '?',
                    style: const TextStyle(color: Colors.white),
                  )
                : null,
          ),
          itemBuilder: (context) => const [
            PopupMenuItem(value: 'logout', child: Text('Logout')),
          ],
          onSelected: (value) async {
            if (value == 'logout') {
              await _logout(context);
            }
          },
        ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
// import 'package:flutter/material.dart';
// import 'package:techtalk/widgets/logout_button.dart';
// class StudentAppBar extends StatelessWidget implements PreferredSizeWidget {
//   final String? imageUrl;
//   final String studentName;

//   const StudentAppBar({super.key, this.imageUrl, required this.studentName});

//   @override
//   Widget build(BuildContext context) {
//     return AppBar(
//       title: const Text('Student Dashboard'),
//       actions: [
//         PopupMenuButton(
//           icon: CircleAvatar(
//             backgroundColor: Colors.orangeAccent,
//             backgroundImage: imageUrl != null ? NetworkImage(imageUrl!) : null,
//             child: imageUrl == null
//                 ? Text(
//                     studentName.isNotEmpty
//                         ? studentName[0].toUpperCase()
//                         : '?',
//                     style: const TextStyle(color: Colors.white),
//                   )
//                 : null,
//           ),
//           itemBuilder: (context) => [
//             const PopupMenuItem(
//               value: 'logout',
//               child: Text('Logout'),
//             ),
//           ],
//           onSelected: (value) async {
//             if (value == 'logout') {
//               await logout(context); // use the shared logout function
//             }
//           },
//         ),
//       ],
//     );
//   }

//   @override
//   Size get preferredSize => const Size.fromHeight(kToolbarHeight);
// }

// // import 'package:flutter/material.dart';
// // import 'package:firebase_auth/firebase_auth.dart';

// // class StudentAppBar extends StatelessWidget implements PreferredSizeWidget {
// //   final String? imageUrl;
// //   final String studentName;

// //   const StudentAppBar({super.key, this.imageUrl, required this.studentName});

// //   @override
// //   Widget build(BuildContext context) {
// //     return AppBar(
// //       title: const Text('Student Dashboard'),
// //       actions: [
// //         PopupMenuButton(
// //           icon: CircleAvatar(
// //             backgroundColor: Colors.orangeAccent,
// //             backgroundImage: imageUrl != null ? NetworkImage(imageUrl!) : null,
// //             child: imageUrl == null
// //                 ? Text(
// //                     studentName.isNotEmpty
// //                         ? studentName[0].toUpperCase()
// //                         : '?',
// //                     style: const TextStyle(color: Colors.white),
// //                   )
// //                 : null,
// //           ),
// //           itemBuilder: (context) => [
// //             const PopupMenuItem(
// //               value: 'logout',
// //               child: Text('Logout'),
// //             ),
// //           ],
// //           onSelected: (value) async {
// //             if (value == 'logout') {
// //               await FirebaseAuth.instance.signOut();
// //               if (context.mounted) {
// //                 Navigator.of(context).pushReplacementNamed('/login');
// //               }
// //             }
// //           },
// //         ),
// //       ],
// //     );
// //   }

// //   @override
// //   Size get preferredSize => const Size.fromHeight(kToolbarHeight);
// // }
