"use client";
import React, { useEffect, useState } from "react";
import {
  Plus,
  CalendarDays,
  Edit2,
  Trash2,
  Save,
  X,
  Clock,
  CheckCircle2,
  Circle,
  Calendar,
  RefreshCw,
} from "lucide-react";

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    time: "",
    endTime: "",
    date: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: "",
    description: "",
    time: "",
    endTime: "",
    date: "",
  });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const [token, setToken] = useState(null);
  const [userdetails, setUserDetails] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const API_BASE = "http://localhost:8000";

  // Read token once
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  // Fetch user details only when token exists
  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8000/userdetails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const result = await res.json();
        setUserDetails(result.userDetails || null);
      } catch (err) {
        console.error("User fetch failed", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [token]);

  // Fetch schedules when user details are available
  useEffect(() => {
    if (userdetails?.email) {
      getSchedule();
    }
  }, [userdetails]);

  // Convert backend data to frontend format
  const convertBackendToFrontend = (backendData) => {
    return backendData.map((item) => {
      const start = new Date(item.taskStartTime);
      const end = new Date(item.taskEndTime);

      return {
        id: item._id,
        title: item.title,
        description: item.description,
        endTime: end.toTimeString().slice(0, 5),
        endDate: end.toISOString().split("T")[0],
        createdAt: item.taskStartTime,
        status: item.triggered ? "complete" : "pending",
      };
    });
  };

  // Get schedules from backend
  const getSchedule = async () => {
    if (!userdetails?.email) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/getschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userdetails.email }),
      });

      const data = await res.json();

      if (data.error) return;

      setSchedules(convertBackendToFrontend(data.schedules));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Convert frontend data to backend format
  const convertFrontendToBackend = (data) => {
    const start = new Date(`${data.date}T${data.time}`);
    const end = new Date(`${data.date}T${data.endTime}`);

    return {
      email: userdetails.email,
      title: data.title,
      description: data.description,
      taskStartTime: start.toISOString(),
      taskEndTime: end.toISOString(),
    };
  };

  const handleAdd = async () => {
    if (!newSchedule.title || !userdetails?.email) return;

    try {
      await fetch(`${API_BASE}/addschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(convertFrontendToBackend(newSchedule)),
      });

      await getSchedule();
      setShowAddForm(false);
      setNewSchedule({
        title: "",
        description: "",
        date: "",
        time: "",
        endTime: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch("http://localhost:8000/deleteschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const result = await res.json();

      if (result.error) {
        console.error("Error deleting schedule:", result.error);
        return;
      }

      setSchedules(schedules.filter((s) => s.id !== id));
      if (editingId === id) setEditingId(null);
    } catch (err) {
      console.error("Failed to delete schedule", err);
    }
  };

  const toggleStatus = async (id) => {
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) return;

    try {
      await fetch(`${API_BASE}/updateschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          triggered: schedule.status !== "complete",
        }),
      });

      setSchedules((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: s.status === "complete" ? "pending" : "complete",
              }
            : s
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (schedule) => {
    setEditingId(schedule.id);
    setEditForm({
      title: schedule.title,
      description:
        schedule.description === "No description" ? "" : schedule.description,
      time: schedule.time === "No time set" ? "" : schedule.time,
      endTime: schedule.endTime === "No end time" ? "" : schedule.endTime,
      date: schedule.date === "No date set" ? "" : schedule.date,
    });
  };

  const saveEdit = async () => {
    const payload = convertFrontendToBackend(editForm);

    try {
      await fetch(`${API_BASE}/updateschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          ...payload,
        }),
      });

      await getSchedule();
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      title: "",
      description: "",
      time: "",
      endTime: "",
      date: "",
    });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredSchedules = schedules.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  const pendingCount = schedules.filter((s) => s.status === "pending").length;
  const completeCount = schedules.filter((s) => s.status === "complete").length;

  if (loadingUser) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#0e1116] via-[#14171d] to-[#1b1f27] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!userdetails) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#0e1116] via-[#14171d] to-[#1b1f27] flex items-center justify-center">
        <div className="text-white text-xl">
          Please log in to view schedules
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0e1116] via-[#14171d] to-[#1b1f27] flex flex-col items-center px-4 py-20">
      {/* Page Header */}
      <div className="w-full max-w-5xl mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <CalendarDays className="w-9 h-9 text-[#6b72ff]" />
            Schedule Manager
          </h1>
          <button
            onClick={getSchedule}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#2f333d] hover:bg-[#3a3f4a] text-white rounded-lg transition disabled:opacity-50"
            title="Refresh schedules"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        <p className="text-gray-400 text-base">
          Organize your tasks with detailed scheduling and tracking
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-[#1b1f27]/70 border border-[#2f333d] rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Total</p>
            <p className="text-3xl font-bold text-white">{schedules.length}</p>
          </div>
          <div className="bg-[#1b1f27]/70 border border-[#2f333d] rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{pendingCount}</p>
          </div>
          <div className="bg-[#1b1f27]/70 border border-[#2f333d] rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Complete</p>
            <p className="text-3xl font-bold text-green-400">{completeCount}</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl">
        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "all"
                  ? "bg-[#6b72ff] text-white"
                  : "bg-[#1b1f27] text-gray-400 hover:bg-[#2f333d]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-[#1b1f27] text-gray-400 hover:bg-[#2f333d]"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("complete")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "complete"
                  ? "bg-green-500 text-white"
                  : "bg-[#1b1f27] text-gray-400 hover:bg-[#2f333d]"
              }`}
            >
              Complete
            </button>
          </div>

          {/* Add Schedule Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6b72ff] to-[#5a61e6] hover:from-[#7a81ff] hover:to-[#6970f0] text-white rounded-xl font-medium transition shadow-lg shadow-[#6b72ff]/20"
            >
              <Plus className="w-5 h-5" /> New Schedule
            </button>
          )}
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-6 bg-[#1b1f27] border border-[#2f333d] rounded-2xl p-6 shadow-xl">
            <h3 className="text-white text-xl font-semibold mb-5 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#6b72ff]" />
              Create New Schedule
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter task title..."
                  value={newSchedule.title}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, title: e.target.value })
                  }
                  className="w-full bg-[#13161c] border border-[#2f333d] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#6b72ff] focus:ring-2 focus:ring-[#6b72ff]/20 transition"
                  onKeyPress={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Description *
                </label>
                <textarea
                  placeholder="Add details about this schedule..."
                  value={newSchedule.description}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-[#13161c] border border-[#2f333d] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#6b72ff] focus:ring-2 focus:ring-[#6b72ff]/20 transition resize-none"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newSchedule.date}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, date: e.target.value })
                    }
                    className="w-full bg-[#13161c] border border-[#2f333d] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6b72ff] focus:ring-2 focus:ring-[#6b72ff]/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={newSchedule.time}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, time: e.target.value })
                    }
                    className="w-full bg-[#13161c] border border-[#2f333d] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6b72ff] focus:ring-2 focus:ring-[#6b72ff]/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        endTime: e.target.value,
                      })
                    }
                    className="w-full bg-[#13161c] border border-[#2f333d] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6b72ff] focus:ring-2 focus:ring-[#6b72ff]/20 transition"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAdd}
                disabled={
                  !newSchedule.title.trim() ||
                  !newSchedule.description.trim() ||
                  !newSchedule.date ||
                  !newSchedule.time ||
                  !newSchedule.endTime
                }
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#6b72ff] hover:bg-[#7a81ff] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition shadow-lg"
              >
                <Save className="w-4 h-4" /> Create Schedule
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewSchedule({
                    title: "",
                    description: "",
                    time: "",
                    endTime: "",
                    date: "",
                  });
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#2f333d] hover:bg-[#3a3f4a] text-gray-300 rounded-xl font-medium transition"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-10">
            <RefreshCw className="w-8 h-8 mx-auto text-[#6b72ff] animate-spin mb-2" />
            <p className="text-gray-400">Loading schedules...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredSchedules.length === 0 && !showAddForm && (
          <div className="text-center py-20 bg-[#1b1f27]/50 border border-[#2f333d] rounded-2xl">
            <CalendarDays className="w-20 h-20 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-300 text-xl font-medium">
              {filter === "all" ? "No schedules yet" : `No ${filter} schedules`}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {filter === "all"
                ? "Click 'New Schedule' to create your first task"
                : "Switch to 'All' to see all schedules"}
            </p>
          </div>
        )}

        {/* Schedule List */}
        <div className="space-y-4">
          {!loading &&
            filteredSchedules.map((item) => (
              <div
                key={item.id}
                className={`bg-[#1b1f27] border-2 rounded-2xl p-5 transition-all ${
                  item.status === "complete"
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-[#2f333d] hover:border-[#6b72ff]/30"
                }`}
              >
                {editingId === item.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                        className="w-full bg-[#13161c] border border-[#2f333d] rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#6b72ff] transition"
                        placeholder="Task title..."
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        Description
                      </label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                        className="w-full bg-[#13161c] border border-[#2f333d] rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#6b72ff] transition resize-none"
                        rows="2"
                        placeholder="Description..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-gray-400 text-xs mb-1.5">
                          Date
                        </label>
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) =>
                            setEditForm({ ...editForm, date: e.target.value })
                          }
                          className="w-full bg-[#13161c] border border-[#2f333d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6b72ff] transition"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-xs mb-1.5">
                          Start
                        </label>
                        <input
                          type="time"
                          value={editForm.time}
                          onChange={(e) =>
                            setEditForm({ ...editForm, time: e.target.value })
                          }
                          className="w-full bg-[#13161c] border border-[#2f333d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6b72ff] transition"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-xs mb-1.5">
                          End
                        </label>
                        <input
                          type="time"
                          value={editForm.endTime}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              endTime: e.target.value,
                            })
                          }
                          className="w-full bg-[#13161c] border border-[#2f333d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6b72ff] transition"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={saveEdit}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#6b72ff] hover:bg-[#7a81ff] text-white rounded-xl font-medium transition"
                      >
                        <Save className="w-4 h-4" /> Save Changes
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#2f333d] hover:bg-[#3a3f4a] text-gray-300 rounded-xl font-medium transition"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => toggleStatus(item.id)}
                          className="mt-1 flex-shrink-0"
                        >
                          {item.status === "complete" ? (
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-500 hover:text-yellow-400 transition" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <h3
                            className={`text-lg font-semibold mb-2 ${
                              item.status === "complete"
                                ? "text-gray-400 line-through"
                                : "text-white"
                            }`}
                          >
                            {item.title}
                          </h3>

                          <p className="text-gray-400 text-sm mb-3 leading-relaxed">
                            {item.description}
                          </p>

                          <div className="flex flex-wrap gap-3">
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-[#13161c] px-3 py-1.5 rounded-lg">
                              <CalendarDays className="w-3.5 h-3.5" />
                              {item.endDate}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-[#13161c] px-3 py-1.5 rounded-lg">
                              <Clock className="w-3.5 h-3.5" />
                              {item.endTime}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-[#13161c] px-3 py-1.5 rounded-lg">
                              <Calendar className="w-3.5 h-3.5" />
                              Created: {formatDate(item.createdAt)}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg ${
                                item.status === "complete"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                              }`}
                            >
                              {item.status === "complete" ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Complete
                                </>
                              ) : (
                                <>
                                  <Circle className="w-3.5 h-3.5" />
                                  Pending
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-2.5 bg-[#2f333d] hover:bg-[#3a3f4a] text-[#6b72ff] rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2.5 bg-[#2f333d] hover:bg-red-500/20 text-red-400 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
