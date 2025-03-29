// src/store/useCodeStore.ts
import { create } from "zustand";

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
      const res = await fetch(
        "https://codintask-production.up.railway.app/api/codeblocks"
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        set({ codeBlocks: data });
      } else {
        console.error("Invalid data:", data);
      }
    } catch (error) {
      console.error("Error fetching code blocks:", error);
    }
  },
  setCodeBlocks: (blocks: CodeBlock[]) => set({ codeBlocks: blocks }),
}));
