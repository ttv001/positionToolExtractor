chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "scrapePositionData") {
    try {
      console.log("Scraping TradingView DOM for position popup...");

      const positionPopup = document.querySelector(
        'div[data-dialog-name="Short Position"], div[data-dialog-name="Long Position"]'
      );

      if (!positionPopup) {
        console.log("No position popup found with data-dialog-name='Short Position' or 'Long Position'.");
        sendResponse({ success: false, error: "No position popup found. Please open the Long/Short Position tool." });
        return true;
      }

      const dialogName = positionPopup.getAttribute("data-dialog-name");
      const type = dialogName === "Long Position" ? "Long" : "Short";
      const prefix = type === "Long" ? "Risk/Rewardlong" : "Risk/Rewardshort";
      console.log("Position type detected:", type, "Prefix:", prefix);

      const accountSize = positionPopup.querySelector(`[data-name="${prefix}AccountSize"]`)?.value || "N/A";
      const lotSize = positionPopup.querySelector(`[data-name="${prefix}LotSize"]`)?.value || "N/A";
      const riskValue = positionPopup.querySelector(`[data-name="${prefix}Risk"]`)?.value || "N/A";
      
      const riskUnitDropdown = positionPopup.querySelector(`#id_${prefix.replace(/\//g, '\\/')}Risk_unit-options-dropdown`);
      const riskUnit = riskUnitDropdown?.querySelector('span > span')?.innerText || "N/A";

      const entryPrice = positionPopup.querySelector(`[data-name="${prefix}EntryPrice"]`)?.value || "N/A";
      const profitLevelTicks = positionPopup.querySelector(`[data-name="${prefix}ProfitLevelTicks"]`)?.value || "N/A";
      const profitLevelPrice = positionPopup.querySelector(`[data-name="${prefix}ProfitLevelPrice"]`)?.value || "N/A";
      const stopLevelTicks = positionPopup.querySelector(`[data-name="${prefix}StopLevelTicks"]`)?.value || "N/A";
      const stopLevelPrice = positionPopup.querySelector(`[data-name="${prefix}StopLevelPrice"]`)?.value || "N/A";

      const risk = `${riskValue} ${riskUnit}`;

      const positionData = {
        type,
        accountSize,
        lotSize,
        risk,
        entryPrice,
        profitLevelTicks,
        profitLevelPrice,
        stopLevelTicks,
        stopLevelPrice
      };

      console.log("Extracted position data:", positionData);

      if (entryPrice !== "N/A" || profitLevelPrice !== "N/A" || stopLevelPrice !== "N/A") {
        sendResponse({ success: true, data: positionData });
      } else {
        console.log("No meaningful data extracted from popup.");
        sendResponse({ success: false, error: "No position data found in popup." });
      }
    } catch (error) {
      console.error("Error scraping data:", error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true;
});
