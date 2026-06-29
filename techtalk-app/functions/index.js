const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

const ALLOWED_ROLES = new Set(["admin", "teacher", "parent", "student", "guest"]);

exports.createUser = onCall(async (request) => {
  const context = request.auth;
  const data = request.data;

  if (!context) throw new HttpsError("unauthenticated", "You must be signed in.");

  const callerUid = context.uid;
  const callerDoc = await admin.firestore().collection("users").doc(callerUid).get();
  if (!callerDoc.exists) throw new HttpsError("permission-denied", "Caller profile not found.");
  if (callerDoc.data().role !== "admin") throw new HttpsError("permission-denied", "Only admins can create users.");

  const email = (data.email || "").toString().trim().toLowerCase();
  let role = (data.requestedRole || "student").toString().toLowerCase();
  if (!ALLOWED_ROLES.has(role)) role = "guest";
  if (!email) throw new HttpsError("invalid-argument", "Email is required.");

  try {
    // 🪄 Get or create Auth user
    let userRecord;
    let created = false;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch {
      const randomPassword = Math.random().toString(36).slice(-12);
      userRecord = await admin.auth().createUser({
        email,
        password: randomPassword,
        displayName: data.name || email.split("@")[0],
        disabled: false,
      });
      created = true;
    }

    const uid = userRecord.uid;
    const userRef = admin.firestore().collection("users").doc(uid);

    const baseDoc = {
      uid,
      email,
      name: data.name || userRecord.displayName || email.split("@")[0],
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // 🧠 STUDENT: multiple courses, teachers, and parents
    if (role === "student") {
      if (
        !Array.isArray(data.courseIds) ||
        !Array.isArray(data.teacherIds) ||
        !Array.isArray(data.parentIds) ||
        data.courseIds.length === 0 ||
        data.teacherIds.length === 0 ||
        data.parentIds.length === 0
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Student requires courseIds, teacherIds, and parentIds (arrays)."
        );
      }

      Object.assign(baseDoc, {
        courseIds: data.courseIds,
        teacherIds: data.teacherIds,
        parentIds: data.parentIds,
        xp: data.xp || 0,
        level: data.level || 1,
        badges: data.badges || [],
      });

      // 🔁 Update parents’ childrenIds
      for (const pid of data.parentIds) {
        const parentRef = admin.firestore().collection("users").doc(pid);
        await parentRef.set(
          {
            childrenIds: admin.firestore.FieldValue.arrayUnion(uid),
          },
          { merge: true }
        );
      }

      // 🔁 Update each teacher’s courses and studentsIds
      for (const tid of data.teacherIds) {
        const teacherRef = admin.firestore().collection("users").doc(tid);
        await teacherRef.set(
          {
            courses: admin.firestore.FieldValue.arrayUnion(...data.courseIds),
            studentsIds: admin.firestore.FieldValue.arrayUnion(uid),
          },
          { merge: true }
        );
      }
    }

    // 🧩 PARENT
    if (role === "parent") {
      baseDoc.childrenIds = data.childrenIds ?? [];
    }

    // 🧩 TEACHER
    if (role === "teacher") {
      baseDoc.courses = data.courses ?? [];
      baseDoc.studentsIds = data.studentsIds ?? [];
    }

    await userRef.set(baseDoc, { merge: true });

    // 🔐 Set custom claims
    await admin.auth().setCustomUserClaims(uid, { role });

    return { uid, created, role, message: `User ${email} created as ${role}` };
  } catch (error) {
    console.error("createUser error:", error);
    throw new HttpsError("internal", error.message || "Error creating user");
  }
});
// const { onCall, HttpsError } = require("firebase-functions/v2/https");
// const admin = require("firebase-admin");

// admin.initializeApp();

// const ALLOWED_ROLES = new Set(["admin", "teacher", "parent", "student", "guest"]);

// exports.createUser = onCall(async (request) => {
//   const context = request.auth;
//   const data = request.data;

//   if (!context) throw new HttpsError("unauthenticated", "You must be signed in.");

//   const callerUid = context.uid;
//   const callerDoc = await admin.firestore().collection("users").doc(callerUid).get();
//   if (!callerDoc.exists) throw new HttpsError("permission-denied", "Caller profile not found.");
//   if (callerDoc.data().role !== "admin") throw new HttpsError("permission-denied", "Only admins can create users.");

