type Status = "success" | "pending" | "failed";

type ActivityRow = {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  status: Status;
};

const PLACEHOLDER_ROWS: ActivityRow[] = [
  {
    id: "1",
    user: "Alice Johnson",
    action: "Created",
    target: "Project Alpha",
    timestamp: "2 min ago",
    status: "success",
  },
  {
    id: "2",
    user: "Bob Smith",
    action: "Updated",
    target: "User Profile",
    timestamp: "15 min ago",
    status: "success",
  },
  {
    id: "3",
    user: "Carol White",
    action: "Deleted",
    target: "Old Report",
    timestamp: "1 hr ago",
    status: "success",
  },
  {
    id: "4",
    user: "Dan Brown",
    action: "Exported",
    target: "Sales Data",
    timestamp: "3 hr ago",
    status: "pending",
  },
  {
    id: "5",
    user: "Eve Davis",
    action: "Imported",
    target: "Customer List",
    timestamp: "5 hr ago",
    status: "failed",
  },
  {
    id: "6",
    user: "Frank Lee",
    action: "Shared",
    target: "Dashboard View",
    timestamp: "8 hr ago",
    status: "success",
  },
];

const statusClasses: Record<Status, string> = {
  success: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-600",
};

export default function ActivityTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-700">Recent Activity</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Target</th>
              <th className="px-5 py-3">Time</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {PLACEHOLDER_ROWS.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
              >
                <td className="px-5 py-3 font-medium text-slate-800">
                  {row.user}
                </td>
                <td className="px-5 py-3 text-slate-600">{row.action}</td>
                <td className="px-5 py-3 text-slate-600">{row.target}</td>
                <td className="px-5 py-3 text-slate-500">{row.timestamp}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[row.status]}`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
