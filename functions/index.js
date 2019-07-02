const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const express = require("express");
const app = express();
const config = require("./config");
const firebase = require("firebase");
firebase.initializeApp(config);
const db = admin.firestore();
app.get("/screams", (req, res) => {
  db.collection("screams")
    .orderBy("createAt", "desc")
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandel: doc.data().userHandel,
          createAt: doc.data().createAt
        });
      });
      return res.json(screams);
    })
    .catch(err => {
      res.send(err);
    });
});
// exports.getScreams = functions.https.onRequest((req, res) => {

//   admin
//     .firestore()
//     .collection("screams")
//     .get()
//     .then(data => {
//       let screams = [];
//       data.docs.forEach(docs => {
//         screams.push(docs.data());
//       });
//       return res.json(screams);
//     })
//     .catch(err => {
//       res.send(err);
//     });
// });
///admin.firestore.Timestamp.fromDate(new Date())
app.post("/createScream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandel: req.body.userHandel,
    createAt: new Date().toISOString()
  };
  db.collection("screams")
    .add(newScream)
    .then(doc => {
      res.json({ message: `${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };
  var token,userId

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already exist" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
        userId=data.user.uid
      return data.user.getIdToken();
    })
    .then(idToken => {
        token=idToken
        const userCredentials={
            handle:newUser.handle,
            email:newUser.email,
            createAt:new Date().toISOString(),
            userId:userId
        }
       return db.doc(`/users/${newUser.handle}`).set(userCredentials)
    
    })
    .then(data=>{
        return res.status(201).json({token:token})
    })
    .catch(err => {
      if (err.code == "auth/email-already-in-use") {
        return res.status(400).json({ email: "email is in use" });
      } else {
        res.status(500).send(err);
      }
    });
});
exports.api = functions.region("europe-west2").https.onRequest(app);
