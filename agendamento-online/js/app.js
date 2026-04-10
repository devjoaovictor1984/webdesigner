const state = {
    services: [],
    dateOptions: [],
    availableSlots: [],
    selectedServiceId: null,
    selectedDate: "",
    selectedTime: null
};

const elements = {
    serviceList: document.getElementById("service-list"),
    serviceFeedback: document.getElementById("service-feedback"),
    dateList: document.getElementById("date-list"),
    timeList: document.getElementById("time-list"),
    availabilityFeedback: document.getElementById("availability-feedback"),
    form: document.getElementById("booking-form"),
    formFeedback: document.getElementById("form-feedback"),
    submitButton: document.querySelector(".btn-submit"),
    scrollTrigger: document.querySelector("[data-scroll-target]"),
    summary: {
        service: document.getElementById("summary-service"),
        duration: document.getElementById("summary-duration"),
        price: document.getElementById("summary-price"),
        date: document.getElementById("summary-date"),
        time: document.getElementById("summary-time")
    }
};

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
        };

        return entities[character] || character;
    });
}

function setFeedback(element, message) {
    element.textContent = message || "";
}

function formatApiDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDateLabel(date, offset) {
    const shortFormatter = new Intl.DateTimeFormat("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short"
    });
    const compactFormatter = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short"
    });

    const label = offset === 0
        ? `Hoje, ${compactFormatter.format(date)}`
        : shortFormatter.format(date);

    return label.charAt(0).toUpperCase() + label.slice(1);
}

function buildDateOptions(totalDays) {
    return Array.from({ length: totalDays }, (_, offset) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + offset);

        return {
            value: formatApiDate(date),
            label: formatDateLabel(date, offset)
        };
    });
}

function getSelectedService() {
    return state.services.find((service) => service.id === state.selectedServiceId) || null;
}

function getSelectedDateOption() {
    return state.dateOptions.find((dateOption) => dateOption.value === state.selectedDate) || null;
}

function updateSubmitState() {
    elements.submitButton.disabled = !state.selectedServiceId || !state.selectedDate || !state.selectedTime;
}

function updateSummary() {
    const selectedService = getSelectedService();
    const selectedDate = getSelectedDateOption();

    elements.summary.service.textContent = selectedService ? selectedService.name : "Selecione um servico";
    elements.summary.duration.textContent = selectedService ? selectedService.duration_label : "-";
    elements.summary.price.textContent = selectedService ? selectedService.price_label : "-";
    elements.summary.date.textContent = selectedDate ? selectedDate.label : "-";
    elements.summary.time.textContent = state.selectedTime ? state.selectedTime.slice(0, 5) : "Sem horario";

    updateSubmitState();
}

function renderServices() {
    if (!state.services.length) {
        elements.serviceList.innerHTML = '<p class="empty-state">Nenhum servico cadastrado no momento.</p>';
        return;
    }

    elements.serviceList.innerHTML = state.services.map((service) => `
        <button
            class="service-card${service.id === state.selectedServiceId ? " is-active" : ""}"
            type="button"
            data-service-id="${service.id}"
        >
            <small>${escapeHtml(service.category_label || "Atendimento")}</small>
            <strong>${escapeHtml(service.name)}</strong>
            <span>${escapeHtml(service.description)}</span>
            <em>${escapeHtml(service.duration_label)} • ${escapeHtml(service.price_label)}</em>
        </button>
    `).join("");
}

function renderDates() {
    elements.dateList.innerHTML = state.dateOptions.map((dateOption) => `
        <button
            class="choice-chip${dateOption.value === state.selectedDate ? " is-active" : ""}"
            type="button"
            data-date-value="${dateOption.value}"
        >
            ${escapeHtml(dateOption.label)}
        </button>
    `).join("");
}

