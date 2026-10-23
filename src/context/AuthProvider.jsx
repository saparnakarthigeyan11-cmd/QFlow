// Single source of truth for "who is logged in".
// Firebase restores the session after a page refresh; we then load the profile
// (users/{uid}) and check whether the user is staff (admins/{uid}).
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import { AuthContext } from "./authContext";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stopProfile = () => {};

    const stopAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      stopProfile();
      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setUser(firebaseUser);

      try {
        const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid));
        setIsAdmin(adminDoc.exists());
      } catch {
        setIsAdmin(false);
      }

      // Live listener: during registration the profile is saved a moment after
      // the account is created, and this picks it up automatically.
      stopProfile = onSnapshot(
        doc(db, "users", firebaseUser.uid),
        (snap) => {
          setProfile(snap.exists() ? snap.data() : null);
          setLoading(false);
        },
        () => {
          setProfile(null);
          setLoading(false);
        }
      );
    });

    return () => {
      stopAuth();
      stopProfile();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      isAdmin,
      loading,
      // Registered name only - never the email or phone number.
      displayName: profile?.name || user?.displayName || "Student",
    }),
    [user, profile, isAdmin, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
