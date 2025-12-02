// ----------------------
// Game State
// ----------------------
let pet_info = {
    name: "Fluffy",
    weight: 5,
    happiness: 50,
    food: 60,
    stamina: 100
};

let isSleeping = false;
let sleepIntervalId = null;
let sleepEndsAt = null;
let zzzInterval = null;
let currentShape = "pentagon"; // "pentagon" | "square" | "triangle"

// ----------------------
// UI Updates
// ----------------------
function updateStats() {
    $("#pet-name").text(pet_info.name);
    $("#pet-weight").text(pet_info.weight);
    $("#pet-happiness").text(pet_info.happiness);
    $("#pet-food").text(pet_info.food);
    $("#pet-stamina").text(pet_info.stamina);
    updateAppearance();
    updateStatusMessage();
}

function clampStats() {
    if (pet_info.happiness > 100) pet_info.happiness = 100;
    if (pet_info.happiness < 0) pet_info.happiness = 0;
    if (pet_info.weight < 1) pet_info.weight = 1;
    if (pet_info.food > 100) pet_info.food = 100;
    if (pet_info.food < 0) pet_info.food = 0;
    if (pet_info.stamina > 100) pet_info.stamina = 100;
    if (pet_info.stamina < 0) pet_info.stamina = 0;
}

function updateAppearance() {
    let color = "#ffcc00";
    let size = 100;

    // Happiness → color
    if (pet_info.happiness <= 35) {
        color = "#ff4d4d"; // red
    } else if (pet_info.happiness <= 65) {
        color = "#ffcc00"; // yellow
    } else {
        color = "#4CAF50"; // green
    }

    // Weight → size (0–5 small, 5–10 medium, 10+ big)
    if (pet_info.weight <= 5) {
        size = 70;
    } else if (pet_info.weight <= 10) {
        size = 100;
    } else {
        size = 130;
    }

    // .css(): apply background color and size to pet
    $("#pet").css({
        "background-color": color,   // set color based on happiness
        "width": size + "px",        // set width based on weight
        "height": size + "px"        // set height based on weight
    });
}

function updateStatusMessage() {
    if (isSleeping) {
        const remainingMs = Math.max(0, sleepEndsAt - Date.now());
        const mm = String(Math.floor(remainingMs / 60000)).padStart(2, "0");
        const ss = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, "0");
        $("#status").text("Sleeping... " + mm + ":" + ss);
    } else {
        if (pet_info.stamina <= 20) {
            $("#status").text("I’m tired... need rest soon.");
        } else if (pet_info.food <= 20) {
            $("#status").text("I’m hungry!");
        } else if (pet_info.happiness >= 70) {
            $("#status").text("I’m feeling great!");
        } else {
            $("#status").text("");
        }
    }
}

function setButtonsEnabled(enabled) {
    $("#actions button").not("#new-game-btn").prop("disabled", !enabled);
}

// ----------------------
// ZZZ Effect
// ----------------------
function createZzz() {
    const z = $("<div class='zzz'>Z</div>");
    const randomX = Math.random() * 40 - 20;
    // .css(): floating "Z" effect
    z.css({
        left: 50 + randomX + "%",    // horizontal offset
        top: "0px"                   // start at top of container
    });
    $("#zzz-container").append(z);
    setTimeout(() => z.remove(), 2000);
}

function startZzzEffect() {
    if (zzzInterval) clearInterval(zzzInterval);
    zzzInterval = setInterval(createZzz, 600);
}

function stopZzzEffect() {
    clearInterval(zzzInterval);
    zzzInterval = null;
    $("#zzz-container").empty();
}

// ----------------------
// Sleep Logic (1 minute)
// ----------------------
function startSleep(durationMs = 60000) {
    if (isSleeping) return;
    isSleeping = true;
    sleepEndsAt = Date.now() + durationMs;
    $("#pet").addClass("asleep");
    setButtonsEnabled(false);
    startZzzEffect();

    sleepIntervalId = setInterval(function() {
        updateStatusMessage();
        if (Date.now() >= sleepEndsAt) {
            wakeUp();
        }
    }, 250);

    updateStatusMessage();
}

function wakeUp() {
    if (!isSleeping) return;
    isSleeping = false;
    clearInterval(sleepIntervalId);
    sleepIntervalId = null;
    sleepEndsAt = null;
    stopZzzEffect();
    pet_info.stamina = Math.max(pet_info.stamina, 50);
    $("#pet").removeClass("asleep");
    setButtonsEnabled(true);
    updateStats();
    $("#status").text("Awake!");
    setTimeout(() => updateStatusMessage(), 1500);
}

