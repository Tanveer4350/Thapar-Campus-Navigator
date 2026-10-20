import { useMemo, useState } from "react";
import { facultyMembers } from "../../data/faculty";

export default function FacultyDirectory({ selectedFaculty, onClose }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredFaculty = useMemo(
    () =>
      facultyMembers.filter((member) =>
        [
          member.name,
          member.designation,
          member.email,
          member.office,
          member.floor,
        ].some((value) => value.toLowerCase().includes(normalizedQuery))
      ),
    [normalizedQuery]
  );

  return (
    <section
      aria-label="Faculty directory"
      className="absolute inset-0 z-20 overflow-y-auto bg-slate-50/95 p-4 sm:p-7"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Thapar University
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Faculty directory
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Search staff details, office numbers, and floor locations.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            Back to map
          </button>
        </div>

        {selectedFaculty && (
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg text-white">
              {selectedFaculty.name
                .split(" ")
                .filter((part) => !["Dr.", "Mr.", "Ms."].includes(part))
                .slice(0, 2)
                .map((part) => part[0])
                .join("")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{selectedFaculty.name}</p>
              <p className="text-sm text-slate-600">{selectedFaculty.designation}</p>
            </div>
            <a
              href={`mailto:${selectedFaculty.email}`}
              className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100"
            >
              Email faculty
            </a>
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex min-w-60 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm focus-within:border-blue-400">
            <span aria-hidden="true" className="text-slate-400">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by name, role, email, or office..."
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>
          <p className="text-sm font-medium text-slate-500">
            {filteredFaculty.length} of {facultyMembers.length} faculty
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Faculty member</th>
                  <th className="px-5 py-3 font-semibold">Designation</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Office</th>
                  <th className="px-5 py-3 font-semibold">Floor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFaculty.map((member) => (
                  <tr
                    key={member.id}
                    className={`transition hover:bg-blue-50/60 ${
                      selectedFaculty?.id === member.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-800">
                      {member.name}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {member.designation}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm">
                      <a
                        href={`mailto:${member.email}`}
                        className="text-blue-700 hover:underline"
                      >
                        {member.email}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {member.office}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {member.floor}
                    </td>
                  </tr>
                ))}
                {filteredFaculty.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-5 py-12 text-center">
                      <p className="font-semibold text-slate-700">No faculty found</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Try another name, designation, email, or office number.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
