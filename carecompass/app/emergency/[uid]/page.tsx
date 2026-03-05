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
      <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Emergency Info Not Found</h1>
          <p className="text-gray-400">No emergency profile available.</p>
        </div>
      </div>
    );
  }

  const data = snap.data();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-red-600 text-white rounded-3xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">🚑 Emergency Medical ID</h1>

          <p className="text-red-100 text-sm mt-1">
            CareCompass Emergency Card
          </p>
        </div>

        {/* Blood Group Badge */}
        <div className="flex justify-center mb-6">
          <div className="bg-white text-red-600 font-bold text-xl px-6 py-2 rounded-full shadow">
            {data.bloodGroup || "Unknown"}
          </div>
        </div>

        {/* Medical Info */}
        <div className="space-y-4 text-sm">
          <Info label="Name" value={data.name} />
          <Info label="Allergies" value={data.allergies} />
          <Info label="Medical Conditions" value={data.conditions} />
          <Info label="Medications" value={data.medications} />
          <Info label="Emergency Contact" value={data.contact} />
        </div>

        {/* Call Button */}
        {data.contact && (
          <div className="mt-8 text-center">
            <a
              href={`tel:${data.contact}`}
              className="inline-block bg-white text-red-600 font-semibold px-6 py-3 rounded-xl shadow hover:scale-105 transition"
            >
              📞 Call Emergency Contact
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: any) {
  return (
    <div className="bg-white/20 rounded-xl p-3">
      <p className="text-xs opacity-80">{label}</p>
      <p className="font-semibold">{value || "-"}</p>
    </div>
  );
}
