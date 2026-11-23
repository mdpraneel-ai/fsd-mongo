// ==========================================
// RAILWAY BOOKING SYSTEM USING FINITE AUTOMATA
// ==========================================

// DFA states
const states = {
    q0: "Initial State",
    q1: "Journey Details Entered",
    q2: "Train Selected",
    q3: "Passenger Details Validated",
    q4: "Payment Successful",
    q5: "Ticket Confirmed",
    qR: "Rejected State"
};

// Current DFA state
let currentState = "q0";

// Booking data
let selectedTrain = null;
let booking = {};

// Sample train database
const trains = [
    {
        name: "Mysuru Express",
        number: "16232",
        from: "Mysuru",
        to: "Bengaluru",
        departure: "06:00 AM",
        arrival: "09:00 AM",
        fare: 250,
        seats: 45
    },
    {
        name: "Shatabdi Express",
        number: "12008",
        from: "Mysuru",
        to: "Bengaluru",
        departure: "02:15 PM",
        arrival: "05:00 PM",
        fare: 450,
        seats: 30
    },
    {
        name: "Chennai Express",
        number: "12610",
        from: "Bengaluru",
        to: "Chennai",
        departure: "08:00 PM",
        arrival: "05:00 AM",
        fare: 650,
        seats: 25
    },
    {
        name: "Kaveri Express",
        number: "16022",
        from: "Bengaluru",
        to: "Chennai",
        departure: "09:30 PM",
        arrival: "06:30 AM",
        fare: 550,
        seats: 20
    },
    {
        name: "Hyderabad Express",
        number: "17014",
        from: "Bengaluru",
        to: "Hyderabad",
        departure: "07:00 PM",
        arrival: "07:00 AM",
        fare: 700,
        seats: 35
    },
    {
        name: "Chamundi Express",
        number: "16216",
        from: "Bengaluru",
        to: "Mysuru",
        departure: "06:30 PM",
        arrival: "09:30 PM",
        fare: 300,
        seats: 40
    }
];

// ==========================================
// DFA TRANSITION FUNCTION
// ==========================================

function transition(nextState, symbol) {

    const validTransitions = {
        q0: { SEARCH: "q1" },
        q1: { SELECT: "q2" },
        q2: { DETAILS: "q3" },
        q3: { PAY: "q4" },
        q4: { CONFIRM: "q5" }
    };

    const expected = validTransitions[currentState]?.[symbol];

    if (expected === nextState) {
        currentState = nextState;
        updateDFA(symbol);
        return true;
    }

    currentState = "qR";
    updateDFA(symbol + " (Invalid)");
    return false;
}

// ==========================================
// UPDATE DFA VISUALIZATION
// ==========================================

function updateDFA(symbol = "None") {

    document.querySelectorAll(".dfa-state").forEach(element => {

        element.classList.remove("active", "completed");

        const state = element.dataset.state;

        if (state === currentState) {
            element.classList.add("active");
        }

        const order = ["q0", "q1", "q2", "q3", "q4", "q5"];

        if (
            order.includes(state) &&
            order.indexOf(state) < order.indexOf(currentState)
        ) {
            element.classList.add("completed");
        }
    });

    document.getElementById("currentState").textContent =
        currentState;

    document.getElementById("stateDescription").textContent =
        states[currentState];

    document.getElementById("transitionLabel").textContent =
        "Transition: " + symbol;

    document.getElementById("acceptance").textContent =
        currentState === "q5"
            ? "Status: ACCEPTED ✓"
            : currentState === "qR"
                ? "Status: REJECTED ✗"
                : "Status: In Progress";
}

// ==========================================
// SHOW ERROR
// ==========================================

function reject(message, elementId) {

    currentState = "qR";
    updateDFA("Invalid Input");

    document.getElementById(elementId).textContent = message;
}

// ==========================================
// 1. SEARCH TRAINS
// ==========================================

