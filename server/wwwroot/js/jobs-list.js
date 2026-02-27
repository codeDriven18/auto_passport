(function () {
    function buildApiUrl(branch) {
        const url = new URL(window.location.origin + "/api/jobs");
        const params = new URLSearchParams(window.location.search);

        if (branch) {
            params.set("branch", branch);
        }
        if (!params.get("page")) params.set("page", "1");
        if (!params.get("pageSize")) params.set("pageSize", "20");

        params.forEach((value, key) => {
            if (value !== null && value !== "") {
                url.searchParams.set(key, value);
            }
        });

        return url.toString();
    }

    function renderState(root, state) {
        root.innerHTML = "";

        if (state.loading) {
            const div = document.createElement("div");
            div.className = "alert alert-info";
            div.textContent = "Loading jobs…";
            root.appendChild(div);
            return;
        }

        if (state.error) {
            const div = document.createElement("div");
            div.className = "alert alert-danger";
            div.textContent = state.error;
            root.appendChild(div);
            return;
        }

        if (!state.items || state.items.length === 0) {
            const div = document.createElement("div");
            div.className = "alert alert-warning";
            div.textContent = "No jobs found for the current filters.";
            root.appendChild(div);
            return;
        }

        const table = document.createElement("table");
        table.className = "table table-sm align-middle";

        const thead = document.createElement("thead");
        thead.className = "table-light";
        thead.innerHTML = `
            <tr>
                <th>Title</th>
                <th>Company/Person</th>
                <th>City</th>
                <th>Remote</th>
                <th>Pay</th>
                <th>Posted</th>
                <th>Source</th>
                <th>Tags</th>
                <th style="width: 170px;"></th>
            </tr>`;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");

        state.items.forEach(job => {
            const tr = document.createElement("tr");

            const titleTd = document.createElement("td");
            const link = document.createElement("a");
            link.href = `/Job/${job.id}`;
            link.textContent = job.title;
            titleTd.appendChild(link);

            if (job.isBookmarked) {
                const badge = document.createElement("span");
                badge.className = "badge badge-accent ms-1";
                badge.textContent = "Saved";
                badge.setAttribute("data-badge-saved", "1");
                titleTd.appendChild(badge);
            }
            if (job.isApplied) {
                const badge2 = document.createElement("span");
                badge2.className = "badge bg-success ms-1";
                badge2.textContent = "Applied";
                badge2.setAttribute("data-badge-applied", "1");
                titleTd.appendChild(badge2);
            }

            const companyTd = document.createElement("td");
            companyTd.textContent = job.companyOrPerson || "";

            const cityTd = document.createElement("td");
            cityTd.textContent = job.city || "";

            const remoteTd = document.createElement("td");
            remoteTd.textContent = job.isRemote ? "Remote" : "On-site";

            const payTd = document.createElement("td");
            if (job.payMin != null || job.payMax != null) {
                const min = job.payMin != null ? job.payMin.toString() : "";
                const max = job.payMax != null ? job.payMax.toString() : "";
                payTd.textContent = `${min} - ${max} ${job.currency || ""}`.trim();
            } else {
                payTd.textContent = "";
            }

            const postedTd = document.createElement("td");
            postedTd.textContent = job.postedAt ? job.postedAt.substring(0, 10) : "";

            const sourceTd = document.createElement("td");
            sourceTd.textContent = job.source ? job.source.name : "";

            const tagsTd = document.createElement("td");
            if (Array.isArray(job.jobTags)) {
                job.jobTags.forEach(jt => {
                    const span = document.createElement("span");
                    span.className = "badge bg-light text-dark border me-1";
                    span.textContent = jt.tag?.name || "";
                    tagsTd.appendChild(span);
                });
            }

            const actionsTd = document.createElement("td");
            actionsTd.className = "text-end";

            const bookmarkBtn = document.createElement("button");
            bookmarkBtn.type = "button";
            bookmarkBtn.className = "btn btn-sm btn-outline-warning";
            bookmarkBtn.textContent = job.isBookmarked ? "Unsave" : "Save";
            bookmarkBtn.addEventListener("click", () => toggleBookmark(job, bookmarkBtn, titleTd));

            const appliedBtn = document.createElement("button");
            appliedBtn.type = "button";
            appliedBtn.className = "btn btn-sm btn-outline-success ms-1";
            appliedBtn.textContent = job.isApplied ? "Unapply" : "Applied";
            appliedBtn.addEventListener("click", () => toggleApplied(job, appliedBtn, titleTd));

            const editLink = document.createElement("a");
            editLink.href = `/Job/Edit/${job.id}`;
            editLink.className = "btn btn-sm btn-outline-dark ms-1";
            editLink.textContent = "Edit";

            actionsTd.appendChild(bookmarkBtn);
            actionsTd.appendChild(appliedBtn);
            actionsTd.appendChild(editLink);

            tr.appendChild(titleTd);
            tr.appendChild(companyTd);
            tr.appendChild(cityTd);
            tr.appendChild(remoteTd);
            tr.appendChild(payTd);
            tr.appendChild(postedTd);
            tr.appendChild(sourceTd);
            tr.appendChild(tagsTd);
            tr.appendChild(actionsTd);

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        root.appendChild(table);

        const total = state.total || 0;
        const page = state.page || 1;
        const pageSize = state.pageSize || 20;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));

        const nav = document.createElement("nav");
        nav.className = "mt-2";
        const ul = document.createElement("ul");
        ul.className = "pagination pagination-sm mb-0";

        function makeLink(p, label, disabled, active) {
            const li = document.createElement("li");
            li.className = "page-item";
            if (disabled) li.classList.add("disabled");
            if (active) li.classList.add("active");

            const a = document.createElement("a");
            a.className = "page-link";
            a.href = "#";
            a.textContent = label;
            a.addEventListener("click", (e) => {
                e.preventDefault();
                if (disabled || active) return;
                const url = new URL(window.location.href);
                url.searchParams.set("page", p.toString());
                window.location.href = url.toString();
            });
            li.appendChild(a);
            return li;
        }

        ul.appendChild(makeLink(page - 1, "Prev", page <= 1, false));
        for (let p = 1; p <= totalPages; p++) {
            ul.appendChild(makeLink(p, p.toString(), false, p === page));
        }
        ul.appendChild(makeLink(page + 1, "Next", page >= totalPages, false));

        nav.appendChild(ul);
        root.appendChild(nav);
    }

    async function fetchJobs(root) {
        const branch = root.dataset.branch || null;
        const apiUrl = buildApiUrl(branch);

        renderState(root, { loading: true });

        try {
            const res = await fetch(apiUrl, { headers: { "Accept": "application/json" } });
            if (!res.ok) {
                throw new Error(`API error ${res.status}`);
            }
            const data = await res.json();
            renderState(root, data);
        } catch (err) {
            renderState(root, { error: err?.message || "Failed to load jobs." });
        }
    }

    function ensureBadge(titleTd, kind, enabled) {
        const selector = kind === "saved" ? "[data-badge-saved]" : "[data-badge-applied]";
        const existing = titleTd.querySelector(selector);
        if (enabled) {
            if (existing) return;
            const badge = document.createElement("span");
            if (kind === "saved") {
                badge.className = "badge badge-accent ms-1";
                badge.textContent = "Saved";
                badge.setAttribute("data-badge-saved", "1");
            } else {
                badge.className = "badge bg-success ms-1";
                badge.textContent = "Applied";
                badge.setAttribute("data-badge-applied", "1");
            }
            titleTd.appendChild(badge);
        } else {
            if (existing) existing.remove();
        }
    }

    async function toggleBookmark(job, button, titleTd) {
        const desired = !job.isBookmarked;
        button.disabled = true;
        try {
            const res = await fetch(`/api/jobs/${job.id}/bookmark`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({ isBookmarked: desired })
            });
            if (!res.ok) throw new Error("Failed to update bookmark");
            const data = await res.json();
            job.isBookmarked = data.isBookmarked;
            button.textContent = job.isBookmarked ? "Unsave" : "Save";
            ensureBadge(titleTd, "saved", job.isBookmarked);
        } catch (e) {
            alert(e?.message || "Error updating bookmark");
        } finally {
            button.disabled = false;
        }
    }

    async function toggleApplied(job, button, titleTd) {
        const desired = !job.isApplied;
        button.disabled = true;
        try {
            const res = await fetch(`/api/jobs/${job.id}/applied`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({ isApplied: desired })
            });
            if (!res.ok) throw new Error("Failed to update applied");
            const data = await res.json();
            job.isApplied = data.isApplied;
            button.textContent = job.isApplied ? "Unapply" : "Applied";
            ensureBadge(titleTd, "applied", job.isApplied);
        } catch (e) {
            alert(e?.message || "Error updating applied");
        } finally {
            button.disabled = false;
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        const root = document.getElementById("jobs-root");
        if (!root) return;
        hydrateSources().finally(() => fetchJobs(root));
    });

    async function hydrateSources() {
        const select = document.getElementById("sourceIdSelect");
        if (!select) return;

        const selected = select.getAttribute("data-selected") || "";

        try {
            const res = await fetch("/api/sources", { headers: { "Accept": "application/json" } });
            if (!res.ok) return;
            const sources = await res.json();
            if (!Array.isArray(sources)) return;

            sources.forEach(s => {
                const opt = document.createElement("option");
                opt.value = s.id.toString();
                opt.textContent = s.name;
                if (selected && selected === opt.value) {
                    opt.selected = true;
                }
                select.appendChild(opt);
            });
        } catch {
            // ignore
        }
    }
})();