//   const email = (data.email || "").toString().trim().toLowerCase();
//   let role = (data.requestedRole || "student").toString().toLowerCase();
//   if (!ALLOWED_ROLES.has(role)) role = "guest";
//   if (!email) throw new HttpsError("invalid-argument", "Email is required.");

//   try {
//     // 🪄 Get or create Auth user
//     let userRecord;
//     let created = false;
//     try {
//       userRecord = await admin.auth().getUserByEmail(email);
//     } catch {
//       const randomPassword = Math.random().toString(36).slice(-12);
//       userRecord = await admin.auth().createUser({
//         email,
//         password: randomPassword,
//         displayName: data.name || email.split("@")[0],
//         disabled: false,
//       });
//       created = true;
//     }

//     const uid = userRecord.uid;
//     const userRef = admin.firestore().collection("users").doc(uid);

//     const baseDoc = {
//       uid,
//       email,
//       name: data.name || userRecord.displayName || email.split("@")[0],
//       role,
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//       updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//     };

//     if (role === "student") {
//       if (!data.courseId || !data.teacherId || !Array.isArray(data.parentIds) || data.parentIds.length === 0) {
//         throw new HttpsError("invalid-argument", "Student requires courseId, teacherId, and parentIds.");
//       }

//       Object.assign(baseDoc, {
//         courseId: data.courseId,
//         teacherId: data.teacherId,
//         parentIds: data.parentIds,
//         xp: data.xp || 0,
//         level: data.level || 1,
//         badges: data.badges || [],
//       });

//       // Update parents' childrenIds
//       for (const pid of data.parentIds) {
//         const parentRef = admin.firestore().collection("users").doc(pid);
//         await parentRef.set({
//           childrenIds: admin.firestore.FieldValue.arrayUnion(uid)
//         }, { merge: true });
//       }

//       // Update teacher's courses and studentsIds
//       const teacherRef = admin.firestore().collection("users").doc(data.teacherId);
//       await teacherRef.set({
//         courses: admin.firestore.FieldValue.arrayUnion(data.courseId),
//         studentsIds: admin.firestore.FieldValue.arrayUnion(uid)
//       }, { merge: true });
//     }

//     if (role === "parent") {
//       baseDoc.childrenIds = data.childrenIds ?? [];
//     }

//     if (role === "teacher") {
//       baseDoc.courses = data.courses ?? [];
//       baseDoc.studentsIds = data.studentsIds ?? [];
//     }

//     await userRef.set(baseDoc, { merge: true });

//     // Set custom claims
//     await admin.auth().setCustomUserClaims(uid, { role });

//     return { uid, created, role, message: `User ${email} created as ${role}` };
//   } catch (error) {
//     console.error("createUser error:", error);
//     throw new HttpsError("internal", error.message || "Error creating user");
//   }
// });

// // const { onCall, HttpsError } = require("firebase-functions/v2/https");
// // const { onDocumentCreated } = require("firebase-functions/v2/firestore");
// // const admin = require("firebase-admin");

// // admin.initializeApp();

// // // ✅ Allowed roles
// // const ALLOWED_ROLES = new Set(["admin", "teacher", "parent", "student", "guest"]);

// // // 🧩 Callable: createUser
// // exports.createUser = onCall(async (request) => {
// //   const context = request.auth;
// //   const data = request.data;

// //   // 🔐 Only signed-in admins
// //   if (!context) throw new HttpsError("unauthenticated", "You must be signed in.");

// //   const callerUid = context.uid;
// //   const callerDoc = await admin.firestore().collection("users").doc(callerUid).get();
// //   if (!callerDoc.exists) throw new HttpsError("permission-denied", "Caller profile not found.");
// //   if (callerDoc.data().role !== "admin") throw new HttpsError("permission-denied", "Only admins can create users.");

// //   const email = (data.email || "").toString().trim().toLowerCase();
// //   let role = (data.requestedRole || "student").toString().toLowerCase();
// //   if (!ALLOWED_ROLES.has(role)) role = "guest";
// //   if (!email) throw new HttpsError("invalid-argument", "Email is required.");

