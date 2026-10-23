// Live tracking of one token + its queue (Firestore onSnapshot listeners).
//
// People ahead  = tokens in the SAME queue (same service + same day) that are
//                 still active (Waiting / Called / In Progress) and have a smaller sequence number.
// Estimated wait = people ahead x average minutes per person (avgMinutes in data.js).
import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { ACTIVE_STATUSES, getService } from "../data";
import { friendlyError } from "../utils/firebaseErrors";

export function useTokenTracking(tokenId, uid) {
  const [token, setToken] = useState(null);
  const [queueTokens, setQueueTokens] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "", offline: false });

  useEffect(() => {
    return onSnapshot(
      doc(db, "tokens", tokenId),
      (snap) => {
        if (!snap.exists() || snap.data().uid !== uid) {
          setToken(null);
          setStatus({ loading: false, error: "Token not found.", offline: false });
          return;
        }
        setToken({ id: snap.id, ...snap.data() });
        setStatus({ loading: false, error: "", offline: snap.metadata.fromCache });
      },
      (err) => setStatus({ loading: false, error: friendlyError(err), offline: false })
    );
  }, [tokenId, uid]);

  const queueId = token?.queueId;
  useEffect(() => {
    if (!queueId) return undefined;
    return onSnapshot(
      query(collection(db, "tokens"), where("queueId", "==", queueId)),
      (snap) => setQueueTokens(snap.docs.map((d) => d.data())),
      () => {}
    );
  }, [queueId]);

  const { peopleAhead, waitMinutes } = useMemo(() => {
    if (!token || token.status !== "Waiting") return { peopleAhead: 0, waitMinutes: 0 };
    const ahead = queueTokens.filter(
      (t) => ACTIVE_STATUSES.includes(t.status) && t.sequence < token.sequence
    ).length;
    const avg = getService(token.serviceId)?.avgMinutes ?? 10;
    return { peopleAhead: ahead, waitMinutes: ahead * avg };
  }, [token, queueTokens]);

  return { token, peopleAhead, waitMinutes, ...status };
}
