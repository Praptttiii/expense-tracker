import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        base: "/expense-tracker/",
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
});
