
"use client";

import { useEffect } from "react";

const LAST_VISIT_KEY = "app_last_visit_date";

const keysToReset = [
    "app_tours",
    "app_reservations",
    "app_passengers",
    "app_employees",
    "app_ex_employees",
    "app_sellers",
    "app_custom_expenses",
    "app_external_commissions",
    "app_excursion_incomes",
    "app_report_history",
    "app_calendar_history",
    "calendarBubblesApp",
    "app_reservation_counters"
];

export const useDailyReset = () => {
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);

    if (lastVisit !== today) {
      // It's a new day, so reset the data
      console.log("New day detected. Resetting demo data...");
      
      keysToReset.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Update the last visit date
      localStorage.setItem(LAST_VISIT_KEY, today);

      // Optional: Force a page reload to ensure all components re-initialize with mock data
      window.location.reload();
    }
  }, []);
};
