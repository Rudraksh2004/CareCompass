"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getEmergencyProfile,
  saveEmergencyProfile,
} from "@/services/emergencyService";
import QRCode from "react-qr-code";

export default function EmergencyPage() {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergies, setAllergies] = useState("");
  const [conditions, setConditions] = useState("");
  const [medications, setMedications] = useState("");
  const [contact, setContact] = useState("");

  const [saving, setSaving] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      const data = await getEmergencyProfile(user.uid);

      if (data) {
        setName(data.name || "");
        setBloodGroup(data.bloodGroup || "");
        setAllergies(data.allergies || "");
        setConditions(data.conditions || "");
        setMedications(data.medications || "");
        setContact(data.contact || "");
      }
    };

    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    await saveEmergencyProfile(user.uid, {
      name,
      bloodGroup,
      allergies,
      conditions,
      medications,
      contact,
    });

    alert("Emergency profile saved.");
    setSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-bold">🚑 Emergency Health Card</h1>
        <p className="text-red-100 text-sm mt-1">
          Store critical medical information for emergencies.
        </p>
      </div>

      {/* Emergency Form */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
        <h2 className="text-lg font-semibold mb-6">Emergency Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Full Name" value={name} setValue={setName} />

          <div>
            <label className="text-sm text-gray-500 mb-2 block">
              Blood Group
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full border dark:border-gray-600 p-3 rounded-xl bg-gray-50 dark:bg-gray-700"
            >
              <option value="">Select Blood Group</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
          </div>

          <Input label="Allergies" value={allergies} setValue={setAllergies} />

          <Input
            label="Medical Conditions"
            value={conditions}
            setValue={setConditions}
          />

          <Input
            label="Current Medications"
            value={medications}
            setValue={setMedications}
          />

          <Input
            label="Emergency Contact"
            value={contact}
            setValue={setContact}
          />
        </div>

        <div className="mt-8 flex items-center justify-end gap-4">
          {/* Generate QR Button */}
          <button
            onClick={() => setShowQR(true)}
            disabled={!name || !bloodGroup}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition disabled:opacity-50"
          >
            Generate QR Code
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Emergency Info"}
          </button>
        </div>
      </div>

      {/* Emergency Card Preview */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-2xl">
        <h2 className="text-xl font-semibold mb-4">Emergency Card Preview</h2>

        <div className="space-y-2 text-sm">
          <p>
            <b>Name:</b> {name || "-"}
          </p>
          <p>
            <b>Blood Group:</b> {bloodGroup || "-"}
          </p>
          <p>
            <b>Allergies:</b> {allergies || "-"}
          </p>
          <p>
            <b>Conditions:</b> {conditions || "-"}
          </p>
          <p>
            <b>Medications:</b> {medications || "-"}
          </p>
          <p>
            <b>Emergency Contact:</b> {contact || "-"}
          </p>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm text-center">
        <h2 className="text-xl font-semibold mb-4">Emergency QR Card</h2>

        <p className="text-sm text-gray-500 mb-6">
          Generate a QR code so doctors or emergency responders can access your
          emergency health information.
        </p>

        {!showQR && (
          <button
            onClick={() => setShowQR(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition"
          >
            Generate QR Code
          </button>
        )}

        {showQR && user && (
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-xl shadow">
              <QRCode
                value={`${window.location.origin}/emergency/${user.uid}`}
                size={180}
              />
            </div>

            <button
              onClick={() => setShowQR(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Hide QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({ label, value, setValue }: any) {
  return (
    <div>
      <label className="text-sm text-gray-500 mb-2 block">{label}</label>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border dark:border-gray-600 p-3 rounded-xl bg-gray-50 dark:bg-gray-700"
      />
    </div>
  );
}
