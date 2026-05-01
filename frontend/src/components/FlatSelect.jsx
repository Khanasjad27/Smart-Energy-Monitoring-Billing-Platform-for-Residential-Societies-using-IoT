import useFlats from '../hooks/useFlats';

function FlatSelect({ currentFlatId, onChange }) {
  const { flats, selectedFlatId, selectFlat, loading, error } = useFlats();

  const activeFlatId = currentFlatId || selectedFlatId;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">Selected Flat</p>
          <p className="text-lg font-semibold text-slate-900">{activeFlatId ? `Flat ${activeFlatId}` : 'No flat selected'}</p>
        </div>
        <div className="w-full max-w-xs">
          <label className="block text-sm font-medium text-slate-700">Choose a flat</label>
          <select
            value={activeFlatId || ''}
            onChange={(event) => {
              const id = event.target.value;
              selectFlat(id);
              onChange?.(id);
            }}
            disabled={loading || Boolean(error)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Select flat</option>
            {flats.map((flat) => (
              <option key={flat.id} value={flat.id}>
                {flat.flatNumber} - Floor {flat.floor}
              </option>
            ))}
          </select>
          {loading && <p className="mt-2 text-sm text-slate-500">Loading flats…</p>}
          {!loading && !flats.length && !error && (
            <p className="mt-2 text-sm text-slate-500">No flats available for this account.</p>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default FlatSelect;