// //   try {
// //     // 🪄 Get or create Auth user
// //     let userRecord;
// //     let created = false;
// //     try {
// //       userRecord = await admin.auth().getUserByEmail(email);
// //     } catch {
// //       const randomPassword = Math.random().toString(36).slice(-12);
// //       userRecord = await admin.auth().createUser({
// //         email,
// //         password: randomPassword,
// //         displayName: data.name || email.split("@")[0],
// //         disabled: false,
// //       });
// //       created = true;
// //     }

// //     const uid = userRecord.uid;
// //     const userRef = admin.firestore().collection("users").doc(uid);

// //     // 🗂 Base user document
// //     const baseDoc = {
// //       uid,
// //       email,
// //       name: data.name || userRecord.displayName || email.split("@")[0],
// //       role,
// //       createdAt: admin.firestore.FieldValue.serverTimestamp(),
// //       updatedAt: admin.firestore.FieldValue.serverTimestamp(),
// //     };

// //     // 🧠 Role-specific fields
// //     if (role === "student") {
// //       if (!data.courseId || !data.teacherId || !Array.isArray(data.parentIds) || data.parentIds.length === 0) {
// //         throw new HttpsError("invalid-argument", "Student requires courseId, teacherId, and parentIds.");
// //       }

// //       Object.assign(baseDoc, {
// //         courseId: data.courseId,
// //         teacherId: data.teacherId,
// //         parentIds: data.parentIds,
// //         xp: data.xp || 0,
// //         level: data.level || 1,
// //         badges: data.badges || [],
// //       });

// //       // Update parents' childrenIds
// //       for (const pid of data.parentIds) {
// //         const parentRef = admin.firestore().collection("users").doc(pid);
// //         await parentRef.set({
// //           childrenIds: admin.firestore.FieldValue.arrayUnion(uid)
// //         }, { merge: true });
// //       }

// //       // Update teacher's courses array
// //       const teacherRef = admin.firestore().collection("users").doc(data.teacherId);
// //       await teacherRef.set({
// //         courses: admin.firestore.FieldValue.arrayUnion(data.courseId)
// //       }, { merge: true });
// //     }

// //     if (role === "parent") {
// //       baseDoc.childrenIds = data.childrenIds ?? [];
// //     }

// //     if (role === "teacher") {
// //       baseDoc.courses = data.courses ?? [];
// //     }

// //     // 💾 Save user document
// //     await userRef.set(baseDoc, { merge: true });

// //     // 🔐 Set custom claims
// //     await admin.auth().setCustomUserClaims(uid, { role });

// //     return { uid, created, role, message: `User ${email} created as ${role}` };
// //   } catch (error) {
// //     console.error("createUser error:", error);
// //     throw new HttpsError("internal", error.message || "Error creating user");
// //   }
// // });

// // // 🔔 Firestore Trigger: Notify parent on assignment creation
// // exports.notifyParentOnAssignment = onDocumentCreated("assignments/{assignmentId}", async (event) => {
// //   const data = event.data.data();
// //   const parentUid = data.parentUid;
// //   const childName = data.childName ?? "your child";
// //   const subject = data.subject ?? "a subject";

// //   if (!parentUid) return null;

// //   try {
// //     await admin.firestore().collection("notifications").add({
// //       uid: parentUid,
// //       title: "New Assignment Posted 📝",
// //       body: `${childName} has a new assignment in ${subject}.`,
// //       type: "assignment",
// //       read: false,
// //       createdAt: admin.firestore.FieldValue.serverTimestamp(),
// //     });
// //     console.log("Notification sent to parent:", parentUid);
// //   } catch (error) {
// //     console.error("Error sending parent notification:", error);
// //   }

// //   return null;
// // });

// // // // functions/index.js
// // // // Callable function: createUser
// // // // - Only callable by authenticated users whose Firestore profile has roles containing 'admin'.
// // // // - If an Auth user already exists with that email, returns existing uid and merges the requestedRole into:
// // // //    1) the user's custom claims (so tokens include roles), and
// // // //    2) the users/{uid} Firestore doc (roles array).
// // // // - If not found, creates Auth user, sets custom claims (merging with any existing), and creates users/{uid}.
// // // // - Returns { uid, created: boolean, mergedRoles: [...] }

// // // const functions = require('firebase-functions');
// // // const admin = require('firebase-admin');

