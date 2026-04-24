import {BrowserRouter as Router} from "react-router-dom";
import {ScrollToTop} from "./components/common/ScrollToTop";
import Route from "./route";
import {ToastProvider} from "./context/ToastProvider.tsx";

export default function App() {
    return (
        <>
            <Router>
                <ToastProvider/>
                <ScrollToTop/>
                <Route/>
            </Router>
        </>
    );
}