function renderSlots() {
    if (!state.availableSlots.length) {
        elements.timeList.innerHTML = '<p class="empty-state">Nenhum horario livre para essa data.</p>';
        return;
    }

    elements.timeList.innerHTML = state.availableSlots.map((slot) => `
        <button
            class="time-slot${slot.value === state.selectedTime ? " is-active" : ""}"
            type="button"
            data-time-value="${slot.value}"
        >
            ${escapeHtml(slot.label)}
        </button>
    `).join("");
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    let data;

    try {
        data = await response.json();
    } catch (error) {
        throw new Error("Resposta invalida da API.");
    }

    if (!response.ok || !data.ok) {
        throw new Error(data.message || "Falha na requisicao.");
    }

    return data;
}

async function loadServices() {
    setFeedback(elements.serviceFeedback, "Carregando servicos...");

    const data = await fetchJson("api/services.php");
    state.services = data.services || [];
    state.selectedServiceId = state.services.length ? state.services[0].id : null;

    renderServices();
    setFeedback(elements.serviceFeedback, "");
    updateSummary();
}

async function loadAvailability() {
    if (!state.selectedServiceId || !state.selectedDate) {
        return;
    }

    state.selectedTime = null;
    state.availableSlots = [];
    renderSlots();
    updateSummary();
    setFeedback(elements.availabilityFeedback, "Carregando horarios...");

    const params = new URLSearchParams({
        service_id: String(state.selectedServiceId),
        date: state.selectedDate
    });

    try {
        const data = await fetchJson(`api/availability.php?${params.toString()}`);
        state.availableSlots = data.slots || [];
        state.selectedTime = state.availableSlots.length ? state.availableSlots[0].value : null;

        renderSlots();
        updateSummary();
        setFeedback(
            elements.availabilityFeedback,
            state.availableSlots.length
                ? `${data.total_slots} horarios livres nesta data.`
                : "Nenhum horario livre nesta data."
        );
    } catch (error) {
        renderSlots();
        updateSummary();
        setFeedback(elements.availabilityFeedback, error.message);
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();

    if (!state.selectedServiceId || !state.selectedDate || !state.selectedTime) {
        setFeedback(elements.formFeedback, "Selecione um servico e um horario antes de enviar.");
        return;
    }

    const formData = new FormData(elements.form);
    const selectedService = getSelectedService();
    const selectedDate = getSelectedDateOption();
    const submittedTimeLabel = state.selectedTime.slice(0, 5);

    const payload = {
        service_id: state.selectedServiceId,
        appointment_date: state.selectedDate,
        appointment_time: state.selectedTime,
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        notes: String(formData.get("notes") || "").trim()
    };

    try {
        elements.submitButton.disabled = true;
        const data = await fetchJson("api/bookings.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        setFeedback(
            elements.formFeedback,
            data.message ||
                `Pre-agendamento criado para ${selectedService.name}, ${selectedDate.label} as ${submittedTimeLabel}.`
        );

        elements.form.reset();
        await loadAvailability();
    } catch (error) {
        setFeedback(elements.formFeedback, error.message);
        updateSubmitState();
    }
}

elements.serviceList.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-service-id]");

    if (!button) {
        return;
    }

    state.selectedServiceId = Number(button.dataset.serviceId);
    renderServices();
    updateSummary();
    await loadAvailability();
});

elements.dateList.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-date-value]");

    if (!button) {
        return;
    }

    state.selectedDate = button.dataset.dateValue;
    renderDates();
    updateSummary();
    await loadAvailability();
});

elements.timeList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-time-value]");

    if (!button) {
        return;
    }

    state.selectedTime = button.dataset.timeValue;
    renderSlots();
    updateSummary();
});

if (elements.scrollTrigger) {
    elements.scrollTrigger.addEventListener("click", () => {
        const target = document.querySelector(elements.scrollTrigger.dataset.scrollTarget);

        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
}

elements.form.addEventListener("submit", handleFormSubmit);

async function initializeApp() {
    state.dateOptions = buildDateOptions(5);
    state.selectedDate = state.dateOptions.length ? state.dateOptions[0].value : "";

    renderDates();
    renderSlots();
    updateSummary();

    try {
        await loadServices();
        await loadAvailability();
    } catch (error) {
        renderServices();
        renderSlots();
        setFeedback(elements.serviceFeedback, error.message);
    }
}

initializeApp();