// // // admin.initializeApp();

// // // exports.createUser = functions.https.onCall(async (data, context) => {
// // //   if (!context.auth) {
// // //     throw new functions.https.HttpsError('unauthenticated', 'You must be authenticated to call this function.');
// // //   }

// // //   const callerUid = context.auth.uid;
// // //   const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
// // //   if (!callerDoc.exists) {
// // //     throw new functions.https.HttpsError('permission-denied', 'Caller does not have a profile.');
// // //   }
// // //   const callerData = callerDoc.data() || {};
// // //   const callerRoles = Array.isArray(callerData.roles) ? callerData.roles : [];
// // //   if (!callerRoles.includes('admin')) {
// // //     throw new functions.https.HttpsError('permission-denied', 'Only admins can create or modify users.');
// // //   }

// // //   const email = (data.email || '').toString().trim().toLowerCase();
// // //   const password = (data.password || '').toString();
// // //   const requestedRole = (data.requestedRole || 'student').toString();

// // //   if (!email || !password) {
// // //     throw new functions.https.HttpsError('invalid-argument', 'Email and password are required.');
// // //   }

// // //   try {
// // //     let userRecord;
// // //     let created = false;

// // //     try {
// // //       userRecord = await admin.auth().getUserByEmail(email);
// // //     } catch {
// // //       userRecord = await admin.auth().createUser({
// // //         email,
// // //         password,
// // //         displayName: email.split('@')[0],
// // //       });
// // //       created = true;
// // //     }

// // //     const uid = userRecord.uid;

// // //     // Merge roles into Firestore users/{uid}
// // //     const userRef = admin.firestore().collection('users').doc(uid);
// // //     await userRef.set({
// // //       email,
// // //       username: uid,
// // //       roles: admin.firestore.FieldValue.arrayUnion(requestedRole),
// // //       createdAt: admin.firestore.FieldValue.serverTimestamp(),
// // //       updatedAt: admin.firestore.FieldValue.serverTimestamp(),
// // //     }, { merge: true });

// // //     // Merge into custom claims
// // //     const existingClaims = userRecord.customClaims || {};
// // //     const existingRolesMap = existingClaims.roles && typeof existingClaims.roles === 'object'
// // //       ? existingClaims.roles
// // //       : {};

// // //     existingRolesMap[requestedRole] = true;

// // //     const latestUserDoc = await userRef.get();
// // //     const fsRoles = (latestUserDoc.exists && latestUserDoc.data().roles) ? latestUserDoc.data().roles : [];
// // //     if (Array.isArray(fsRoles)) {
// // //       fsRoles.forEach(r => { existingRolesMap[r] = true; });
// // //     }

// // //     await admin.auth().setCustomUserClaims(uid, { ...existingClaims, roles: existingRolesMap });

// // //     // 🔁 Short delay to allow propagation before client reads new token
// // //     await new Promise(res => setTimeout(res, 2000));

// // //     const mergedRoles = Object.keys(existingRolesMap);
// // //     return { uid, created, mergedRoles };
// // //   } catch (error) {
// // //     console.error('createUser error:', error);
// // //     throw new functions.https.HttpsError('unknown', error.message || 'Error creating user');
// // //   }
// // // });
// // // // 🔔 Notify parent when a new assignment is created
// // // exports.notifyParentOnAssignment = functions.firestore
// // //   .document("assignments/{assignmentId}")
// // //   .onCreate(async (snap, context) => {
// // //     const data = snap.data();
// // //     const parentUid = data.parentUid;
// // //     const childName = data.childName ?? "your child";
// // //     const subject = data.subject ?? "a subject";

// // //     if (!parentUid) return null;

// // //     try {
// // //       await admin.firestore().collection("notifications").add({
// // //         uid: parentUid,
// // //         title: "New Assignment Posted 📝",
// // //         body: `${childName} has a new assignment in ${subject}.`,
// // //         type: "assignment",
// // //         read: false,
// // //         createdAt: admin.firestore.FieldValue.serverTimestamp(),
// // //       });
// // //       console.log("Notification sent to parent:", parentUid);
// // //     } catch (error) {
// // //       console.error("Error sending parent notification:", error);
// // //     }

// // //     return null;
// // //   });

