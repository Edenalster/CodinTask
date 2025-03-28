import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import Lobby from "./pages/Lobby";
import CodeBlock from "./pages/CodeBlockPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <nav className="navbar">
          <GraduationCap className="navbar-icon" />
          <span className="navbar-title">Tom's Coding Platform</span>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Lobby />} />
            <Route path="/block/:id" element={<CodeBlock />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
