import { create } from "zustand";

type BusinessContext = {
  companyName: string;
  overview: string;
  positioning?: string;
  market?: string;
  voice?: string;
  // add anything else you want always sent to the model
};

type Store = {
  context: BusinessContext | null;
  setContext: (ctx: BusinessContext) => void;
};

export const useBusinessContext = create<Store>((set) => ({
  context: null,
  setContext: (ctx) => set({ context: ctx }),
}));

// Example bootstrapping somewhere at app startup:
// useBusinessContext.getState().setContext({
//   companyName: "Aurora Foods Inc.",
//   overview:
//     "Portland-based distributor connecting small farms and makers to local customers, stores, and restaurants. Est. 2018.",
//   positioning: "Fresh, fairly sourced, local-first.",
//   market: "Pacific Northwest; expansion planned.",
//   voice: "Professional, concise, direct."
// });

export type { BusinessContext };
