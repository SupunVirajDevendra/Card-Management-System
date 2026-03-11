import { createBrowserRouter, redirect } from "react-router-dom";
import App from "./App";
import Dashboard from "../pages/Dashboard";
import CardsPage from "../pages/CardsPage";
import CardFormPage from "../pages/CardFormPage";
import CreateRequestPage from "../pages/CreateRequestPage";
import RequestsPage from "../pages/RequestsPage";
import LoginPage from "../pages/LoginPage";
import CardReportPage from "../pages/CardReportPage";
import RequestReportPage from "../pages/RequestReportPage";
import { isAuthenticated } from "../services/authService";

const protectedLoader = () => {
    if (!isAuthenticated()) {
        throw redirect("/login");
    }
    return null;
};

const publicOnlyLoader = () => {
    if (isAuthenticated()) {
        throw redirect("/");
    }
    return null;
};

const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />,
        loader: publicOnlyLoader,
    },
    {
        path: "/",
        element: <App />,
        loader: protectedLoader,
        children: [
            { index: true, element: <Dashboard /> },
            { path: "cards", element: <CardsPage /> },
            { path: "cards/new", element: <CardFormPage /> },
            { path: "cards/:id", element: <CardFormPage /> },
            { path: "activate", element: <CreateRequestPage /> },
            { path: "requests", element: <RequestsPage /> },
            { path: "reports/cards", element: <CardReportPage /> },
            { path: "reports/requests", element: <RequestReportPage /> },
        ],
    },
]);

export default router;
