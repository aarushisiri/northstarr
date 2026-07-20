import { useState } from "react";
import Sidebar from "./components/Sidebar";
import MobileNav from "./components/MobileNav";
import Home from "./pages/Home";
import Timeline from "./pages/Timeline";
import Systems from "./pages/Systems";
import Journal from "./pages/Journal";
import Review from "./pages/Review";
import Import from "./pages/Import";
import { useNorthstarStore } from "./store/useNorthstarStore";
import { applySideways } from "./utils/recovery";

export default function App() {
  const { state, update, loaded } = useNorthstarStore();
  const [active, setActive] = useState("home");

  const handleImport = (data) => {
    update((prev) => ({ ...prev, ...data, sideways: false }));
    setActive("home");
  };

  const handleSideways = () => {
    update((prev) => applySideways(prev));
  };

  if (!loaded) {
    return (
      <div className="ns-root ns-loading">
        <div className="ns-loading-text">Loading Northstar…</div>
      </div>
    );
  }

  return (
    <div className="ns-root">
      <Sidebar active={active} setActive={setActive} onSideways={handleSideways} sideways={state.sideways} />
      <main className="ns-main">
        {active === "home" && <Home state={state} update={update} />}
        {active === "timeline" && <Timeline state={state} update={update} />}
        {active === "systems" && <Systems state={state} />}
        {active === "journal" && <Journal state={state} update={update} />}
        {active === "review" && <Review state={state} />}
        {active === "import" && <Import onImport={handleImport} />}
      </main>
      <MobileNav active={active} setActive={setActive} />
    </div>
  );
}
