// Reads/writes the user profile in Firestore: users/{uid}
// The password is NEVER stored here - Firebase Authentication handles it.
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { cleanPhone } from "../utils/validators";

export async function createUserProfile(uid, { name, email, phone, category }) {
  await setDoc(doc(db, "users", uid), {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: "+91" + cleanPhone(phone),
    category,
    createdAt: serverTimestamp(),
  });
}