document.getElementById("searchBtn").addEventListener("click", () => {

    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    const date = document.getElementById("journeyDate").value;

    const message = document.getElementById("searchMessage");

    if (!from || !to || !date) {
        reject("Please enter all journey details.", "searchMessage");
        return;
    }

    const selectedDate = new Date(date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (from === to) {
        reject("Source and destination cannot be the same.",
            "searchMessage");
        return;
    }

    if (selectedDate < today) {
        reject("Please select a valid future date.",
            "searchMessage");
        return;
    }

    if (currentState !== "q0") {
        message.textContent =
            "Please reset the DFA before starting a new booking.";
        return;
    }

    booking.from = from;
    booking.to = to;
    booking.date = date;

    if (!transition("q1", "SEARCH")) return;

    message.textContent = "Journey details accepted!";

    const available = trains.filter(train =>
        train.from === from && train.to === to
    );

    const trainList = document.getElementById("trainList");

    document.getElementById("trainSection")
        .classList.remove("hidden");

    document.getElementById("passengerSection")
        .classList.add("hidden");

    document.getElementById("paymentSection")
        .classList.add("hidden");

    document.getElementById("ticketSection")
        .classList.add("hidden");

    if (available.length === 0) {
        trainList.innerHTML =
            "<p>No sample trains available for this route.</p>";
        return;
    }

    trainList.innerHTML = available.map((train, index) => `
        <div class="train-card">
            <h3>${train.name}</h3>
            <p>Train Number: ${train.number}</p>
            <p>Departure: ${train.departure}</p>
            <p>Arrival: ${train.arrival}</p>
            <p>Available Seats: ${train.seats}</p>
            <p>Fare: ₹${train.fare}</p>

            <button class="main-btn"
                onclick="selectTrain(${trains.indexOf(train)})">
                Select Train
            </button>
        </div>
    `).join("");

});

// ==========================================
// 2. SELECT TRAIN
// ==========================================

function selectTrain(index) {

    if (currentState !== "q1") return;

    selectedTrain = trains[index];

    if (!selectedTrain ||
        selectedTrain.from !== booking.from ||
        selectedTrain.to !== booking.to) {
        reject("Invalid train selection.", "searchMessage");
        return;
    }

    if (!transition("q2", "SELECT")) return;

    document.getElementById("trainSection")
        .classList.add("hidden");

    document.getElementById("passengerSection")
        .classList.remove("hidden");

    document.getElementById("passengerMessage").textContent =
        "Train selected successfully!";
}

// ==========================================
// 3. VALIDATE PASSENGER DETAILS
// ==========================================

document.getElementById("detailsBtn")
    .addEventListener("click", () => {

    if (currentState !== "q2") return;

    const name = document.getElementById("passengerName")
        .value.trim();

    const age = Number(document.getElementById("age").value);

    const gender = document.getElementById("gender").value;

    const seat = document.getElementById("seat").value;

    if (!/^[a-zA-Z ]{2,50}$/.test(name)) {
        reject("Enter a valid passenger name.",
            "passengerMessage");
        return;
    }

    if (!Number.isInteger(age) || age < 1 || age > 120) {
        reject("Enter a valid age.",
            "passengerMessage");
        return;
    }

    if (!gender) {
        reject("Please select gender.",
            "passengerMessage");
        return;
    }

    booking.passenger = name;
    booking.age = age;
    booking.gender = gender;
    booking.seat = seat;

    if (!transition("q3", "DETAILS")) return;

    document.getElementById("passengerSection")
        .classList.add("hidden");

    document.getElementById("paymentSection")
        .classList.remove("hidden");

    document.getElementById("summary").innerHTML = `
        Passenger: ${name}<br>
        Train: ${selectedTrain.name}<br>
        Route: ${booking.from} → ${booking.to}<br>
        Date: ${booking.date}<br>
        Seat Preference: ${seat}
    `;

    document.getElementById("totalFare").textContent =
        "Total Fare: ₹" + selectedTrain.fare;

});

// ==========================================
// 4. PAYMENT PROCESS
// ==========================================

document.getElementById("payBtn")
    .addEventListener("click", () => {

    if (currentState !== "q3") return;

    const method = document.getElementById("paymentMethod").value;

    booking.paymentMethod = method;

    // Simulated payment
    if (!transition("q4", "PAY")) return;

    document.getElementById("paymentMessage").textContent =
        "Payment successful using " + method + "!";

    // Continue to ticket confirmation
    if (!transition("q5", "CONFIRM")) return;

    booking.ticketId =
        "RG" + Date.now().toString().slice(-8);

    showTicket();

});

// ==========================================
// 5. GENERATE FINAL TICKET
// ==========================================

function showTicket() {

    document.getElementById("paymentSection")
        .classList.add("hidden");

    document.getElementById("ticketSection")
        .classList.remove("hidden");

    document.getElementById("ticketDetails").innerHTML = `
        <div class="ticket-details">
            <p><b>Ticket ID:</b> ${booking.ticketId}</p>
            <p><b>Passenger:</b> ${booking.passenger}</p>
            <p><b>Age:</b> ${booking.age}</p>
            <p><b>Gender:</b> ${booking.gender}</p>
            <p><b>From:</b> ${booking.from}</p>
            <p><b>To:</b> ${booking.to}</p>
            <p><b>Journey Date:</b> ${booking.date}</p>
            <p><b>Train:</b> ${selectedTrain.name}</p>
            <p><b>Train Number:</b> ${selectedTrain.number}</p>
            <p><b>Departure:</b> ${selectedTrain.departure}</p>
            <p><b>Arrival:</b> ${selectedTrain.arrival}</p>
            <p><b>Seat Preference:</b> ${booking.seat}</p>
            <p><b>Payment:</b> ${booking.paymentMethod}</p>
            <p><b>Amount:</b> ₹${selectedTrain.fare}</p>
            <p><b>Status:</b> Confirmed</p>
        </div>
    `;

    document.getElementById("ticketSection")
        .scrollIntoView({ behavior: "smooth" });
}

// ==========================================
// 6. RESET DFA
// ==========================================

document.getElementById("resetBtn")
    .addEventListener("click", () => {

    currentState = "q0";

    selectedTrain = null;
    booking = {};

    document.getElementById("from").value = "";
    document.getElementById("to").value = "";
    document.getElementById("journeyDate").value = "";

    document.getElementById("passengerName").value = "";
    document.getElementById("age").value = "";
    document.getElementById("gender").value = "";
    document.getElementById("seat").value = "Window";

    document.getElementById("searchMessage").textContent = "";
    document.getElementById("passengerMessage").textContent = "";
    document.getElementById("paymentMessage").textContent = "";

    document.getElementById("trainList").innerHTML = "";

    document.getElementById("trainSection")
        .classList.add("hidden");

    document.getElementById("passengerSection")
        .classList.add("hidden");

    document.getElementById("paymentSection")
        .classList.add("hidden");

    document.getElementById("ticketSection")
        .classList.add("hidden");

    updateDFA("Reset");

    document.getElementById("booking")
        .scrollIntoView({ behavior: "smooth" });
});

// Initial DFA display
updateDFA();