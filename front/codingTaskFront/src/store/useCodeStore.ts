import { create } from "zustand";
import API from "../api/axios";

interface CodeBlock {
  id: string;
  title: string;
  code: string;
}

interface CodeStore {
  codeBlocks: CodeBlock[];
  fetchCodeBlocks: () => void;
  setCodeBlocks: (blocks: CodeBlock[]) => void;
}

export const useCodeStore = create<CodeStore>((set) => ({
  codeBlocks: [],
  fetchCodeBlocks: async () => {
    try {
      const response = await API.get("/api/codeblocks");
      if (Array.isArray(response.data)) {
        set({ codeBlocks: response.data });
      } else {
        console.error("Invalid response data:", response.data);
      }
    } catch (error) {
      console.error("Error fetching code blocks:", error);
    }
  },
  setCodeBlocks: (blocks: CodeBlock[]) => set({ codeBlocks: blocks }),
}));
