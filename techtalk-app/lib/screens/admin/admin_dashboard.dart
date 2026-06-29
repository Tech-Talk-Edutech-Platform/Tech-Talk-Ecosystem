// lib/screens/admin_dashboard.dart
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:techtalk/screens/admin/add_course_topic.dart';
import 'package:techtalk/screens/admin/add_user.dart';
import 'package:techtalk/screens/admin/course_list.dart';
import 'package:techtalk/screens/admin/user_list.dart';
import 'package:techtalk/constants/app_theme.dart';
import 'package:techtalk/services/auth_service.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  int _selectedIndex = 0;
  final List<Widget> _screens = const [
    SizedBox(), // Home dashboard placeholder
    CourseListScreen(),
    UserListScreen(),
    AddCourseTopicScreen(),
    AddUserScreen(),
  ];
  final List<String> _titles = [
    "Dashboard",
    "Courses",
    "Users",
    "Add Course/Topic",
    "Add User",
  ];

  int totalCourses = 0;
  int totalStudents = 0;
  int totalTeachers = 0;
  int totalParents = 0;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  // Future<void> _loadStats() async {
  //   final coursesSnap = await FirebaseFirestore.instance
  //       .collection('courses')
  //       .get();
  //   final usersSnap = await FirebaseFirestore.instance
  //       .collection('users')
  //       .get();

  //   int students = 0, teachers = 0, parents = 0;

  //   for (var doc in usersSnap.docs) {
  //     final role = doc['role'] ?? '';
  //     if (role == 'student') students++;
  //     if (role == 'teacher') teachers++;
  //     if (role == 'parent') parents++;
  //   }

  //   setState(() {
  //     totalCourses = coursesSnap.docs.length;
  //     totalStudents = students;
  //     totalTeachers = teachers;
  //     totalParents = parents;
  //   });
  // }
  Future<void> _loadStats() async {
    final supabase = Supabase.instance.client;

    final courses = await supabase.from('courses').select('id');

    final users = await supabase.from('users').select('role');

    int students = 0, teachers = 0, parents = 0;

    for (final u in users) {
      final role = u['role'];
      if (role == 'student') students++;
      if (role == 'teacher') teachers++;
      if (role == 'parent') parents++;
    }

    setState(() {
      totalCourses = courses.length;
      totalStudents = students;
      totalTeachers = teachers;
      totalParents = parents;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_selectedIndex]),
        backgroundColor: AppTheme.primaryColor,
      ),
      drawer: Drawer(
        child: Column(
          children: [
            DrawerHeader(
              decoration: BoxDecoration(color: AppTheme.primaryColor),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    CircleAvatar(
                      radius: 30,
                      child: Icon(Icons.dashboard, size: 40),
                    ),
                    SizedBox(height: 12),
                    Text(
                      "TechTalk Admin",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            _buildDrawerItem(Icons.dashboard, "Dashboard", 0),
            _buildDrawerItem(Icons.book, "Courses", 1),
            _buildDrawerItem(Icons.people, "Users", 2),
            _buildDrawerItem(Icons.add_box, "Add Course/Topic", 3),
            _buildDrawerItem(Icons.person_add, "Add User", 4),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text("Logout", style: TextStyle(color: Colors.red)),
              onTap: () async {
                await AuthService().logout(context);
              },
            ),
          ],
        ),
      ),

      body: _selectedIndex == 0
          ? _buildHomeDashboard()
          : _screens[_selectedIndex],
    );
  }

  Widget _buildDrawerItem(IconData icon, String title, int index) {
    final selected = _selectedIndex == index;
    return ListTile(
      leading: Icon(
        icon,
        color: selected ? AppTheme.primaryColor : Colors.black54,
      ),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: selected ? FontWeight.bold : FontWeight.normal,
          color: selected ? AppTheme.primaryColor : Colors.black87,
        ),
      ),
      onTap: () {
        setState(() => _selectedIndex = index);
        Navigator.pop(context);
      },
    );
  }

  Widget _buildHomeDashboard() {
    final cardData = [
      {
        "title": "Courses",
        "count": totalCourses,
        "icon": Icons.book,
        "color": AppTheme.primaryColor,
      },
      {
        "title": "Students",
        "count": totalStudents,
        "icon": Icons.school,
        "color": AppTheme.secondaryColor,
      },
      {
        "title": "Teachers",
        "count": totalTeachers,
        "icon": Icons.person,
        "color": Colors.greenAccent,
      },
      {
        "title": "Parents",
        "count": totalParents,
        "icon": Icons.family_restroom,
        "color": Colors.purpleAccent,
      },
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        // Determine number of columns based on available width
        int crossAxisCount = constraints.maxWidth ~/ 200; // each card min 200px
        if (crossAxisCount < 1) crossAxisCount = 1;

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              // Stats cards
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: crossAxisCount,
                  childAspectRatio: 1.1,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: cardData.length,
                itemBuilder: (_, i) {
                  final item = cardData[i];
                  return _dashboardCard(
                    title: item['title'] as String,
                    count: item['count'] as int,
                    icon: item['icon'] as IconData,
                    color: item['color'] as Color,
                  );
                },
              ),
              const SizedBox(height: 24),
              // Quick access cards
              GridView.count(
                crossAxisCount: crossAxisCount,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _quickAccessCard(Icons.book, "Courses", 1),
                  _quickAccessCard(Icons.people, "Users", 2),
                  _quickAccessCard(Icons.add_box, "Add Course/Topic", 3),
                  _quickAccessCard(Icons.person_add, "Add User", 4),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _dashboardCard({
    required String title,
    required int count,
    required IconData icon,
    required Color color,
  }) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 36, color: color),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              count.toString(),
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _quickAccessCard(IconData icon, String title, int screenIndex) {
    return InkWell(
      onTap: () => setState(() => _selectedIndex = screenIndex),
      child: Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 3,
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 36, color: AppTheme.primaryColor),
              const SizedBox(height: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
