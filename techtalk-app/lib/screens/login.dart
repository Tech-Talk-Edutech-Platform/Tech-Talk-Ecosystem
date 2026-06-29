import 'package:flutter/material.dart';
import 'package:sign_in_button/sign_in_button.dart';
import 'package:techtalk/constants/app_theme.dart';
import 'package:techtalk/services/auth_gate.dart';
import 'package:techtalk/services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final AuthService _authService = AuthService();
  bool _busy = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
          ),
        ),
        child: Center(
          child: Card(
            margin: const EdgeInsets.symmetric(horizontal: 32),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Image.asset('assets/images/coursebuddy_logo.png', height: 64),
                  const SizedBox(height: 16),

                  const Text(
                    "Learn. Build. Succeed.",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),

                  const SizedBox(height: 20),

                  SignInButton(
                    Buttons.google,
                    text: _busy ? "Signing in..." : "Sign in with Google",
                    onPressed: () async {
                      if (_busy) return;
                      setState(() => _busy = true);

                      try {
                        await _authService.signInWithGoogle();

                        if (!context.mounted) return;

                        Navigator.of(context).pushAndRemoveUntil(
                          MaterialPageRoute(builder: (_) => const AuthGate()),
                          (_) => false,
                        );
                      } catch (_) {
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("Sign-in cancelled")),
                        );
                      } finally {
                        if (mounted) setState(() => _busy = false);
                      }
                    },
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
// // import 'package:flutter/material.dart';
// // import 'package:sign_in_button/sign_in_button.dart';
// // import 'package:techtalk/constants/app_theme.dart';
// // import 'package:techtalk/services/auth_service.dart';
// // import 'package:techtalk/services/auth_gate.dart';

// // class LoginScreen extends StatefulWidget {
// //   const LoginScreen({super.key});

// //   @override
// //   State<LoginScreen> createState() => _LoginScreenState();
// // }

// // class _LoginScreenState extends State<LoginScreen> {
// //   final AuthService _authService = AuthService();
// //   bool _busy = false;

// //   @override
// //   Widget build(BuildContext context) {
// //     final size = MediaQuery.of(context).size;

// //     return Scaffold(
// //       body: Container(
// //         width: double.infinity,
// //         height: double.infinity,
// //         decoration: BoxDecoration(
// //           gradient: LinearGradient(
// //             colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
// //           ),
// //         ),
// //         child: Center(
// //           child: Card(
// //             elevation: 10,
// //             shape: RoundedRectangleBorder(
// //               borderRadius: BorderRadius.circular(20),
// //             ),
// //             margin: const EdgeInsets.symmetric(horizontal: 32),
// //             child: Padding(
// //               padding: const EdgeInsets.all(24),
// //               child: SizedBox(
// //                 width: size.width > 400 ? 350 : size.width * 0.8,
// //                 child: Column(
// //                   mainAxisSize: MainAxisSize.min,
// //                   children: [
// //                     Image.asset(
// //                       'assets/images/coursebuddy_logo.png',
// //                       width: 64,
// //                       height: 64,
// //                     ),
// //                     const SizedBox(height: 20),

// //                     const Text(
// //                       "Learn. Build. Succeed.",
// //                       textAlign: TextAlign.center,
// //                       style: TextStyle(
// //                         fontSize: 20,
// //                         fontWeight: FontWeight.bold,
// //                       ),
// //                     ),

// //                     const SizedBox(height: 20),

// //                     SignInButton(
// //                       Buttons.google,
// //                       text: _busy ? "Signing in..." : "Sign in with Google",
// //                       onPressed: () async {
// //                         if (_busy) return;
// //                         setState(() => _busy = true);

// //                         try {
// //                           await _authService.signInWithGoogle(context);

// //                           if (!context.mounted) return;

// //                           Navigator.of(context).pushAndRemoveUntil(
// //                             MaterialPageRoute(builder: (_) => const AuthGate()),
// //                             (route) => false,
// //                           );
// //                         } catch (e) {
// //                           if (!context.mounted) return;

// //                           ScaffoldMessenger.of(context).showSnackBar(
// //                             const SnackBar(
// //                               content: Text("Sign-in failed or cancelled"),
// //                             ),
// //                           );
// //                         } finally {
// //                           if (mounted) setState(() => _busy = false);
// //                         }
// //                       },
// //                     ),
// //                   ],
// //                 ),
// //               ),
// //             ),
// //           ),
// //         ),
// //       ),
// //     );
// //   }
// // }
// import 'package:flutter/material.dart';
// import 'package:sign_in_button/sign_in_button.dart';
// import 'package:techtalk/constants/app_theme.dart';
// import 'package:techtalk/services/auth_gate.dart';
// import 'package:techtalk/services/auth_service.dart';

// class LoginScreen extends StatefulWidget {
//   const LoginScreen({super.key});

//   @override
//   State<LoginScreen> createState() => _LoginScreenState();
// }

// class _LoginScreenState extends State<LoginScreen> {
//   final AuthService _authService = AuthService();
//   bool _busy = false;

//   @override
//   Widget build(BuildContext context) {
//     final size = MediaQuery.of(context).size;

//     return Scaffold(
//       body: Container(
//         width: double.infinity,
//         height: double.infinity,
//         decoration: BoxDecoration(
//           gradient: LinearGradient(
//             colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
//             begin: Alignment.topLeft,
//             end: Alignment.bottomRight,
//           ),
//         ),
//         child: Center(
//           child: Card(
//             elevation: 10,
//             shape: RoundedRectangleBorder(
//               borderRadius: BorderRadius.circular(20),
//             ),
//             margin: const EdgeInsets.symmetric(horizontal: 32),
//             child: Padding(
//               padding: const EdgeInsets.all(24.0),
//               child: SizedBox(
//                 width: size.width > 400 ? 350 : size.width * 0.8,
//                 child: Column(
//                   mainAxisSize: MainAxisSize.min,
//                   children: [
//                     Image.asset(
//                       'assets/images/coursebuddy_logo.png',
//                       width: 64,
//                       height: 64,
//                     ),
//                     const SizedBox(height: 20),
//                     Text(
//                       'Learn. Build. Succeed.',
//                       textAlign: TextAlign.center,
//                       style: TextStyle(
//                         fontSize: 20,
//                         fontWeight: FontWeight.bold,
//                         color: AppTheme.textColor,
//                       ),
//                     ),
//                     const SizedBox(height: 16),

//                     AbsorbPointer(
//                       absorbing: _busy,
//                       child: Opacity(
//                         opacity: _busy ? 0.6 : 1,
//                         child: SignInButton(
//                           Buttons.google,
//                           text: _busy ? "Signing in..." : "Sign in with Google",
//                           onPressed: () async {
//                             if (_busy) return;
//                             setState(() => _busy = true);

//                             try {
//                               // ✅ Skip popup if already signed in
//                               if (_authService.currentUser != null) {
//                                 Navigator.of(context).pushAndRemoveUntil(
//                                   MaterialPageRoute(
//                                       builder: (_) => const AuthGate()),
//                                   (route) => false,
//                                 );
//                                 return;
//                               }

//                               await _authService.signInWithGoogle(context);

//                               if (!context.mounted) return;

//                               // ✅ Redirect to AuthGate (routes via user_router)
//                               Navigator.of(context).pushAndRemoveUntil(
//                                 MaterialPageRoute(
//                                     builder: (_) => const AuthGate()),
//                                 (route) => false,
//                               );

//                               ScaffoldMessenger.of(context).showSnackBar(
//                                 const SnackBar(
//                                     content: Text('Signed in successfully!')),
//                               );
//                             } catch (e) {
//                               if (!context.mounted) return;
//                               ScaffoldMessenger.of(context).showSnackBar(
//                                 // SnackBar(content: Text('Sign-in failed: $e')),
//                                 SnackBar(content: Text('You closed Sign-in popup!')),
//                               );
//                             } finally {
//                               if (mounted) {
//                                 setState(() => _busy = false);
//                               }
//                             }
//                           },
//                         ),
//                       ),
//                     ),
//                   ],
//                 ),
//               ),
//             ),
//           ),
//         ),
//       ),
//     );
//   }
// }
