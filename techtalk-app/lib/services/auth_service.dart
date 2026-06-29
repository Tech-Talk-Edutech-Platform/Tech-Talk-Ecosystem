import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:techtalk/screens/login.dart';

// class AuthService {
//   final supabase = Supabase.instance.client;

//   Future<bool> signInWithGoogle() async {
//     final response = await supabase.auth.signInWithOAuth(
//       OAuthProvider.google,
//       redirectTo: kIsWeb ? null : 'io.supabase.techtalk://login-callback',
//     );

//     return response;
//   }

//   Future<void> logout(BuildContext context) async {
//     await supabase.auth.signOut();

//     if (context.mounted) {
//       Navigator.of(context).pushAndRemoveUntil(
//         MaterialPageRoute(builder: (_) => const LoginScreen()),
//         (route) => false,
//       );
//     }
//   }

//   User? get currentUser => supabase.auth.currentUser;
// }
class AuthService {
  final supabase = Supabase.instance.client;

  Future<void> signInWithGoogle() async {
    await supabase.auth.signInWithOAuth(
      OAuthProvider.google,
      // redirectTo: kIsWeb ? null : 'io.supabase.techtalk://login-callback',
      redirectTo: 'io.supabase.techtalk://login-callback',
      
      //   redirectTo: kIsWeb
      //       ? 'http://localhost:39881'
      //       : 'io.supabase.techtalk://login-callback',
    );
  }

  Future<void> logout(BuildContext context) async {
    await supabase.auth.signOut();

    if (context.mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (_) => false,
      );
    }
  }

  User? get currentUser => supabase.auth.currentUser;
}
// // import 'package:flutter/material.dart';
// // import 'package:supabase_flutter/supabase_flutter.dart';
// // import 'package:flutter/foundation.dart';

// // class AuthService {
// //   final SupabaseClient _supabase = Supabase.instance.client;

// //   // 🔐 Google Login (Supabase)
// //   Future<void> signInWithGoogle(BuildContext context) async {
// //     try {
// //       await _supabase.auth.signInWithOAuth(
// //         OAuthProvider.google,
// //         redirectTo: kIsWeb ? null : 'io.supabase.techtalk://login-callback',
// //       );
// //     } catch (e) {
// //       debugPrint("Google Sign-In Error: $e");
// //       rethrow;
// //     }
// //   }

// //   // 🚪 Logout
// //   Future<void> logout(BuildContext context) async {
// //     await _supabase.auth.signOut();
// //   }

// //   // 👤 Current user
// //   User? get currentUser => _supabase.auth.currentUser;
// // }
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:google_sign_in/google_sign_in.dart';
// import 'package:flutter/foundation.dart' show kIsWeb;
// import 'package:flutter/material.dart';
// import 'package:techtalk/screens/login.dart';

// class AuthService {
//   final FirebaseAuth _auth = FirebaseAuth.instance;

//   // ✅ Mobile Google Sign-In
//   final GoogleSignIn _googleSignIn = GoogleSignIn(scopes: ['email']);

//   Future<UserCredential?> signInWithGoogle(BuildContext context) async {
//     try {
//       UserCredential userCredential;

//       // ✅ Clean logout (DO NOT use disconnect)
//       await _auth.signOut();
//       if (!kIsWeb) {
//         await _googleSignIn.signOut();
//       }

//       if (kIsWeb) {
//         // ✅ WEB: force account chooser every time
//         final googleProvider = GoogleAuthProvider()
//           ..setCustomParameters({'prompt': 'select_account'});

//         userCredential = await _auth.signInWithPopup(googleProvider);
//       } else {
//         // ✅ MOBILE: will now show account chooser properly
//         final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

//         if (googleUser == null) {
//           throw Exception("Google sign-in aborted");
//         }

//         final GoogleSignInAuthentication googleAuth =
//             await googleUser.authentication;

//         final credential = GoogleAuthProvider.credential(
//           accessToken: googleAuth.accessToken,
//           idToken: googleAuth.idToken,
//         );

//         userCredential = await _auth.signInWithCredential(credential);
//       }

//       return userCredential;
//     } catch (e) {
//       debugPrint("❌ Google Sign-In Error: $e");
//       rethrow;
//     }
//   }

//   Future<void> logout(BuildContext context) async {
//     await _auth.signOut();

//     if (!kIsWeb) {
//       await _googleSignIn.signOut(); // ✅ no disconnect
//     }

