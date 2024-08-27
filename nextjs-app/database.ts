/*
This file provides any interface to create, read, update, and delete things from the database.
*/

import { Firestore } from "@google-cloud/firestore";

// The GOOGLE_CLOUD_PROJECT environment variable is automatically set by Google Cloud
// for containers you run inside Cloud Run.
const googleCloudProjectId = process.env.GOOGLE_CLOUD_PROJECT;
let firestoreDb: Firestore;

function getFirestoreDatabase() {
  if (firestoreDb) {
    return firestoreDb;
  }
  firestoreDb = new Firestore({
    projectId: googleCloudProjectId,
  });
  return firestoreDb;
}

async function getAll(collectionName: string) {
  try {
    const firestoreDb = getFirestoreDatabase();
    const collectionRef = firestoreDb.collection(collectionName);
    const snapshot = await collectionRef.get();
    const documents = snapshot.docs.map(doc => doc.data());
    return documents;
  } catch (error) {
    if (error instanceof TypeError) {
      console.error(
        `\nAn error occured.`
        + `\nIf you're running this app on your local machine, this error likely means you need to run:`
        + `\n\tgcloud auth application-default login`
        + `\nto ensure gcloud is authenticated.`
        + `\nThe Firestore SDK uses the gcloud-authenticated user's credentials.`
        + `\nFor more info, see https://cloud.google.com/docs/authentication/client-libraries.`
        + `\n`
      );
    }
    console.error(`Failed to get all of collection, "${collectionName}".`);
    throw error;
  }
}

export { getAll };
