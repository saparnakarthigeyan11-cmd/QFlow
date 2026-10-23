// Turns Firebase error codes into messages a normal user can understand.
const MESSAGES = {
  "auth/email-already-in-use": "This email is already registered. Please log in instead.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/weak-password": "Password is too weak. Use at least 8 characters with letters and numbers.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "Network problem. Check your internet connection.",
  "auth/user-disabled": "This account has been disabled. Contact the college office.",
  "permission-denied": "You do not have permission to do this.",
  unavailable: "Cannot reach the server. Check your internet connection and try again.",
  "failed-precondition": "The database is not ready yet. Ask the administrator to check Firestore setup.",
};

export function friendlyError(err) {
  const code = err?.code?.replace("firestore/", "");
  return MESSAGES[code] || err?.message || "Something went wrong. Please try again.";
}