// ----------------------
// Stop Everything (for New Game)
// ----------------------
function stopAllBackgroundEffects() {
    isSleeping = false;
    if (sleepIntervalId) {
        clearInterval(sleepIntervalId);
        sleepIntervalId = null;
    }
    if (zzzInterval) {
        clearInterval(zzzInterval);
        zzzInterval = null;
    }
    sleepEndsAt = null;
    $("#pet").removeClass("asleep");
    $("#zzz-container").empty();
}

// ----------------------
// Shape Handling
// ----------------------
function setShape(shape) {
    currentShape = shape;
    $("#pet").removeClass("pentagon square triangle").addClass(shape);
}

// ----------------------
// New Game / Reset
// ----------------------
function initGame(petName, shape) {
    stopAllBackgroundEffects();

    // Reset stats
    pet_info = {
        name: petName || "Fluffy",
        weight: 5,
        happiness: 50,
        food: 60,
        stamina: 100
    };

    // Apply shape
    setShape(shape || "circle");

    // Enable UI and refresh
    setButtonsEnabled(true);
    updateStats();
    $("#status").text("");
}

// ----------------------
// Core Action Logic
// ----------------------
function applyActionAndMaybeSleep() {
    clampStats();
    updateStats();
    if (pet_info.stamina <= 0) {
        pet_info.stamina = 0;
        updateStats();
        startSleep(5000);
    }
}

// ----------------------
// Actions + Setup
// ----------------------
$(document).ready(function() {
    setButtonsEnabled(false);
    updateStats();

    // Start Game button
    $("#start-btn").click(function() {
        const name = $("#pet-name-input").val().trim() || "Fluffy";
        const shape = $("#pet-shape-select").val();
        initGame(name, shape);
        $("#setup").addClass("hidden");
    });

    // New Game button
    $("#new-game-btn").click(function() {
        stopAllBackgroundEffects();
        $("#setup").removeClass("hidden");
        setButtonsEnabled(false);
    });

    // Treat
    $("#treat-btn").click(function() {
        if (isSleeping) return;
        pet_info.happiness += 5;
        pet_info.weight += 2;
        pet_info.food += 3;
        pet_info.stamina += 5;
        applyActionAndMaybeSleep();

        // .css(): start a quick "bounce"
        // .delay() + .queue(): wait 200ms, then run a queued step that scales back down
        $("#pet")
            .css("transform", "scale(1.1)")     // grow a bit
            .delay(200)                          // pause 200ms
            .queue(function(next) {              // queued step after delay
                $(this).css("transform", "scale(1)"); // return to normal size
                next();                           // continue the queue
            });
    });

    // Feed
    $("#feed-btn").click(function() {
        if (isSleeping) return;
        pet_info.happiness += 2;
        pet_info.weight += 1;
        pet_info.food += 5;
        pet_info.stamina += 10;
        applyActionAndMaybeSleep();

        // .css(): scale up a bit more
        // .delay() + .queue(): revert back after 200ms
        $("#pet")
            .css("transform", "scale(1.15)")    // grow slightly more
            .delay(200)                          // pause 200ms
            .queue(function(next) {              // queued step after delay
                $(this).css("transform", "scale(1)"); // back to normal size
                next();                           // continue the queue
            });
    });

    // Exercise
    $("#exercise-btn").click(function() {
        if (isSleeping) return;
        pet_info.happiness -= 10;
        pet_info.weight -= 2;
        pet_info.food -= 10;
        pet_info.stamina -= 20;
        applyActionAndMaybeSleep();

        // .css(): quick shrink
        // .delay() + .queue(): revert after 200ms
        $("#pet")
            .css("transform", "scale(0.9)")     // shrink a bit
            .delay(200)                          // pause 200ms
            .queue(function(next) {              // queued step after delay
                $(this).css("transform", "scale(1)"); // back to normal size
                next();                           // continue the queue
            });
    });

    // Play
    $("#play-btn").click(function() {
        if (isSleeping) return;
        pet_info.happiness += 4;
        pet_info.weight -= 1;
        pet_info.food -= 5;
        pet_info.stamina -= 10;
        applyActionAndMaybeSleep();

        // .css(): rotate a bit
        // .delay() + .queue(): rotate back after 200ms
        $("#pet")
            .css("transform", "rotate(20deg)")  // tilt to the side
            .delay(200)                          // pause 200ms
            .queue(function(next) {              // queued step after delay
                $(this).css("transform", "rotate(0deg)"); // straighten back
                next();                           // continue the queue
            });
    });
});