//     if (context.mounted) {
//       Navigator.of(context).pushAndRemoveUntil(
//         MaterialPageRoute(builder: (_) => const LoginScreen()),
//         (route) => false,
//       );
//     }
//   }

//   User? get currentUser => _auth.currentUser;
// }
// // import 'package:firebase_auth/firebase_auth.dart';
// // import 'package:google_sign_in/google_sign_in.dart';
// // import 'package:flutter/foundation.dart' show kIsWeb;
// // import 'package:flutter/material.dart';
// // import 'package:techtalk/screens/login.dart';

// // class AuthService {
// //   final FirebaseAuth _auth = FirebaseAuth.instance;
// //   final GoogleSignIn _googleSignIn = GoogleSignIn.standard(); // ✅ fixed

// //   Future<UserCredential?> signInWithGoogle(BuildContext context) async {
// //     if (_auth.currentUser != null) return null;

// //     UserCredential userCredential;

// //     if (kIsWeb) {
// //       // ✅ Web flow
// //       final googleProvider = GoogleAuthProvider();
// //       userCredential = await _auth.signInWithPopup(googleProvider);
// //     } else {
// //       // ✅ Mobile flow
// //       final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
// //       if (googleUser == null) throw Exception("Google sign-in aborted");

// //       final GoogleSignInAuthentication googleAuth =
// //           await googleUser.authentication;

// //       final credential = GoogleAuthProvider.credential(
// //         accessToken: googleAuth.accessToken,
// //         idToken: googleAuth.idToken,
// //       );

// //       userCredential = await _auth.signInWithCredential(credential);
// //     }


// //     return userCredential;
// //   }

// //   Future<void> logout(BuildContext context) async {
// //     await _auth.signOut();
// //     if (!kIsWeb) {
// //       await _googleSignIn.signOut();
// //     }

// //     if (context.mounted) {
// //       Navigator.of(context).pushAndRemoveUntil(
// //         MaterialPageRoute(builder: (_) => const LoginScreen()),
// //         (route) => false,
// //       );
// //     }
// //   }

// // //   User? get currentUser => _auth.currentUser;
// // // }
// // // // //*****************THE MAIN */
// // // // // import 'package:firebase_auth/firebase_auth.dart';
// // // // // import 'package:google_sign_in/google_sign_in.dart';
// // // // // import 'package:flutter/foundation.dart' show kIsWeb;
// // // // // import 'package:flutter/material.dart';
// // // // // import 'package:coursebuddy/screens/login.dart';

// // // // // class AuthService {
// // // // //   final FirebaseAuth _auth = FirebaseAuth.instance;
// // // // //   final GoogleSignIn _googleSignIn = GoogleSignIn();

// // // // //   Future<UserCredential?> signInWithGoogle(BuildContext context) async {
// // // // //     // ✅ Guard: if already logged in, skip
    
// // // // //     if (_auth.currentUser != null) {
// // // // //       return null; // no need to sign in again
// // // // //     }

// // // // //     if (kIsWeb) {
// // // // //       // ✅ Web flow: popup once
// // // // //       final googleProvider = GoogleAuthProvider();
// // // // //       return await _auth.signInWithPopup(googleProvider);
// // // // //     } else {
// // // // //       // ✅ Mobile flow
// // // // //       final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
// // // // //       if (googleUser == null) {
// // // // //         throw Exception("Google sign-in aborted");
// // // // //       }

// // // // //       final GoogleSignInAuthentication googleAuth =
// // // // //           await googleUser.authentication;

// // // // //       final credential = GoogleAuthProvider.credential(
// // // // //         accessToken: googleAuth.accessToken,
// // // // //         idToken: googleAuth.idToken,
// // // // //       );

// // // // //       return await _auth.signInWithCredential(credential);
// // // // //     }
   
// // // // //   }

// // // // //   Future<void> logout(BuildContext context) async {
// // // // //     await _auth.signOut();
// // // // //     if (!kIsWeb) {
// // // // //       await _googleSignIn.signOut();
// // // // //     }

// // // // //     if (context.mounted) {
// // // // //       Navigator.of(context).pushAndRemoveUntil(
// // // // //         MaterialPageRoute(builder: (_) => const LoginScreen()),
// // // // //         (route) => false,
// // // // //       );
// // // // //     }
// // // // //   }

// // // // //   User? get currentUser => _auth.currentUser;
// // // // // }
// // // // //********************** */
