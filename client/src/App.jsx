import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const API = "/api";

const categories = ["All", "Camera", "Projector", "Microphone", "Tripod"];

function App() {
  const [equipment, setEquipment] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [borrowModal, setBorrowModal] = useState(null);
  const [addModal, setAddModal] = useState(false);

  const [borrowForm, setBorrowForm] = useState({
    borrowerName: "",
    borrowerEmail: "",
    quantity: 1,
    dueDate: "",
  });

  const [equipmentForm, setEquipmentForm] = useState({
    name: "",
    category: "Camera",
    totalQuantity: 1,
    deposit: 500,
    lateFeePerDay: 50,
  });

  const fetchData = async () => {
    try {
      setError("");

      const [equipmentRes, rentalsRes] = await Promise.all([
        fetch(`${API}/equipment`),
        fetch(`${API}/rentals`),
      ]);

      if (!equipmentRes.ok || !rentalsRes.ok) {
        throw new Error("Unable to connect to the server");
      }

      const equipmentData = await equipmentRes.json();
      const rentalsData = await rentalsRes.json();

      setEquipment(equipmentData);
      setRentals(rentalsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

 const handleRefresh = () => {
  setRefreshing(true);
  fetchData();
  toast.success("Inventory refreshed");
};

  const openBorrowModal = (item) => {
    if (item.availableQuantity <= 0) return;

    const defaultDue = new Date(Date.now() + 3 * 86400000)
      .toISOString()
      .split("T")[0];

    setBorrowForm({
      borrowerName: "",
      borrowerEmail: "",
      quantity: 1,
      dueDate: defaultDue,
    });

    setBorrowModal(item);
  };

  const handleBorrow = async (e) => {
    e.preventDefault();

    if (!borrowModal) return;

    try {
      const response = await fetch(`${API}/rentals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          equipmentId: borrowModal._id,
          borrowerName: borrowForm.borrowerName,
          borrowerEmail: borrowForm.borrowerEmail,
          quantity: Number(borrowForm.quantity),
          borrowDate: new Date().toISOString(),
          dueDate: borrowForm.dueDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
  toast.error(data.message);
  return;
}

      setBorrowModal(null);

   toast.success(
  `Rental created successfully! Deposit: ₹${data.rental.depositAmount}`
);

      fetchData();
    } catch (err) {
      toast.error("Unable to create rental request.");
    }
  };

  const handleReturn = async (rentalId) => {
    const confirmed = window.confirm(
      "Are you sure you want to mark this equipment as returned?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/rentals/${rentalId}/return`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
        return;
      }

     toast.success(
  `Returned successfully! Refund: ₹${data.refundAmount}`,
  {
    duration: 4000,
  }
);

      fetchData();
    } catch (err) {
      toast.error("Unable to process the return.");
    }
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/equipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: equipmentForm.name,
          category: equipmentForm.category,
          totalQuantity: Number(equipmentForm.totalQuantity),
          deposit: Number(equipmentForm.deposit),
          lateFeePerDay: Number(equipmentForm.lateFeePerDay),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      setAddModal(false);

      setEquipmentForm({
        name: "",
        category: "Camera",
        totalQuantity: 1,
        deposit: 500,
        lateFeePerDay: 50,
      });

      toast.success("Equipment added successfully!");
      fetchData();
    } catch (err) {
     toast.error("Unable to add equipment.");
    }
  };

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || item.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [equipment, search, category]);

  const activeRentals = rentals.filter(
    (rental) => rental.status !== "returned"
  );

  const overdueRentals = activeRentals.filter(
    (rental) => new Date(rental.dueDate) < new Date()
  );

  const totalUnits = equipment.reduce(
    (sum, item) => sum + item.totalQuantity,
    0
  );

  const availableUnits = equipment.reduce(
    (sum, item) => sum + item.availableQuantity,
    0
  );

  const borrowedUnits = totalUnits - availableUnits;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getIcon = (category) => {
    if (category === "Camera") return "📷";
    if (category === "Projector") return "📽️";
    if (category === "Microphone") return "🎙️";
    if (category === "Tripod") return "📐";
    return "📦";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b18] flex items-center justify-center text-white">
        

        <div className="text-center">
          <div className="text-5xl mb-5">🎥</div>
          <div className="animate-pulse text-slate-300">
            Loading CampusAV...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b18] text-white">
      <Toaster
  position="top-right"
  toastOptions={{
    duration: 3000,
    style: {
      background: "#111827",
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "14px",
      padding: "14px 18px",
    },
    success: {
      iconTheme: {
        primary: "#10b981",
        secondary: "#fff",
      },
    },
    error: {
      iconTheme: {
        primary: "#ef4444",
        secondary: "#fff",
      },
    },
  }}
/>
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#070b18]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20">
              🎥
            </div>

            <div>
              <h1 className="text-lg font-bold">
                Campus<span className="text-indigo-400">AV</span>
              </h1>
              <p className="text-xs text-slate-500">
                Equipment Management
              </p>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-7 text-sm">
            <a
              href="#equipment"
              className="text-slate-300 hover:text-white transition"
            >
              Equipment
            </a>

            <a
              href="#rentals"
              className="text-slate-300 hover:text-white transition"
            >
              Rentals
            </a>

            <button
              onClick={handleRefresh}
              className="text-slate-300 hover:text-white transition"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>

            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Online
            </div>
          </div>
        </div>
      </nav>

      {/* ERROR */}
      {error && (
        <div className="max-w-7xl mx-auto px-5 md:px-8 pt-6">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* HERO */}
      <main>
        <section className="max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-14">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-[#11172b] to-[#0b1020]">
            <div className="absolute -top-32 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />

            <div className="relative px-7 py-10 md:px-12 md:py-14">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-sm">
                  🎓 College AV Resource Center
                </span>

                <h2 className="mt-6 text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
                  Everything you need
                  <span className="block text-indigo-400">
                    to create.
                  </span>
                </h2>

                <p className="mt-6 text-slate-300 text-base md:text-lg leading-8 max-w-2xl">
                  A simple and transparent way for students and
                  faculty to discover, borrow and return college AV
                  equipment.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#equipment"
                    className="px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 font-semibold transition shadow-lg shadow-indigo-500/20"
                  >
                    Browse Equipment →
                  </a>

                  <a
                    href="#rentals"
                    className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 font-semibold transition"
                  >
                    View Rentals
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="max-w-7xl mx-auto px-5 md:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Stat
              icon="📦"
              title="Equipment"
              value={equipment.length}
            />

            <Stat
              icon="🎥"
              title="Total Units"
              value={totalUnits}
            />

            <Stat
              icon="✅"
              title="Available"
              value={availableUnits}
            />

            <Stat
              icon="📤"
              title="Borrowed"
              value={borrowedUnits}
            />

            <Stat
              icon="⚠️"
              title="Overdue"
              value={overdueRentals.length}
            />
          </div>
        </section>

        {/* EQUIPMENT */}
        <section
          id="equipment"
          className="max-w-7xl mx-auto px-5 md:px-8 py-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-7">
            <div>
              <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest">
                Inventory
              </p>

              <h2 className="text-3xl font-bold mt-2">
                Equipment Library
              </h2>

              <p className="text-slate-400 mt-2">
                Browse available cameras, projectors, microphones
                and accessories.
              </p>
            </div>

            <button
              onClick={() => setAddModal(true)}
              className="px-5 py-3 rounded-xl bg-white text-slate-950 hover:bg-slate-200 font-bold transition"
            >
              + Add Equipment
            </button>
          </div>

          {/* SEARCH */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <span className="absolute left-4 top-3.5 text-slate-500">
                  🔍
                </span>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search equipment..."
                  className="w-full bg-[#0b1020] border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                      category === item
                        ? "bg-indigo-500 text-white"
                        : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredEquipment.length === 0 ? (
            <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">🔎</div>
              <p className="text-slate-400">
                No equipment matches your search.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredEquipment.map((item) => {
                const percentage =
                  item.totalQuantity > 0
                    ? (item.availableQuantity /
                        item.totalQuantity) *
                      100
                    : 0;

                return (
                  <div
                    key={item._id}
                    className="group rounded-2xl border border-white/10 bg-[#0d1324] overflow-hidden hover:border-indigo-500/40 hover:-translate-y-1 transition duration-300"
                  >
                    <div className="h-36 bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-transparent flex items-center justify-center relative">
                      <span className="text-6xl group-hover:scale-110 transition duration-300">
                        {getIcon(item.category)}
                      </span>

                      <span
                        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                          item.availableQuantity > 0
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {item.availableQuantity > 0
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </div>

                    <div className="p-5">
                      <p className="text-xs uppercase tracking-widest text-indigo-400 font-bold">
                        {item.category}
                      </p>

                      <h3 className="text-xl font-bold mt-1">
                        {item.name}
                      </h3>

                      {/* Availability bar */}
                      <div className="mt-5">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-slate-500">
                            Availability
                          </span>

                          <span className="text-slate-300">
                            {item.availableQuantity} of{" "}
                            {item.totalQuantity}
                          </span>
                        </div>

                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-5">
                        <Detail
                          label="Security Deposit"
                          value={`₹${item.deposit}`}
                        />

                        <Detail
                          label="Late Fee"
                          value={`₹${item.lateFeePerDay}/day`}
                        />
                      </div>

                      <button
                        onClick={() => openBorrowModal(item)}
                        disabled={item.availableQuantity === 0}
                        className="w-full mt-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-800 disabled:text-slate-600 font-bold transition"
                      >
                        {item.availableQuantity > 0
                          ? "Borrow Equipment"
                          : "Not Available"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* RENTALS */}
        <section
          id="rentals"
          className="mt-8 border-t border-white/10 bg-[#0a0f1e]"
        >
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
              <div>
                <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest">
                  Management
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  Rental Records
                </h2>

                <p className="text-slate-400 mt-2">
                  Track active loans, due dates and completed returns.
                </p>
              </div>

              <span className="text-sm text-slate-500">
                {rentals.length} total records
              </span>
            </div>

            {overdueRentals.length > 0 && (
              <div className="mb-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
                ⚠️ There {overdueRentals.length === 1 ? "is" : "are"}{" "}
                <strong>{overdueRentals.length}</strong> overdue{" "}
                {overdueRentals.length === 1 ? "rental" : "rentals"}.
              </div>
            )}

            {rentals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-slate-500">
                No rentals yet. Borrow some equipment to see records
                here.
              </div>
            ) : (
              <div className="space-y-4">
                {rentals.map((rental) => {
                  const overdue =
                    rental.status !== "returned" &&
                    new Date(rental.dueDate) < new Date();

                  return (
                    <div
                      key={rental._id}
                      className="rounded-2xl border border-white/10 bg-[#0d1324] p-5 hover:border-white/20 transition"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 shrink-0 rounded-xl bg-indigo-500/10 flex items-center justify-center text-2xl">
                            {getIcon(
                              rental.equipment?.category
                            )}
                          </div>

                          <div>
                            <h3 className="font-bold text-lg">
                              {rental.equipment?.name ||
                                "Equipment"}
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                              {rental.borrowerName} •{" "}
                              {rental.borrowerEmail}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <Detail
                            label="Quantity"
                            value={rental.quantity}
                          />

                          <Detail
                            label="Due Date"
                            value={formatDate(rental.dueDate)}
                          />

                          <div className="px-3 py-2 rounded-lg bg-white/5">
                            <p className="text-xs text-slate-500">
                              Status
                            </p>

                            <p
                              className={`text-sm font-semibold mt-1 ${
                                overdue
                                  ? "text-red-400"
                                  : rental.status ===
                                    "returned"
                                  ? "text-emerald-400"
                                  : "text-indigo-400"
                              }`}
                            >
                              {overdue
                                ? "Overdue"
                                : rental.status}
                            </p>
                          </div>
                        </div>

                        {rental.status !== "returned" ? (
                          <button
                            onClick={() =>
                              handleReturn(rental._id)
                            }
                            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition"
                          >
                            Return
                          </button>
                        ) : (
                          <div className="text-right min-w-24">
                            <p className="text-xs text-slate-500">
                              Refund
                            </p>

                            <p className="text-lg font-bold text-emerald-400">
                              ₹{rental.refundAmount}
                            </p>
                          </div>
                        )}
                      </div>

                      {rental.status === "returned" && (
                        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap gap-6 text-sm">
                          <div>
                            <span className="text-slate-500">
                              Deposit
                            </span>
                            <p className="font-medium mt-1">
                              ₹{rental.depositAmount}
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-500">
                              Late Fee
                            </span>
                            <p className="font-medium text-amber-400 mt-1">
                              ₹{rental.lateFee}
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-500">
                              Returned On
                            </span>
                            <p className="font-medium mt-1">
                              {formatDate(rental.returnDate)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-8 text-center">
        <p className="font-semibold">
          Campus<span className="text-indigo-400">AV</span>
        </p>

        <p className="text-sm text-slate-600 mt-2">
          College AV Equipment Rental System
        </p>

        <p className="text-xs text-slate-700 mt-1">
          React • Tailwind CSS • Express • MongoDB
        </p>
      </footer>

      {/* BORROW MODAL */}
      {borrowModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d1324] shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-indigo-400 font-bold">
                  New Rental
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  {borrowModal.name}
                </h2>
              </div>

              <button
                onClick={() => setBorrowModal(null)}
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBorrow} className="p-6 space-y-4">
              <Input
                label="Borrower Name"
                value={borrowForm.borrowerName}
                onChange={(e) =>
                  setBorrowForm({
                    ...borrowForm,
                    borrowerName: e.target.value,
                  })
                }
                placeholder="Enter your full name"
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={borrowForm.borrowerEmail}
                onChange={(e) =>
                  setBorrowForm({
                    ...borrowForm,
                    borrowerEmail: e.target.value,
                  })
                }
                placeholder="student@college.edu"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  max={borrowModal.availableQuantity}
                  value={borrowForm.quantity}
                  onChange={(e) =>
                    setBorrowForm({
                      ...borrowForm,
                      quantity: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  label="Due Date"
                  type="date"
                  value={borrowForm.dueDate}
                  onChange={(e) =>
                    setBorrowForm({
                      ...borrowForm,
                      dueDate: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Security deposit
                  </span>

                  <strong>
                    ₹
                    {Number(borrowForm.quantity || 0) *
                      borrowModal.deposit}
                  </strong>
                </div>

                <div className="flex justify-between mt-2">
                  <span className="text-slate-400">
                    Late fee
                  </span>

                  <strong>
                    ₹{borrowModal.lateFeePerDay}/day/unit
                  </strong>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBorrowModal(null)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 font-bold"
                >
                  Confirm Borrow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD EQUIPMENT MODAL */}
      {addModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d1324] shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-indigo-400 font-bold">
                  Inventory
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  Add Equipment
                </h2>
              </div>

              <button
                onClick={() => setAddModal(false)}
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleAddEquipment}
              className="p-6 space-y-4"
            >
              <Input
                label="Equipment Name"
                value={equipmentForm.name}
                onChange={(e) =>
                  setEquipmentForm({
                    ...equipmentForm,
                    name: e.target.value,
                  })
                }
                placeholder="e.g. Sony Mirrorless Camera"
                required
              />

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Category
                </label>

                <select
                  value={equipmentForm.category}
                  onChange={(e) =>
                    setEquipmentForm({
                      ...equipmentForm,
                      category: e.target.value,
                    })
                  }
                  className="w-full bg-[#080d1b] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                >
                  <option>Camera</option>
                  <option>Projector</option>
                  <option>Microphone</option>
                  <option>Tripod</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  value={equipmentForm.totalQuantity}
                  onChange={(e) =>
                    setEquipmentForm({
                      ...equipmentForm,
                      totalQuantity: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  label="Deposit ₹"
                  type="number"
                  min="0"
                  value={equipmentForm.deposit}
                  onChange={(e) =>
                    setEquipmentForm({
                      ...equipmentForm,
                      deposit: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  label="Late Fee ₹"
                  type="number"
                  min="0"
                  value={equipmentForm.lateFeePerDay}
                  onChange={(e) =>
                    setEquipmentForm({
                      ...equipmentForm,
                      lateFeePerDay: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 font-bold"
                >
                  Add Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1324] p-5">
      <div className="text-2xl">{icon}</div>
      <p className="text-xs uppercase tracking-wider text-slate-500 mt-4">
        {title}
      </p>
      <p className="text-3xl font-black mt-1">{value}</p>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="px-3 py-2.5 rounded-lg bg-white/[0.04]">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="text-sm font-semibold mt-1 truncate">
        {value}
      </p>
    </div>
  );
}

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  min,
  max,
}) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-2">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        className="w-full bg-[#080d1b] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
      />
    </div>
  );
}

export default App;