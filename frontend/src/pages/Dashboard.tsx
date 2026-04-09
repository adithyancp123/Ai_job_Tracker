import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AddApplicationModal from "../components/AddApplicationModal";
import ApplicationDetailsModal from "../components/ApplicationDetailsModal";
import Toast from "../components/Toast";
import KanbanBoard from "../components/kanban/KanbanBoard";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import applicationsService from "../services/applications.service";
import { getErrorMessage } from "../services/error";
import { KANBAN_COLUMNS } from "../types/application.types";
import type { ApplicationStatus, JobApplication } from "../types/application.types";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | ApplicationStatus>("All");

  const loadApplications = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await applicationsService.getApplications();
      setApplications(data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to load applications."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadApplications();
  }, []);

  const handleStatusChange = async (id: string, nextStatus: ApplicationStatus) => {
    const previous = applications;
    setApplications((current) =>
      current.map((item) => (item._id === id ? { ...item, status: nextStatus } : item))
    );

    try {
      const updated = await applicationsService.updateApplicationStatus(id, nextStatus);
      setApplications((current) =>
        current.map((item) => (item._id === updated._id ? updated : item))
      );
    } catch (error) {
      setApplications(previous);
      setErrorMessage(getErrorMessage(error, "Failed to update status. Please try again."));
    }
  };

  const hasApplications = useMemo(() => applications.length > 0, [applications]);
  const filteredApplications = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesStatus = statusFilter === "All" ? true : application.status === statusFilter;
      if (!matchesStatus) return false;

      if (!query) return true;

      const company = (application.company || "").toLowerCase();
      const role = (application.role || "").toLowerCase();
      return company.includes(query) || role.includes(query);
    });
  }, [applications, searchText, statusFilter]);
  const stats = useMemo(() => {
    const total = applications.length;
    const interviews = applications.filter((item) => item.status === "Interview").length;
    const offers = applications.filter((item) => item.status === "Offer").length;
    const rejected = applications.filter((item) => item.status === "Rejected").length;

    return { total, interviews, offers, rejected };
  }, [applications]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 2200);
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 transition-colors duration-300 dark:bg-slate-900 sm:p-6">
      <section className="mx-auto max-w-7xl rounded-xl bg-white p-4 shadow-md transition-colors duration-300 dark:bg-slate-800 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-700"
              onClick={toggleTheme}
              type="button"
              aria-label="Toggle dark mode"
              title="Toggle theme"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-blue-700"
              onClick={() => setIsModalOpen(true)}
              type="button"
            >
              Add Application
            </button>
            <button
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Drag cards between columns to update application status.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition-colors duration-300 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
            placeholder="Search by company or role..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition-colors duration-300 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 sm:w-56"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "All" | ApplicationStatus)}
          >
            <option value="All">All statuses</option>
            {KANBAN_COLUMNS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Total Applications
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 transition-colors duration-300 dark:border-blue-900/60 dark:bg-blue-950/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-200">Interviews</p>
            <p className="mt-2 text-2xl font-bold text-blue-800 dark:text-blue-100">{stats.interviews}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 transition-colors duration-300 dark:border-emerald-900/60 dark:bg-emerald-950/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">Offers</p>
            <p className="mt-2 text-2xl font-bold text-emerald-800 dark:text-emerald-100">{stats.offers}</p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 transition-colors duration-300 dark:border-rose-900/60 dark:bg-rose-950/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-200">Rejected</p>
            <p className="mt-2 text-2xl font-bold text-rose-800 dark:text-rose-100">{stats.rejected}</p>
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2">
            <p className="text-sm text-red-700">{errorMessage}</p>
            <button
              className="text-xs font-medium text-red-700 underline"
              onClick={() => void loadApplications()}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ) : hasApplications ? (
          <div className="mt-6">
            <KanbanBoard
              applications={filteredApplications}
              onStatusChange={handleStatusChange}
              onCardClick={(application) => setSelectedApplication(application)}
            />
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition-colors duration-300 dark:border-slate-600 dark:bg-slate-900">
            <p className="text-slate-600 dark:text-slate-300">No applications yet.</p>
            <button
              className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-blue-700"
              onClick={() => setIsModalOpen(true)}
              type="button"
            >
              Add your first application
            </button>
          </div>
        )}
      </section>

      <AddApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onToast={showToast}
        onCreated={(application) => {
          setApplications((current) => [application, ...current]);
          setIsModalOpen(false);
        }}
      />

      <ApplicationDetailsModal
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onUpdated={(updated) => {
          setApplications((current) =>
            current.map((item) => (item._id === updated._id ? updated : item))
          );
          showToast("Application updated successfully");
        }}
        onDeleted={(applicationId) => {
          setApplications((current) => current.filter((item) => item._id !== applicationId));
          showToast("Application deleted successfully");
        }}
      />

      <Toast message={toastMessage} />
    </main>
  );
};

export default Dashboard;
