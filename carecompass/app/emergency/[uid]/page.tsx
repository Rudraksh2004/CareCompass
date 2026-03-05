import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface Props {
  params: {
    uid: string;
  };
}

export default async function EmergencyPublicPage({ params }: Props) {
  const ref = doc(db, "emergency_profiles", params.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Emergency Info Not Found</h1>
          <p className="text-gray-500">No emergency profile available.</p>
        </div>
      </div>
    );
  }

  const data = snap.data();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-red-600">
            🚑 Emergency Medical Info
          </h1>

          <p className="text-sm text-gray-500">CareCompass Emergency Card</p>
        </div>

        {/* Info */}
        <div className="space-y-3 text-sm text-gray-800">
          <p>
            <b>Name:</b> {data.name || "-"}
          </p>

          <p>
            <b>Blood Group:</b> {data.bloodGroup || "-"}
          </p>

          <p>
            <b>Allergies:</b> {data.allergies || "-"}
          </p>

          <p>
            <b>Medical Conditions:</b> {data.conditions || "-"}
          </p>

          <p>
            <b>Medications:</b> {data.medications || "-"}
          </p>

          <p>
            <b>Emergency Contact:</b> {data.contact || "-"}
          </p>
        </div>

        {/* Call Button */}
        {data.contact && (
          <div className="mt-6 text-center">
            <a
              href={`tel:${data.contact}`}
              className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium"
            >
              Call Emergency Contact
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
