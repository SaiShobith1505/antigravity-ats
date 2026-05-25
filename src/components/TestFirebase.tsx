"use client";

import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TestFirebase() {

  const testFirebase = async () => {
    try {

      await addDoc(collection(db, "test"), {
        message: "Firebase Connected Successfully",
        createdAt: new Date(),
      });

      alert("Success!");

    } catch (error) {

      console.error(error);
      alert("Firebase Error");

    }
  };

  return (
    <div className="p-10">
      <button
        onClick={testFirebase}
        className="bg-blue-500 text-white px-5 py-3 rounded-xl"
      >
        Test Firebase
      </button>
    </div>
  );
}