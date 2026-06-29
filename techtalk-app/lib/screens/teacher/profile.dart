import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class TeacherAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String teacherName;
  final String? imageUrl;

  const TeacherAppBar({super.key, required this.teacherName, this.imageUrl});

  @override
  Widget build(BuildContext context) {
    final user = Supabase.instance.client.auth.currentUser;

    return AppBar(
      title: const Text('Teacher Dashboard'),
      actions: [
        PopupMenuButton(
          icon: CircleAvatar(
            backgroundImage: imageUrl != null ? NetworkImage(imageUrl!) : null,
            child: imageUrl == null
                ? Text(teacherName.isNotEmpty ? teacherName[0] : '?')
                : null,
          ),
          itemBuilder: (_) => const [
            PopupMenuItem(value: 'logout', child: Text('Logout')),
          ],
          onSelected: (value) async {
            if (value == 'logout') {
              await Supabase.instance.client.auth.signOut();
              if (context.mounted) {
                Navigator.pushReplacementNamed(context, '/login');
              }
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
// import 'package:firebase_auth/firebase_auth.dart';

// class TeacherAppBar extends StatelessWidget implements PreferredSizeWidget {
//   final String? imageUrl;
//   final String teacherName;

//   const TeacherAppBar({super.key, this.imageUrl, required this.teacherName});

//   @override
//   Widget build(BuildContext context) {
//     return AppBar(
//       title: const Text('Teacher Dashboard'),
//       actions: [
//         PopupMenuButton(
//           icon: CircleAvatar(
//             backgroundColor: Colors.orangeAccent,
//             backgroundImage: imageUrl != null ? NetworkImage(imageUrl!) : null,
//             child: imageUrl == null
//                 ? Text(
//                     teacherName.isNotEmpty ? teacherName[0].toUpperCase() : '?',
//                     style: const TextStyle(color: Colors.white),
//                   )
//                 : null,
//           ),
//           itemBuilder: (context) => [
//             const PopupMenuItem(value: 'logout', child: Text('Logout')),
//           ],
//           onSelected: (value) async {
//             if (value == 'logout') {
//               await FirebaseAuth.instance.signOut();
//               if (context.mounted) {
//                 Navigator.of(context).pushReplacementNamed('/login');
//               }
//             }
//           },
//         ),
//       ],
//     );
//   }

//   @override
//   Size get preferredSize => const Size.fromHeight(kToolbarHeight);
// }
