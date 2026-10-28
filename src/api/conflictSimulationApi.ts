import { jsonBody, requestJson } from "./http";
export interface ConflictSimulation {
  armed: boolean;
}
const endpoint = "/api/demo/conflict";
export const conflictSimulationApi = {
  get: () => requestJson<ConflictSimulation>(endpoint),
  set: (armed: boolean) =>
    requestJson<ConflictSimulation>(endpoint, {
      method: "PUT",
      body: jsonBody({ armed }),
    }),
};
