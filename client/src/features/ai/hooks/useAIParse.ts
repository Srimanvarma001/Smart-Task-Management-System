import { useMutation } from "@tanstack/react-query";
import { aiApi } from "../../../api/aiApi";

export function useAIParse() {
  return useMutation({
    mutationFn: (text: string) => aiApi.parse(text),
  });
}