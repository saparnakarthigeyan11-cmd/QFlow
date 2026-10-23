// Staff-side queue logic. Firestore rules allow these writes ONLY for users
// listed in the "admins" collection, so calling them from a normal account fails.
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

// Which status can move to which (keeps the queue consistent).
const ALLOWED = {
  "In Progress": ["Called"],
  Completed: ["In Progress", "Called"],
  Skipped: ["Waiting", "Called"],
  Cancelled: ["Waiting", "Called", "Skipped"],
};
const TIME_FIELD = { "In Progress": "startedAt", Completed: "completedAt", Skipped: "skippedAt" };

export function subscribeTodayTokens(date, onData, onError) {
  return onSnapshot(
    query(collection(db, "tokens"), where("queueDate", "==", date)),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

export function subscribeCounters(onData, onError) {
  return onSnapshot(
    collection(db, "counters"),
    (snap) =>
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.order - b.order)),
    onError
  );
}

export async function addCounter(order) {
  await setDoc(doc(db, "counters", `counter-${order}`), {
    name: `Counter ${order}`,
    order,
    status: "Available", // Available | Busy | Closed
    currentTokenId: null,
    currentTokenNumber: null,
  });
}

export async function createDefaultCounters(count = 4) {
  const batch = writeBatch(db);
  for (let i = 1; i <= count; i += 1) {
    batch.set(doc(db, "counters", `counter-${i}`), {
      name: `Counter ${i}`,
      order: i,
      status: "Available",
      currentTokenId: null,
      currentTokenNumber: null,
    });
  }
  await batch.commit();
}

export async function setCounterOpen(counter, open) {
  if (counter.status === "Busy") throw new Error("Finish the current token before closing this counter.");
  await setDoc(doc(db, "counters", counter.id), { status: open ? "Available" : "Closed" }, { merge: true });
}

// Call a token to a counter. Uses a transaction so two staff members cannot
// call the same token, or use the same counter, at the same time.
export async function callToken(tokenId, counterId) {
  await runTransaction(db, async (tx) => {
    const tokenRef = doc(db, "tokens", tokenId);
    const counterRef = doc(db, "counters", counterId);
    const [tokenSnap, counterSnap] = await Promise.all([tx.get(tokenRef), tx.get(counterRef)]);

    if (!tokenSnap.exists() || !counterSnap.exists()) throw new Error("Token or counter not found.");
    const token = tokenSnap.data();
    const counter = counterSnap.data();
    if (!["Waiting", "Skipped"].includes(token.status)) {
      throw new Error(`Token ${token.number} is already ${token.status}.`);
    }
    if (counter.status !== "Available") throw new Error(`${counter.name} is not available.`);

    tx.update(tokenRef, {
      status: "Called",
      counterId,
      counterName: counter.name,
      calledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    tx.update(counterRef, { status: "Busy", currentTokenId: tokenId, currentTokenNumber: token.number });
  });
}

// Move a token to In Progress / Completed / Skipped / Cancelled and free its counter.
export async function changeTokenStatus(tokenId, newStatus) {
  await runTransaction(db, async (tx) => {
    const tokenRef = doc(db, "tokens", tokenId);
    const tokenSnap = await tx.get(tokenRef);
    if (!tokenSnap.exists()) throw new Error("Token not found.");
    const token = tokenSnap.data();

    if (!ALLOWED[newStatus]?.includes(token.status)) {
      throw new Error(`A ${token.status} token cannot be changed to ${newStatus}.`);
    }

    let counterRef = null;
    let counterSnap = null;
    if (token.counterId) {
      counterRef = doc(db, "counters", token.counterId);
      counterSnap = await tx.get(counterRef);
    }

    const update = { status: newStatus, updatedAt: serverTimestamp() };
    if (TIME_FIELD[newStatus]) update[TIME_FIELD[newStatus]] = serverTimestamp();
    const releasesCounter = ["Completed", "Skipped", "Cancelled"].includes(newStatus);
    if (releasesCounter && newStatus !== "Completed") {
      update.counterId = null;
      update.counterName = null;
    }
    tx.update(tokenRef, update);

    if (releasesCounter && counterSnap?.exists() && counterSnap.data().currentTokenId === tokenId) {
      tx.update(counterRef, { status: "Available", currentTokenId: null, currentTokenNumber: null });
    }
  });
}

// Staff-only: read the private request behind a token.
export async function getRequestForToken(tokenId) {
  const snap = await getDocs(query(collection(db, "serviceRequests"), where("tokenId", "==", tokenId)));
  return snap.empty ? null : snap.docs[0].data();
}
