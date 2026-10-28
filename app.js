(function() {
    var params = new URLSearchParams(window.location.search);
    var fragmentParams = new URLSearchParams(window.location.hash.slice(1));

    function firstParam(names) {
        for (var index = 0; index < names.length; index++) {
            var value = fragmentParams.get(names[index]) || params.get(names[index]);
            if (value) { return value.trim(); }
        }
        return "";
    }

    function setText(id, value) {
        document.getElementById(id).textContent = value || "Not provided";
    }

    function parseDuration(value, unitValue) {
        var match = String(value || "").trim().match(/^([\d.]+)\s*([a-z]+)?$/i);
        if (!match || !isFinite(Number(match[1])) || Number(match[1]) <= 0) { return null; }
        var unit = String(unitValue || match[2] || "hours").toLowerCase();
        var units = {
            h: "hours", hr: "hours", hrs: "hours", hour: "hours", hours: "hours",
            d: "days", day: "days", days: "days",
            w: "weeks", wk: "weeks", week: "weeks", weeks: "weeks",
            mo: "months", month: "months", months: "months",
            y: "years", yr: "years", year: "years", years: "years"
        };
        unit = units[unit] || "";
        return unit ? { amount: Number(match[1]), unit: unit } : null;
    }

    function addDuration(date, duration) {
        var result = new Date(date.getTime());
        if (duration.unit === "hours") { result.setHours(result.getHours() + duration.amount); }
        else if (duration.unit === "days") { result.setDate(result.getDate() + duration.amount); }
        else if (duration.unit === "weeks") { result.setDate(result.getDate() + duration.amount * 7); }
        else if (duration.unit === "months") { result.setMonth(result.getMonth() + duration.amount); }
        else if (duration.unit === "years") { result.setFullYear(result.getFullYear() + duration.amount); }
        return result;
    }

    function formatDuration(seconds) {
        seconds = Math.max(0, Math.floor(seconds));
        var days = Math.floor(seconds / 86400);
        var hours = Math.floor((seconds % 86400) / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var remainingSeconds = seconds % 60;
        var parts = [];
        if (days) { parts.push(days + "d"); }
        if (hours || days) { parts.push(hours + "h"); }
        if (minutes || hours || days) { parts.push(minutes + "m"); }
        parts.push(remainingSeconds + "s");
        return parts.join(" ");
    }

    setText("voucher-code", firstParam(["voucherCode", "voucher", "code"]));
    setText("mac-address", firstParam(["clientMac", "mac", "macAddress"]));
    setText("ip-address", firstParam(["clientIp", "clientIP", "ipAddress", "ip"]));

    var startedAtValue = firstParam(["startedAt", "startTime", "sessionStart"]);
    var expiresAtValue = firstParam(["expiresAt", "expiryTime", "expirationTime"]);
    var remainingValue = firstParam(["remainingSeconds", "timeRemainingSeconds"]);
    var duration = parseDuration(firstParam(["duration", "validity", "timeLimit"]), firstParam(["durationUnit", "unit"]));
    var startedAt = startedAtValue ? new Date(startedAtValue) : null;
    var expiresAt = expiresAtValue ? new Date(expiresAtValue) : null;
    var initialRemaining = remainingValue !== "" && isFinite(Number(remainingValue)) ? Math.max(0, Number(remainingValue)) : null;
    var remainingReceivedAt = initialRemaining !== null ? Date.now() : null;

    if (startedAt && isNaN(startedAt.getTime())) { startedAt = null; }
    if (expiresAt && isNaN(expiresAt.getTime())) { expiresAt = null; }
    if (!expiresAt && startedAt && duration) { expiresAt = addDuration(startedAt, duration); }
    if (!duration && startedAt && expiresAt && expiresAt > startedAt) {
        duration = { amount: Math.round((expiresAt - startedAt) / 3600000 * 100) / 100, unit: "hours" };
    }

    var durationLabel = duration ? duration.amount + " " + duration.unit.replace(/s$/, "") + (duration.amount === 1 ? "" : "s") : "Duration unavailable";
    setText("session-duration", durationLabel);

    var timeUsed = document.getElementById("time-used");
    var timeRemaining = document.getElementById("time-remaining");
    var progress = document.querySelector(".progress-track");
    var progressFill = document.getElementById("progress-fill");

    if (startedAt || initialRemaining !== null || expiresAt) {
        function updateTimers() {
            var now = Date.now();
            var remaining = expiresAt ? Math.max(0, (expiresAt.getTime() - now) / 1000) : initialRemaining !== null ? Math.max(0, initialRemaining - (now - remainingReceivedAt) / 1000) : null;
            var used = startedAt ? Math.max(0, (now - startedAt.getTime()) / 1000) : null;

            if (used === null && duration && remaining !== null) {
                var totals = { hours: 3600, days: 86400, weeks: 604800, months: 2592000, years: 31536000 };
                var totalSeconds = startedAt && expiresAt ? (expiresAt - startedAt) / 1000 : duration.amount * totals[duration.unit];
                used = Math.max(0, totalSeconds - remaining);
            }
            timeUsed.textContent = used === null ? "Not provided" : formatDuration(used);
            timeRemaining.textContent = remaining === null ? "Not provided" : remaining === 0 ? "Expired" : formatDuration(remaining);

            if (used !== null && remaining !== null && used + remaining > 0) {
                var percentage = Math.min(100, Math.max(0, used / (used + remaining) * 100));
                progressFill.style.width = percentage + "%";
                progress.setAttribute("aria-valuenow", String(Math.round(percentage)));
            }
        }
        updateTimers();
        window.setInterval(updateTimers, 1000);
    }
})();