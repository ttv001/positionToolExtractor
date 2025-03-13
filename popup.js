document.getElementById("saveButton").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    console.log("Popup: Sending scrape request to content script...");
    document.getElementById("status").innerText = "Fetching data...";
    document.getElementById("error").innerText = "";
    document.getElementById("dataDisplay").innerText = "";

    chrome.tabs.sendMessage(tab.id, { action: "scrapePositionData" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Popup: Error from content script:", chrome.runtime.lastError.message);
        document.getElementById("error").innerText = "Error contacting page.";
        document.getElementById("status").innerText = "";
        return;
      }
      if (response.success) {
        console.log("Popup: Received data from content script:", response.data);
        document.getElementById("status").innerText = "Data fetched and copied to clipboard!";
        document.getElementById("error").innerText = "";

        const data = response.data;
        const headers = ["Type", "AccountSize", "LotSize", "Risk", "EntryPrice", "ProfitLevelTicks", "ProfitLevelPrice", "StopLevelTicks", "StopLevelPrice"];
        const values = [
          data.type,
          data.accountSize,
          data.lotSize,
          data.risk,
          data.entryPrice,
          data.profitLevelTicks,
          data.profitLevelPrice,
          data.stopLevelTicks,
          data.stopLevelPrice
        ];

        const escapeCsvValue = (value) => {
          if (value === null || value === undefined) return '""';
          const str = String(value);
          if (str.includes('"') || str.includes(',') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return `"${str}"`;
        };

        const formattedData = [
          headers.map(escapeCsvValue).join(","),
          values.map(escapeCsvValue).join(",")
        ].join("\n");

        document.getElementById("dataDisplay").innerText = formattedData;

        navigator.clipboard.writeText(formattedData)
          .then(() => {
            console.log("Popup: CSV data successfully copied to clipboard!");
          })
          .catch((err) => {
            console.error("Popup: Failed to copy CSV data to clipboard:", err);
            document.getElementById("error").innerText = "Failed to copy to clipboard.";
            document.getElementById("status").innerText = "Data fetched but not copied.";
          });
      } else {
        console.log("Popup: Error from content script:", response.error);
        document.getElementById("error").innerText = response.error || "No position data found.";
        document.getElementById("status").innerText = "";
      }
    });
  });
});