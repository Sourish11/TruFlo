import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export function joinEarlyAccess() {
  const notify = async (email) => {
    await addDoc(collection(db, "earlyAccessEmails"), {
      email,
      createdAt: serverTimestamp(),
    });
  };
  return { notify };
}