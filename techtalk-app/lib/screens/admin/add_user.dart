import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AddUserScreen extends StatefulWidget {
  const AddUserScreen({super.key});

  @override
  State<AddUserScreen> createState() => _AddUserScreenState();
}

class _AddUserScreenState extends State<AddUserScreen> {
  final supabase = Supabase.instance.client;

  final _emailController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  String _role = 'student';
  bool _loading = false;

  Future<void> _addUser() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);

    try {
      // 🔥 CALL EDGE FUNCTION (replace Firebase Function)
      final res = await supabase.functions.invoke(
        'create-user',
        body: {'email': _emailController.text.trim(), 'role': _role},
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(res.data['message'] ?? 'User created')),
      );

      _emailController.clear();
      setState(() => _role = 'student');
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Error: $e")));
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Add User")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: "Email"),
                validator: (v) => v!.isEmpty ? "Enter email" : null,
              ),

              DropdownButtonFormField(
                value: _role,
                items: const [
                  DropdownMenuItem(value: 'student', child: Text('Student')),
                  DropdownMenuItem(value: 'teacher', child: Text('Teacher')),
                  DropdownMenuItem(value: 'parent', child: Text('Parent')),
                ],
                onChanged: (v) => setState(() => _role = v.toString()),
              ),

              const SizedBox(height: 20),

              ElevatedButton(
                onPressed: _loading ? null : _addUser,
                child: Text(_loading ? "Adding..." : "Add User"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
// // lib/screens/add_user_screen.dart
// import 'package:flutter/material.dart';
// import 'package:cloud_functions/cloud_functions.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';

// class AddUserScreen extends StatefulWidget {
//   const AddUserScreen({super.key});

//   @override
//   State<AddUserScreen> createState() => _AddUserScreenState();
// }

// class _AddUserScreenState extends State<AddUserScreen> {
//   final TextEditingController _emailController = TextEditingController();
//   final _formKey = GlobalKey<FormState>();

//   String _role = 'student';
//   List<String> _selectedCourseIds = [];
//   List<String> _selectedTeacherIds = [];
//   List<String> _selectedParentIds = [];
//   bool _loading = false;

//   Future<void> _addUser() async {
//     if (!_formKey.currentState!.validate()) return;
//     setState(() => _loading = true);

//     try {
//       final callable = FirebaseFunctions.instance.httpsCallable('createUser');
//       final result = await callable.call({
//         'email': _emailController.text.trim(),
//         'requestedRole': _role,
//         'courseIds': _selectedCourseIds,
//         'teacherIds': _selectedTeacherIds,
//         'parentIds': _selectedParentIds,
//       });

//       final resData = result.data;
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(
//           content: Text(resData['message'] ?? 'User added successfully'),
//         ),
//       );

//       _emailController.clear();
//       setState(() {
//         _role = 'student';
//         _selectedCourseIds = [];
//         _selectedTeacherIds = [];
//         _selectedParentIds = [];
//       });
//     } on FirebaseFunctionsException catch (e) {
//       print('Code: ${e.code}');
//       print('Details: ${e.details}'); // This often contains the real error
//       print('Message: ${e.message}');
//       ScaffoldMessenger.of(
//         context,
//       ).showSnackBar(SnackBar(content: Text('❌ Error: ${e.message}')));
//     } catch (e) {
//       ScaffoldMessenger.of(
//         context,
//       ).showSnackBar(SnackBar(content: Text('❌ Something went wrong: $e')));
//     } finally {
//       setState(() => _loading = false);
//     }
//   }

//   Widget _buildRoleDropdown() {
//     return DropdownButtonFormField<String>(
//       initialValue: _role,
//       items: const [
//         DropdownMenuItem(value: 'student', child: Text('Student')),
//         DropdownMenuItem(value: 'teacher', child: Text('Teacher')),
//         DropdownMenuItem(value: 'parent', child: Text('Parent')),
//       ],
//       onChanged: (v) => setState(() => _role = v!),
//       decoration: const InputDecoration(labelText: 'Select Role'),
//     );
//   }

//   Widget _buildCourseMultiSelect() {
//     return StreamBuilder<QuerySnapshot>(
//       stream: FirebaseFirestore.instance
//           .collection('courses')
//           .orderBy('title')
//           .snapshots(),
//       builder: (context, snapshot) {
//         if (!snapshot.hasData) {
//           return const Padding(
//             padding: EdgeInsets.all(12),
//             child: Center(child: CircularProgressIndicator()),
//           );
//         }
//         final courses = snapshot.data!.docs;
//         return Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             const Text('Select Courses'),
//             const SizedBox(height: 8),
//             Wrap(
//               spacing: 8,
//               children: courses.map((doc) {
//                 final id = doc.id;
//                 final title =
//                     (doc.data() as Map<String, dynamic>)['title'] ?? id;
//                 final selected = _selectedCourseIds.contains(id);
//                 return FilterChip(
//                   label: Text(title.toString()),
//                   selected: selected,
//                   onSelected: (val) {
//                     setState(() {
//                       if (val) {
//                         _selectedCourseIds.add(id);
//                       } else {
//                         _selectedCourseIds.remove(id);
//                       }
//                     });
//                   },
//                 );
//               }).toList(),
//             ),
//           ],
//         );
//       },
//     );
//   }

//   Widget _buildTeacherMultiSelect() {
//     return StreamBuilder<QuerySnapshot>(
//       stream: FirebaseFirestore.instance
//           .collection('users')
//           .where('role', isEqualTo: 'teacher')
//           .orderBy('email')
//           .snapshots(),
//       builder: (context, snapshot) {
//         if (!snapshot.hasData) {
//           return const Padding(
//             padding: EdgeInsets.all(12),
//             child: Center(child: CircularProgressIndicator()),
//           );
//         }
//         final teachers = snapshot.data!.docs;
//         return Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             const Text('Select Teachers'),
//             const SizedBox(height: 8),
//             Wrap(
//               spacing: 8,
//               children: teachers.map((doc) {
//                 final id = doc.id;
//                 final email =
//                     (doc.data() as Map<String, dynamic>)['email'] ?? id;
//                 final selected = _selectedTeacherIds.contains(id);
//                 return FilterChip(
//                   label: Text(email.toString()),
//                   selected: selected,
//                   onSelected: (val) {
//                     setState(() {
//                       if (val) {
//                         _selectedTeacherIds.add(id);
//                       } else {
//                         _selectedTeacherIds.remove(id);
//                       }
//                     });
//                   },
//                 );
//               }).toList(),
//             ),
//           ],
//         );
//       },
//     );
//   }

//   Widget _buildParentMultiSelect() {
//     return StreamBuilder<QuerySnapshot>(
//       stream: FirebaseFirestore.instance
//           .collection('users')
//           .where('role', isEqualTo: 'parent')
//           .orderBy('email')
//           .snapshots(),
//       builder: (context, snapshot) {
//         if (!snapshot.hasData) {
//           return const Padding(
//             padding: EdgeInsets.all(12),
//             child: Center(child: CircularProgressIndicator()),
//           );
//         }
//         final parents = snapshot.data!.docs;
//         return Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             const Text('Select Parents'),
//             const SizedBox(height: 8),
//             Wrap(
//               spacing: 8,
//               children: parents.map((doc) {
//                 final id = doc.id;
//                 final email =
//                     (doc.data() as Map<String, dynamic>)['email'] ?? id;
//                 final selected = _selectedParentIds.contains(id);
//                 return FilterChip(
//                   label: Text(email.toString()),
//                   selected: selected,
//                   onSelected: (val) {
//                     setState(() {
//                       if (val) {
//                         _selectedParentIds.add(id);
//                       } else {
//                         _selectedParentIds.remove(id);
//                       }
//                     });
//                   },
//                 );
//               }).toList(),
//             ),
//           ],
//         );
//       },
//     );
//   }

//   @override
//   void dispose() {
//     _emailController.dispose();
//     super.dispose();
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(title: const Text('➕ Add User')),
//       body: SingleChildScrollView(
//         padding: const EdgeInsets.all(16),
//         child: Form(
//           key: _formKey,
//           child: Column(
//             crossAxisAlignment: CrossAxisAlignment.start,
//             children: [
//               TextFormField(
//                 controller: _emailController,
//                 decoration: const InputDecoration(labelText: 'User Email'),
//                 validator: (val) =>
//                     val == null || val.isEmpty ? 'Enter email' : null,
//               ),
//               const SizedBox(height: 16),
//               _buildRoleDropdown(),
//               const SizedBox(height: 16),
//               if (_role == 'student') ...[
//                 _buildCourseMultiSelect(),
//                 const SizedBox(height: 16),
//                 _buildTeacherMultiSelect(),
//                 const SizedBox(height: 16),
//                 _buildParentMultiSelect(),
//               ],
//               const SizedBox(height: 24),
//               Center(
//                 child: ElevatedButton.icon(
//                   onPressed: _loading ? null : _addUser,
//                   icon: _loading
//                       ? const SizedBox(
//                           width: 18,
//                           height: 18,
//                           child: CircularProgressIndicator(
//                             color: Colors.white,
//                             strokeWidth: 2.2,
//                           ),
//                         )
//                       : const Icon(Icons.add),
//                   label: Text(_loading ? 'Adding...' : 'Add User'),
//                 ),
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }
