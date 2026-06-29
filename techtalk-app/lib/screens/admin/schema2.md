1. users collection
----------
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",  // or "teacher"
  "courseIds": ["course1", "course2"],
  "progress": {
    "totalXp": 150,
    "level": 2,
    "badges": ["🏅 Topic1 Master"],
    "completedTopics": ["topic1", "topic2"],
    "completedCourses": ["course1"],
    "certificates": [
      {
        "courseId": "course1",
        "issuedAt": "2025-10-29T00:00:00Z",
        "title": "Course1 Completion Certificate"
      }
    ],
    "lastUpdated": "2025-10-29T00:00:00Z"
  }
}
------------
2. topics collection
-------------
{
  "title": "Introduction to Python",
  "courseId": "course1",
  "order": 1
}
--------------
3. quizzes collection
--------------
{
  "title": "Python Basics Quiz",
  "topicId": "topic1",
  "courseId": "course1",
  "reused": false,
  "createdAt": "2025-10-29T00:00:00Z",
  "questions": [
    {
      "q": "What is a variable?",
      "options": ["A function", "A container", "A loop", "None of these"],
      "correctIndex": 1
    },
    {
      "q": "Which symbol is used for comments in Python?",
      "options": ["//", "#", "/*", "<!--"],
      "correctIndex": 1
    }
  ]
}
---------------
4. quizzes/{quizId}/submissions subcollection per topic(REMOVED)
--------------------------------------------------------
{
  "studentId": "user123",
  "answers": [1, 1],       // array of selected option indexes
  "results": { "0": true, "1": true }, // key = question index, value = correct?
  "score": 2,
  "total": 2,
  "submittedAt": "2025-10-29T01:00:00Z"
}
