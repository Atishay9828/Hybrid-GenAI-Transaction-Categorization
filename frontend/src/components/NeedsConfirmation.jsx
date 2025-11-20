export default function NeedsConfirmation({ data }) {
  return (
    <div className="mt-4 p-4 border border-yellow-600 rounded-xl bg-yellow-900 text-yellow-200">
      <p className="font-bold mb-2">Needs your confirmation</p>
      <p>This prediction is uncertain. You can correct it manually.</p>
    </div>
  );
}