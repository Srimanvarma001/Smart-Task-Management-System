import { axiosClient } from "./axiosClient";

export const aiApi = {
  parse: async (text: string) => {
    const { data } = await axiosClient.post("/ai/parse", { text });
    return data;
  },
  summary: async () => {
    const { data } = await axiosClient.get("/ai/summary");
    return data;
  },
  suggestions: async () => {
    const { data } = await axiosClient.get("/ai/suggestions");
    return data;
  },
};