// Student-side queue logic (Firestore).
//
// Data model:
//   queues/{serviceId}_{date}          -> { serviceId, queueDate, lastNumber }   (token counter)
//   tokens/{serviceId}_{date}_{n}      -> public queue entry (NO personal details)
//   serviceRequests/{autoId}           -> private form data of the user
//
// Unique token numbers: we use a Firestore TRANSACTION. It reads the queue's
// lastNumber, adds 1, and writes the counter + token + request together.
// If two people submit at the same moment, Firestore retries one of them, so
// they can never receive the same number. Trade-off: all submissions for one
// service share one counter document, which is fine for a college (a few
// writes per second at most; Firestore handles about 1 write/second per
// document sustained, with retries absorbing short bursts).
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { ACTIVE_STATUSES } from "../data";
import { todayIST } from "../utils/dates";

export async function createServiceRequestWithToken({ user, service, details }) {
  const queueDate = todayIST();
  const queueId = `${service.id}_${queueDate}`;

  // Friendly duplicate check (one active token per service per day).
  // This is a convenience check, not a security rule.
  const mine = await getDocs(
    query(collection(db, "tokens"), where("uid", "==", user.uid), where("queueDate", "==", queueDate))
  );
  const duplicate = mine.docs
    .map((d) => d.data())
    .find((t) => t.serviceId === service.id && ACTIVE_STATUSES.includes(t.status));
  if (duplicate) {
    throw new Error(
      `You already have an active ${service.title} token today (${duplicate.number}). Track it from your dashboard.`
    );
  }

  const queueRef = doc(db, "queues", queueId);
  const requestRef = doc(collection(db, "serviceRequests"));
  let created = null;

  await runTransaction(db, async (tx) => {
    const queueSnap = await tx.get(queueRef);
    const sequence = (queueSnap.exists() ? queueSnap.data().lastNumber : 0) + 1;
    const tokenId = `${queueId}_${sequence}`;
    const number = `${service.prefix}-${String(sequence).padStart(3, "0")}`;

    if (queueSnap.exists()) {
      tx.update(queueRef, { lastNumber: sequence, updatedAt: serverTimestamp() });
    } else {
      tx.set(queueRef, {
        serviceId: service.id,
        queueDate,
        lastNumber: sequence,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    tx.set(doc(db, "tokens", tokenId), {
      uid: user.uid,
      serviceId: service.id,
      serviceTitle: service.title,
      queueId,
      queueDate,
      sequence,
      number,
      status: "Waiting",
      counterId: null,
      counterName: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    tx.set(requestRef, {
      uid: user.uid,
      serviceId: service.id,
      serviceTitle: service.title,
      details,
      tokenId,
      tokenNumber: number,
      queueId,
      status: "Submitted", // staff handle the real work; nothing is "verified" or "paid" here
      createdAt: serverTimestamp(),
    });

    created = { tokenId, number };
  });

  return created;
}

// Live list of the user's tokens for today.
export function subscribeMyTokens(uid, onData, onError) {
  const q = query(collection(db, "tokens"), where("uid", "==", uid), where("queueDate", "==", todayIST()));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => b.sequence - a.sequence)),
    onError
  );
}

// A user may cancel only their own token, and only while it is still Waiting
// (enforced again by the Firestore rules).
export function cancelOwnToken(tokenId) {
  return updateDoc(doc(db, "tokens", tokenId), { status: "Cancelled", updatedAt: serverTimestamp() });
}
