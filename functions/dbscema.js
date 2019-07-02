import { user } from "firebase-functions/lib/providers/auth";

let db = {
  screams: [
    {
      userHandle: "user",
      body: "this is s ascream",
      createAt: "2019-07-02T09:50:54.037Z",
      likeCount: 5,
      commentCount: 2
    }
  ]
};
