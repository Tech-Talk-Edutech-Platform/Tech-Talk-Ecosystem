import 'package:supabase_flutter/supabase_flutter.dart';

final supabase = Supabase.instance.client;

Future<void> updateTopicProgress({
  required String userId,
  required String courseId,
  required String topicId,
  required double completionPercent, // 0.0 - 1.0
}) async {
  const int topicXpReward = 20;
  const int xpPerLevel = 50;

  // 🔹 Fetch user XP + level
  final userRes = await supabase
      .from('user_xp')
      .select()
      .eq('user_id', userId)
      .maybeSingle();

  int currentXp = userRes?['total_xp'] ?? 0;
  int currentLevel = userRes?['level'] ?? 1;

  // 🔹 Fetch topic info
  final topicRes = await supabase
      .from('course_topics')
      .select('title')
      .eq('id', topicId)
      .maybeSingle();

  final topicTitle = topicRes?['title'] ?? 'Unnamed Topic';

  // 🔹 Calculate XP gain
  final int gainedXp = (topicXpReward * completionPercent).round();

  // 🔹 Check if already completed (prevent double XP)
  final progressRes = await supabase
      .from('user_activity_logs')
      .select()
      .eq('user_id', userId)
      .eq('activity_type', 'topic_progress')
      .eq('meta->>topic_id', topicId)
      .maybeSingle();

  final int alreadyGivenXp = progressRes != null
      ? (progressRes['meta']['earnedXp'] ?? 0)
      : 0;

  final int xpToAdd = (gainedXp - alreadyGivenXp).clamp(0, topicXpReward);

  if (xpToAdd == 0) return;

  final newXp = currentXp + xpToAdd;
  final newLevel = (newXp ~/ xpPerLevel) + 1;

  final bool isCompleted = completionPercent >= 1.0;

  final badgeName = "$topicTitle Master";

  // 🔹 Update XP table
  await supabase.from('user_xp').upsert({
    'user_id': userId,
    'total_xp': newXp,
    'level': newLevel,
    'updated_at': DateTime.now().toIso8601String(),
  });

  // 🔹 Insert badge if completed
  // if (isCompleted) {
  //   await supabase
  //       .from('user_badges')
  //       .insert({'user_id': userId, 'badge_name': badgeName})
  //       .onConflict('user_id, badge_name');
  // }
  final exists = await supabase
      .from('user_badges')
      .select()
      .eq('user_id', userId)
      .eq('badge_name', badgeName)
      .maybeSingle();

  if (exists == null) {
    await supabase.from('user_badges').insert({
      'user_id': userId,
      'badge_name': badgeName,
    });
  }

  // 🔹 Log progress (prevents duplicate XP)
  await supabase.from('user_activity_logs').insert({
    'user_id': userId,
    'activity_type': 'topic_progress',
    'meta': {
      'topic_id': topicId,
      'course_id': courseId,
      'earnedXp': gainedXp,
      'completion': completionPercent,
      'completed': isCompleted,
    },
  });
}
// import 'package:cloud_firestore/cloud_firestore.dart';

// Future<void> updateTopicProgress({
//   required String userId,
//   required String courseId,
//   required String topicId,
//   required double completionPercent, // 0.0 to 1.0
// }) async {
//   final FirebaseFirestore firestore = FirebaseFirestore.instance;

//   final userRef = firestore.collection("users").doc(userId);
//   final topicRef = firestore
//       .collection("courses")
//       .doc(courseId)
//       .collection("topics")
//       .doc(topicId);
//   final progressRef = topicRef.collection("progress").doc(userId);

//   await firestore.runTransaction((transaction) async {
//     final userSnap = await transaction.get(userRef);
//     final progressSnap = await transaction.get(progressRef);
//     final topicSnap = await transaction.get(topicRef);

//     final userData = userSnap.data() ?? {};
//     final progressData = progressSnap.data() ?? {};

//     final int currentXp = userData["xp"] ?? 0;
//     final int xpPerLevel = 50;
//     final List badges = List<String>.from(userData["badges"] ?? []);

//     // Base XP reward for a topic
//     const int topicXpReward = 20;

//     // ✅ Calculate XP based on how much is completed
//     final int gainedXp = (topicXpReward * completionPercent).round();

//     // Prevent double counting XP
//     final int alreadyGivenXp = progressData["earnedXp"] ?? 0;
//     final int xpToAdd = (gainedXp - alreadyGivenXp).clamp(0, topicXpReward);

//     if (xpToAdd == 0) return; // No new progress

//     final newXp = currentXp + xpToAdd;
//     final newLevel = (newXp ~/ xpPerLevel) + 1;

//     // ✅ Award topic badge if completed
//     final bool isCompleted = completionPercent >= 1.0;
//     final topicTitle = topicSnap["title"] ?? "Unnamed Topic";
//     final String badgeName = "$topicTitle Master";

//     if (isCompleted && !badges.contains(badgeName)) {
//       badges.add(badgeName);
//     }

//     // ✅ Update topic progress
//     transaction.set(progressRef, {
//       "completed": isCompleted,
//       "earnedXp": gainedXp,
//       "totalXp": newXp,
//       "level": newLevel,
//       "badges": badges,
//       "lastUpdated": FieldValue.serverTimestamp(),
//     }, SetOptions(merge: true));

//     // ✅ Update user global stats
//     transaction.update(userRef, {
//       "xp": newXp,
//       "level": newLevel,
//       "badges": badges,
//     });
//   });
// }
