courses
-----------
{
  "id": "courseId",
  "title": "Intro to Python",
  "description": "Learn the basics of Python programming",
  "image": "https://example.com/image.png",
  "createdAt": "2025-10-25T10:00:00Z"
}

------
topics
------
{
  "id": "topicId",
  "courseId": "courseId",
  "title": "Variables and Data Types",
  "description": "Understanding basic data types",
  "order": 1,
  "createdAt": "2025-10-25T10:00:00Z"
}
------
PROGRESS
--------
topics{
  "id": "topicId",
  "courseId": "courseId",
  "title": "Variables and Data Types",
  "description": "Understanding basic data types",
  "order": 1,
  "createdAt": "2025-10-25T10:00:00Z"
 
------
notes
------
{
  "id": "noteId",
  "topicId": "topicId",
  "courseId": "courseId",
  "title": "Python Variables",
  "content": "Markdown or code text",
  "createdAt": "2025-10-25T10:00:00Z"
}
-----------
submissions under quizzes(REMOVED)
---------
{
  "studentId": "abc123",
  "answers": {
    "quizId_0": 1,
    "quizId_1": 2
  },
  "results": {
    "quizId_0": true,
    "quizId_1": false
  },
  "score": 1,
  "total": 2,
  "submittedAt": "2025-10-29T10:00:00Z"
}

------
quizzes
------
{
  "id": "quizId",
  "topicId": "topicId",
  "courseId": "courseId",
  "title": "Variables Quiz",
  "questions": [
    { "question": "What is a variable?", "options": ["...", "..."], "answer": 0 }
  ],
  "createdBy": "teacherUid",
    "reused": true, // or false
  "createdAt": "2025-10-25T10:00:00Z"
}
------
projects
------
{
  "id": "projectId",
  "topicId": "topicId",
  "courseId": "courseId",
  "title": "Build a Calculator",
  "instructions": "Create a basic calculator app",
  "resources": ["link1", "link2"],
  "createdBy": "teacherUid",
  "createdAt": "2025-10-25T10:00:00Z"
  reused: false/true
}
------
Submissions -> no rules or schemas yet
----------
projects/{projectId}/submissions/{studentId}
{
  githubUrl: "https://github.com/username/project",
  studentId: "abc123",
  submittedAt: <timestamp>
}
---------
USERS
--------------
users (collection)
│
├─ UID1 (student)
│   ├─ email: student1@example.com
│   ├─ role: student
│   ├─ courseIds: [course1, course2]
│   ├─ teacherIds: [teacher1, teacher2]
│   └─ parentIds: [parent1, parent2]
    └─ "progress":{
              completedTopics: []
              totalXp: number
             level: number
             badges: [ "Quiz Master", "Fast Learner" ]
             lastUpdated: timestamp}
             completedCourses:[] //the ones that all topics are covered
             certificates: [] //auto generated for each completed course 

│
├─ UID2 (teacher)
│   ├─ email: teacher1@example.com
│   ├─ role: teacher
│   ├─ studentsIds: [UID1, UID3]
│   └─ courses: [course1, course3]
│
├─ UID3 (parent)
│   ├─ email: parent1@example.com
│   ├─ role: parent
│   └─ childrenIds: [UID1, UID4]
------------
enrollments subcollection = schedule & package details.TO BE MADE
-----------
{
  "courseId": "course1",
  "package": "10-classes",
  "totalClasses": 10,
  "completedClasses": 3,
  "remainingClasses": 7,
  "schedule": [ "2025-11-30T10:00", "2025-12-02T10:00" ],
  "startDate": "2025-11-01",
  "endDate": "2025-12-15"
}
**************
-------------
OLD
----------------
Courses Schema
----------------
courses/{courseId}/
   ├─ title, description, image, etc.
   └─ topics/{topicId}/
        ├─ title, description, etc.
        ├─ notes/{noteId}/
        ├─ quizzes/{quizId}/
        └─ projects/{projectId}/
----------------
Student progress
----------------
courses/{courseId}/
   ├─ title, description, image, etc.
   └─ topics/{topicId}/
        ├─ title, description, etc.
        ├─ notes/{noteId}/
        ├─ quizzes/{quizId}/
        ├─ projects/{projectId}/
        
---------------------
User Schemas
------------------

│
courses (collection)
│
├─ course1
│   └─ title: "Python Basics"
├─ course2
│   └─ title: "Flutter Advanced"
└─ course3
    └─ title: "Data Structures"
----------
courses (collection)
  └── courseId (doc)
       ├── title: "Flutter Basics"
       ├── description: "..."
       ├── createdAt: <timestamp>
       └── topics (subcollection)
            └── topicId (doc)
                 ├── title: "Intro"
                 ├── description: "..."
