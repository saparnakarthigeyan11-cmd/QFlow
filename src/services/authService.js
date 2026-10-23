// Firebase Authentication. Pages call these functions only.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  deleteUser,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { createUserProfile } from "./userService";

export async function registerUser({ name, email, phone, category, password }) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  try {
    await updateProfile(cred.user, { displayName: name.trim() });
    await createUserProfile(cred.user.uid, { name, email, phone, category });
  } catch (err) {
    // Do not leave an account without a profile - remove it so the user can retry.
    await deleteUser(cred.user).catch(() => {});
    throw err;
  }
  return cred.user;
}

export async function loginUser({ email, password }) {
  const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  return cred.user;
}

// Staff login: normal sign-in, then check the trusted "admins" collection.
export async function loginStaff({ email, password }) {
  const user = await loginUser({ email, password });
  const admin = await getDoc(doc(db, "admins", user.uid));
  if (!admin.exists()) {
    await signOut(auth);
    throw new Error("This account is not authorised for staff access.");
  }
  return user;
}

export function logoutUser() {
  return signOut(auth);
}
