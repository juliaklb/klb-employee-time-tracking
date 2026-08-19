(() => {
  "use strict";
  const STORAGE_KEY = "grant-tracker-v1";
  const $ = (id) => document.getElementById(id);
  const els = {
    rows: $("grantRows"), empty: $("emptyState"), resultCount: $("resultCount"),
    search: $("search"), clientFilter: $("clientFilter"), yearFilter: $("yearFilter"),
    submittedFilter: $("submittedFilter"), outcomeFilter: $("outcomeFilter"),
    dialog: $("grantDialog"), form: $("grantForm"), toast: $("toast"),
  };
  const seed = window.GRANT_TRACKER_SEED;
  if (!seed?.grants) throw new Error("Grant data could not be loaded.");

  let grants = loadData();
  let sort = { key: "client", direction: "asc" };
  let toastTimer;

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function loadData() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(stored?.grants) ? stored.grants : clone(seed.grants);
    } catch { return clone(seed.grants); }
  }
  function saveData(message = "Changes saved") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, savedAt: new Date().toISOString(), grants }));
    showToast(message);
  }
  function showToast(message) {
    clearTimeout(toastTimer); els.toast.textContent = message; els.toast.hidden = false;
    toastTimer = setTimeout(() => { els.toast.hidden = true; }, 3000);
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  }
  function numericAmount(value) { return typeof value === "number" && Number.isFinite(value) ? value : 0; }
  function parseAmount(value) {
    const text = String(value ?? "").trim();
    if (!text) return null;
    const normalized = text.replace(/[$,\s]/g, "");
    return /^-?\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : text;
  }
  function money(value) {
    if (typeof value === "number" && Number.isFinite(value)) return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: value % 1 ? 2 : 0 }).format(value);
    return value ? escapeHtml(value) : "—";
  }
  function badge(value, pendingLabel = "Pending") {
    const label = value || pendingLabel;
    const tone = label === "Yes" ? "yes" : label === "No" ? "no" : "pending";
    return `<span class="badge badge-${tone}">${escapeHtml(label)}</span>`;
  }
  function unique(values) { return [...new Set(values.filter((value) => value !== "" && value != null))]; }
  function populateFilters() {
    const clients = unique(grants.map((g) => g.client)).sort((a, b) => a.localeCompare(b));
    const years = unique(grants.map((g) => g.year)).sort((a, b) => b - a);
    const selectedClient = els.clientFilter.value;
    const selectedYear = els.yearFilter.value;
    els.clientFilter.innerHTML = `<option value="">All clients</option>${clients.map((v) => `<option>${escapeHtml(v)}</option>`).join("")}`;
    els.yearFilter.innerHTML = `<option value="">All years</option>${years.map((v) => `<option>${v}</option>`).join("")}`;
    els.clientFilter.value = clients.includes(selectedClient) ? selectedClient : "";
    els.yearFilter.value = years.map(String).includes(selectedYear) ? selectedYear : "";
    $("clientList").innerHTML = clients.map((v) => `<option value="${escapeHtml(v)}"></option>`).join("");
  }
  function filteredGrants() {
    const query = els.search.value.trim().toLowerCase();
    return grants.filter((g) => {
      const outcome = g.successful || "Pending";
      const submitted = g.submitted || "Unspecified";
      return (!query || `${g.client} ${g.grantName} ${g.notes || ""}`.toLowerCase().includes(query))
        && (!els.clientFilter.value || g.client === els.clientFilter.value)
        && (!els.yearFilter.value || String(g.year) === els.yearFilter.value)
        && (!els.submittedFilter.value || submitted === els.submittedFilter.value)
        && (!els.outcomeFilter.value || outcome === els.outcomeFilter.value);
    }).sort((a, b) => {
      const av = a[sort.key] ?? ""; const bv = b[sort.key] ?? "";
      const comparison = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), "en-CA", { numeric: true, sensitivity: "base" });
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }
  function render() {
    const visible = filteredGrants();
    els.rows.innerHTML = visible.map((g) => `<tr>
      <td>${escapeHtml(g.client)}</td><td><strong>${escapeHtml(g.grantName)}</strong>${g.notes ? `<br><small>${escapeHtml(g.notes)}</small>` : ""}</td>
      <td>${g.year || "—"}</td><td>${badge(g.submitted, "Unspecified")}</td><td>${money(g.amountApplied)}</td>
      <td>${badge(g.successful)}</td><td>${money(g.amountAwarded)}</td><td>${escapeHtml(g.responseDate || "—")}</td>
      <td><div class="row-actions"><button class="small-button" type="button" data-edit="${escapeHtml(g.id)}">Edit</button><button class="small-button delete" type="button" data-delete="${escapeHtml(g.id)}">Delete</button></div></td>
    </tr>`).join("");
    els.empty.hidden = visible.length !== 0;
    els.resultCount.textContent = `${visible.length.toLocaleString("en-CA")} of ${grants.length.toLocaleString("en-CA")} records`;
    $("kpiTotal").textContent = visible.length.toLocaleString("en-CA");
    $("kpiSubmitted").textContent = visible.filter((g) => g.submitted === "Yes").length.toLocaleString("en-CA");
    $("kpiSuccessful").textContent = visible.filter((g) => g.successful === "Yes").length.toLocaleString("en-CA");
    $("kpiAwarded").textContent = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(visible.reduce((sum, g) => sum + numericAmount(g.amountAwarded), 0));
    document.querySelectorAll(".sort").forEach((button) => { button.dataset.active = button.dataset.sort === sort.key ? sort.direction : ""; });
  }
  function clearForm() {
    els.form.reset(); $("recordId").value = ""; $("dialogTitle").textContent = "Add grant"; $("year").value = new Date().getFullYear();
  }
  function openForm(record) {
    clearForm();
    if (record) {
      $("dialogTitle").textContent = "Edit grant"; $("recordId").value = record.id;
      ["client", "grantName", "year", "responseDate", "submitted", "successful", "amountApplied", "amountAwarded", "consultingAmount", "notes"].forEach((key) => { $(key).value = record[key] ?? ""; });
    }
    els.dialog.showModal(); setTimeout(() => $("client").focus(), 0);
  }
  function closeForm() { els.dialog.close(); }
  function recordFromForm() {
    return {
      id: $("recordId").value || `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      client: $("client").value.trim(), grantName: $("grantName").value.trim(),
      year: $("year").value ? Number($("year").value) : null,
      submitted: $("submitted").value, successful: $("successful").value,
      amountApplied: parseAmount($("amountApplied").value), amountAwarded: parseAmount($("amountAwarded").value),
      consultingAmount: parseAmount($("consultingAmount").value), responseDate: $("responseDate").value.trim(),
      notes: $("notes").value.trim(), sourceRow: null,
    };
  }
  function csvCell(value) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }
  function download(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement("a");
    link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }
  function exportCsv() {
    const headers = ["Client", "Grant Name", "Year", "Submitted", "Amount Applied For", "Successful", "Amount Awarded", "Consulting Amount", "Potential Date of Hear Back", "Notes"];
    const rows = filteredGrants().map((g) => [g.client, g.grantName, g.year, g.submitted, g.amountApplied, g.successful, g.amountAwarded, g.consultingAmount, g.responseDate, g.notes]);
    download(`grant-tracker-${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n"), "text/csv;charset=utf-8");
  }

  [els.search, els.clientFilter, els.yearFilter, els.submittedFilter, els.outcomeFilter].forEach((el) => el.addEventListener(el === els.search ? "input" : "change", render));
  $("clearFilters").addEventListener("click", () => { [els.search, els.clientFilter, els.yearFilter, els.submittedFilter, els.outcomeFilter].forEach((el) => { el.value = ""; }); render(); });
  $("addGrant").addEventListener("click", () => openForm());
  $("closeDialog").addEventListener("click", closeForm); $("cancelDialog").addEventListener("click", closeForm);
  els.form.addEventListener("submit", (event) => {
    event.preventDefault(); if (!els.form.reportValidity()) return;
    const record = recordFromForm(); const index = grants.findIndex((g) => g.id === record.id);
    if (index >= 0) grants[index] = record; else grants.unshift(record);
    saveData(index >= 0 ? "Grant updated" : "Grant added"); populateFilters(); render(); closeForm();
  });
  els.rows.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit]"); const remove = event.target.closest("[data-delete]");
    if (edit) openForm(grants.find((g) => g.id === edit.dataset.edit));
    if (remove) {
      const record = grants.find((g) => g.id === remove.dataset.delete);
      if (record && confirm(`Delete “${record.grantName}” for ${record.client}?`)) { grants = grants.filter((g) => g.id !== record.id); saveData("Grant deleted"); populateFilters(); render(); }
    }
  });
  document.querySelectorAll(".sort").forEach((button) => button.addEventListener("click", () => { sort = { key: button.dataset.sort, direction: sort.key === button.dataset.sort && sort.direction === "asc" ? "desc" : "asc" }; render(); }));
  $("exportCsv").addEventListener("click", exportCsv);
  $("exportJson").addEventListener("click", () => download(`grant-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ schemaVersion: 1, savedAt: new Date().toISOString(), grants }, null, 2), "application/json"));
  $("importJson").addEventListener("change", async (event) => {
    const file = event.target.files[0]; if (!file) return;
    try {
      const backup = JSON.parse(await file.text()); if (!Array.isArray(backup.grants)) throw new Error("Missing grants array");
      if (!confirm(`Restore ${backup.grants.length} grant records from this backup? Current browser data will be replaced.`)) return;
      grants = backup.grants; saveData("Backup restored"); populateFilters(); render();
    } catch { alert("This file is not a valid Grant Tracker backup."); } finally { event.target.value = ""; }
  });
  $("resetData").addEventListener("click", () => { if (confirm("Reset all browser edits and return to the original workbook data? This cannot be undone unless you downloaded a backup.")) { grants = clone(seed.grants); localStorage.removeItem(STORAGE_KEY); populateFilters(); render(); showToast("Workbook data restored"); } });

  populateFilters(); render();
})();
