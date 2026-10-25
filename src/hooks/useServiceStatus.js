import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  checkService,
  fetchServerStatus,
  getStatusServices,
  STATUS,
  summarizeStatuses,
} from "../api/status";

export const STATUS_REFRESH_MS = 30_000;

const BACKEND_DEPENDENCIES = ["database", "redis"];
const DEPENDENT_SERVICES = ["api", "auth"];
const VISIBLE_SERVER_SERVICES = ["turn"];

export function useServiceStatus() {
  const services = useMemo(() => getStatusServices(), []);
  const [results, setResults] = useState({});
  const [serverServices, setServerServices] = useState([]);
  const [checkedAt, setCheckedAt] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const inFlight = useRef(false);

  const runChecks = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsChecking(true);

    const [clientResults, server] = await Promise.all([
      Promise.all(services.map((service) => checkService(service))),
      fetchServerStatus(),
    ]);

    setResults(
      Object.fromEntries(services.map((service, index) => [service.id, clientResults[index]]))
    );
    setServerServices(server || []);
    setCheckedAt(Date.now());

    inFlight.current = false;
    setIsChecking(false);
  }, [services]);

  useEffect(() => {
    runChecks();

    let intervalId = window.setInterval(runChecks, STATUS_REFRESH_MS);

    function onVisibilityChange() {
      window.clearInterval(intervalId);
      if (document.visibilityState === "visible") {
        runChecks();
        intervalId = window.setInterval(runChecks, STATUS_REFRESH_MS);
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [runChecks]);

  const rows = useMemo(() => {
    const backendBroken = serverServices.some(
      (item) => BACKEND_DEPENDENCIES.includes(item.id) && item.status === STATUS.down
    );

    const clientRows = services.map((service) => {
      let result = results[service.id] || { status: STATUS.pending };
      if (
        backendBroken &&
        DEPENDENT_SERVICES.includes(service.id) &&
        (result.status === STATUS.ok || result.status === STATUS.slow)
      ) {
        result = { ...result, status: STATUS.down, error: "unhealthy" };
      }
      return { id: service.id, group: service.group, result };
    });

    const serverRows = serverServices
      .filter((item) => VISIBLE_SERVER_SERVICES.includes(item.id))
      .map((item) => ({ id: item.id, group: "launcher", result: item }));

    const lastLauncherIndex = clientRows.findLastIndex((row) => row.group === "launcher");
    clientRows.splice(lastLauncherIndex + 1, 0, ...serverRows);
    return clientRows;
  }, [services, results, serverServices]);

  const overall = useMemo(
    () => summarizeStatuses(rows.map((row) => row.result.status)),
    [rows]
  );

  return { rows, overall, checkedAt, isChecking, refresh: runChecks };
}
