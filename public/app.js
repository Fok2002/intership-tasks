/**
 * Student Dashboard — app.js
 * Vanilla JS client for the Users REST API (http://localhost:3000/users)
 */
const API = "/users";

/* ── DOM refs ──────────────────────────────────────────────── */
const $ = (s) => document.querySelector(s);
const loader       = $("#loader");
const emptyState   = $("#empty-state");
const noResults    = $("#no-results");
const tableView    = $("#table-view");
const tableBody    = $("#table-body");
const searchInput  = $("#search-input");
const statNumber   = $(".stat-number");
const toastBox     = $("#toast-container");

// Modal – add/edit
const modalOverlay = $("#modal-overlay");
const modalTitle   = $("#modal-title");
const form         = $("#student-form");
const inputName    = $("#input-name");
const inputEmail   = $("#input-email");
const inputId      = $("#input-id");
const errorName    = $("#error-name");
const errorEmail   = $("#error-email");
const btnSubmitTxt = $("#btn-submit-text");

// Modal – delete
const deleteOverlay = $("#delete-overlay");
const deleteName    = $("#delete-name");

let students = [];
let filtered = [];
let deleteTargetId = null;

/* ── API helpers ───────────────────────────────────────────── */
async function api(method, path = "", body = null) {
    const opts = { method, headers: { "Content-Type": "application/json" } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API}${path}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Request failed");
    return data;
}

/* ── Fetch & render ────────────────────────────────────────── */
async function loadStudents() {
    show(loader); hide(emptyState, noResults, tableView);
    try {
        const res = await api("GET");
        students = res.data || res || [];
        applySearch();
    } catch (e) {
        toast("Failed to load students", "error");
    } finally {
        hide(loader);
    }
}

function applySearch() {
    const q = searchInput.value.trim().toLowerCase();
    filtered = q
        ? students.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
        : [...students];
    render();
}

function render() {
    statNumber.textContent = students.length;
    if (students.length === 0) { show(emptyState); hide(tableView, noResults); return; }
    hide(emptyState);
    if (filtered.length === 0) { show(noResults); hide(tableView); return; }
    hide(noResults); show(tableView);
    tableBody.innerHTML = filtered.map((s, i) => `
        <tr class="row-enter" style="animation-delay:${i * 40}ms">
            <td>${i + 1}</td>
            <td>
                <div class="name-cell">
                    <span class="student-avatar">${initials(s.name)}</span>
                    <span class="student-name">${esc(s.name)}</span>
                </div>
            </td>
            <td><span class="email-text">${esc(s.email)}</span></td>
            <td>
                <div class="action-btns">
                    <button class="icon-btn" title="Edit" onclick="openEdit('${s._id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                    <button class="icon-btn danger" title="Delete" onclick="openDelete('${s._id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

/* ── Modal: Add / Edit ─────────────────────────────────────── */
function openAdd() {
    inputId.value = "";
    form.reset();
    clearErrors();
    modalTitle.textContent = "Add Student";
    btnSubmitTxt.textContent = "Add Student";
    show(modalOverlay);
    inputName.focus();
}

function openEdit(id) {
    const s = students.find(x => x._id === id);
    if (!s) return;
    clearErrors();
    inputId.value = s._id;
    inputName.value = s.name;
    inputEmail.value = s.email;
    modalTitle.textContent = "Edit Student";
    btnSubmitTxt.textContent = "Save Changes";
    show(modalOverlay);
    inputName.focus();
}

function closeModal() { hide(modalOverlay); }

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const body = { name: inputName.value.trim(), email: inputEmail.value.trim() };
    const editing = inputId.value;
    try {
        if (editing) {
            await api("PUT", `/${editing}`, body);
            toast("Student updated", "success");
        } else {
            await api("POST", "", body);
            toast("Student added", "success");
        }
        closeModal();
        await loadStudents();
    } catch (e) {
        toast(e.message, "error");
    }
});

function validate() {
    let ok = true;
    clearErrors();
    if (!inputName.value.trim()) { errorName.textContent = "Name is required"; inputName.classList.add("invalid"); ok = false; }
    if (!inputEmail.value.trim()) { errorEmail.textContent = "Email is required"; inputEmail.classList.add("invalid"); ok = false; }
    else if (!/\S+@\S+\.\S+/.test(inputEmail.value.trim())) { errorEmail.textContent = "Enter a valid email"; inputEmail.classList.add("invalid"); ok = false; }
    return ok;
}
function clearErrors() { errorName.textContent = ""; errorEmail.textContent = ""; inputName.classList.remove("invalid"); inputEmail.classList.remove("invalid"); }

/* ── Modal: Delete ─────────────────────────────────────────── */
function openDelete(id) {
    deleteTargetId = id;
    const s = students.find(x => x._id === id);
    deleteName.textContent = s ? s.name : "this student";
    show(deleteOverlay);
}

function closeDelete() { hide(deleteOverlay); deleteTargetId = null; }

$("#delete-confirm").addEventListener("click", async () => {
    if (!deleteTargetId) return;
    try {
        await api("DELETE", `/${deleteTargetId}`);
        toast("Student deleted", "success");
        closeDelete();
        await loadStudents();
    } catch (e) { toast(e.message, "error"); }
});

/* ── Toast ─────────────────────────────────────────────────── */
function toast(msg, type = "info") {
    const icons = { success: "✅", error: "❌", info: "ℹ️" };
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${esc(msg)}</span>`;
    toastBox.appendChild(el);
    setTimeout(() => { el.classList.add("toast-exit"); setTimeout(() => el.remove(), 300); }, 3500);
}

/* ── Utilities ─────────────────────────────────────────────── */
function initials(name) { return name.split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase(); }
function esc(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
function show(...els) { els.forEach(e => e.classList.remove("hidden")); }
function hide(...els) { els.forEach(e => e.classList.add("hidden")); }

/* ── Event wiring ──────────────────────────────────────────── */
$("#btn-add").addEventListener("click", openAdd);
$("#btn-add-empty").addEventListener("click", openAdd);
$("#modal-close").addEventListener("click", closeModal);
$("#btn-cancel").addEventListener("click", closeModal);
$("#delete-close").addEventListener("click", closeDelete);
$("#delete-cancel").addEventListener("click", closeDelete);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
deleteOverlay.addEventListener("click", (e) => { if (e.target === deleteOverlay) closeDelete(); });
searchInput.addEventListener("input", applySearch);

// Make openEdit/openDelete available to inline onclick
window.openEdit = openEdit;
window.openDelete = openDelete;

/* ── Init ──────────────────────────────────────────────────── */
loadStudents();
