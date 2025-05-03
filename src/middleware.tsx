import { Navigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { healthCheck } from "./services/auth";
import LoadingIndicator from "./components/loadingIndicator.tsx";

const Middleware: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [redirectPath, setRedirectPath] = useState<string | null>(null);
    const authToken = localStorage.getItem('authToken');
    const location = useLocation();

    useEffect(() => {
        const checkServerAndAuth = async () => {
            try {
                // Check server connectivity
                await healthCheck();

                // If authToken exists, validate it
                if (authToken) {
                    const response = await healthCheck(authToken);
                    if (response.status === 401) {
                        localStorage.removeItem('authToken');
                        setRedirectPath('/login');
                        return;
                    }
                    // Stay on the current page if authenticated, except for login/signup
                    if (location.pathname === '/login' || location.pathname === '/signup') {
                        setRedirectPath('/home'); // Default authenticated page
                    } else {
                        setRedirectPath(null); // Stay on the current page
                    }
                } else if (location.pathname === '/login' || location.pathname === '/signup') {
                    setIsLoading(false); // Allow access to login/signup
                } else {
                    setRedirectPath('/login');
                }
            } catch (error) {
                console.error("Health check failed:", error);
                setRedirectPath('/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkServerAndAuth();
    }, [authToken, location.pathname]);

    if (isLoading) {
        return <LoadingIndicator title="Loading..." message="Please wait while we verify your session." />;
    }

    if (redirectPath && redirectPath !== location.pathname) {
        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
};

export default Middleware;