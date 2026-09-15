// import { createContext, useState, useEffect, useRef } from "react";

// export const AuthContext = createContext();

// const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // Fixed: 5 minutes timeout (300,000ms)

// export function AuthProvider({ children }) {
//   const [userData, setUserData] = useState(
//     JSON.parse(localStorage.getItem("userData")) || null
//   );

//   const [creditNotifications, setCreditNotifications] = useState(
//     JSON.parse(localStorage.getItem("creditNotifications")) || []
//   );

//   const idleTimerRef = useRef(null);

//   // Centralized logout procedure
//   const handleLogout = () => {
//     localStorage.clear();
//     sessionStorage.clear();
//     setUserData(null);
//     setCreditNotifications([]);
//     console.clear();
//     window.location.href = "/";
//   };

//   // Timestamp tracker for background tab throttle checks
//   const updateLastActivity = () => {
//     sessionStorage.setItem("lastActivityTime", Date.now().toString());
//   };

//   const checkInactivity = () => {
//     const lastActivity = sessionStorage.getItem("lastActivityTime");
//     if (lastActivity) {
//       const elapsed = Date.now() - parseInt(lastActivity, 10);
//       if (elapsed >= INACTIVITY_LIMIT_MS) {
//         handleLogout();
//         return true;
//       }
//     }
//     return false;
//   };

//   const resetIdleTimer = () => {
//     if (!userData) return;

//     if (checkInactivity()) return;

//     updateLastActivity();

//     if (idleTimerRef.current) {
//       clearTimeout(idleTimerRef.current);
//     }

//     idleTimerRef.current = setTimeout(() => {
//       checkInactivity();
//     }, INACTIVITY_LIMIT_MS);
//   };

//   // Check for localStorage modifications (e.g. DevTools deletion or multi-tab changes)
//   useEffect(() => {
//     if (!userData) return;

//     // Detect changes across separate browser tabs
//     const handleStorageChange = (e) => {
//       if (e.key === "userData" && !e.newValue) {
//         handleLogout();
//       }
//     };

//     // Poll storage to detect manual deletion in Chrome DevTools on the active tab
//     const intervalId = setInterval(() => {
//       const storedUserData = localStorage.getItem("userData");
//       if (!storedUserData) {
//         handleLogout();
//       }
//     }, 1000);

//     window.addEventListener("storage", handleStorageChange);

//     return () => {
//       window.removeEventListener("storage", handleStorageChange);
//       clearInterval(intervalId);
//     };
//   }, [userData]);

//   // Inactivity tracking logic
//   useEffect(() => {
//     if (!userData) return;

//     const activityEvents = [
//       "mousemove",
//       "keydown",
//       "click",
//       "scroll",
//       "touchstart",
//     ];

//     const handleUserActivity = () => {
//       resetIdleTimer();
//     };

//     const handleVisibilityChange = () => {
//       if (document.visibilityState === "visible") {
//         checkInactivity();
//       }
//     };

//     activityEvents.forEach((event) =>
//       window.addEventListener(event, handleUserActivity)
//     );
//     document.addEventListener("visibilitychange", handleVisibilityChange);

//     resetIdleTimer();

//     return () => {
//       if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
//       activityEvents.forEach((event) =>
//         window.removeEventListener(event, handleUserActivity)
//       );
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//     };
//   }, [userData]);

//   return (
//     <AuthContext.Provider
//       value={{
//         userData,
//         setUserData,
//         creditNotifications,
//         setCreditNotifications,
//         handleLogout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }
import { createContext, useState, useEffect, useRef } from "react";

export const AuthContext = createContext();

const INACTIVITY_LIMIT_MS = 5 * 60 * 1000;

export function AuthProvider({ children }) {
  // Use sessionStorage so tabs remain isolated and closing/opening a new tab forces re-login
  const [userData, setUserDataState] = useState(() => {
    const sessionData = sessionStorage.getItem("userData");
    return sessionData ? JSON.parse(sessionData) : null;
  });

  const [creditNotifications, setCreditNotifications] = useState(() => {
    const notifications = sessionStorage.getItem("creditNotifications");
    return notifications ? JSON.parse(notifications) : [];
  });

  const idleTimerRef = useRef(null);

  // Sync state changes directly to sessionStorage
  const setUserData = (data) => {
    if (data) {
      sessionStorage.setItem("userData", JSON.stringify(data));
    } else {
      sessionStorage.removeItem("userData");
    }
    setUserDataState(data);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUserDataState(null);
    setCreditNotifications([]);
    console.clear();
    window.location.href = "/";
  };

  const updateLastActivity = () => {
    sessionStorage.setItem("lastActivityTime", Date.now().toString());
  };

  const checkInactivity = () => {
    const lastActivity = sessionStorage.getItem("lastActivityTime");
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed >= INACTIVITY_LIMIT_MS) {
        handleLogout();
        return true;
      }
    }
    return false;
  };

  const resetIdleTimer = () => {
    if (!userData) return;

    if (checkInactivity()) return;

    updateLastActivity();

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      checkInactivity();
    }, INACTIVITY_LIMIT_MS);
  };

  // Dynamic Favicon Manager Effect
  useEffect(() => {
    const faviconUrl = userData?.faviconUrl;
    if (!faviconUrl) return;

    const updateFaviconDOM = () => {
      let iconLinks = document.querySelectorAll("link[rel*='icon']");

      if (iconLinks.length === 0) {
        const newLink = document.createElement("link");
        newLink.rel = "icon";
        newLink.href = faviconUrl;
        document.head.appendChild(newLink);
      } else {
        iconLinks.forEach((link) => {
          link.href = faviconUrl;
        });
      }
    };

    updateFaviconDOM();
  }, [userData?.faviconUrl]);

  useEffect(() => {
    if (!userData) return;

    const intervalId = setInterval(() => {
      const storedUserData = sessionStorage.getItem("userData");
      if (!storedUserData) {
        handleLogout();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [userData]);

  // Inactivity event listeners
  useEffect(() => {
    if (!userData) return;

    const activityEvents = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    const handleUserActivity = () => resetIdleTimer();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkInactivity();
      }
    };

    activityEvents.forEach((event) =>
      window.addEventListener(event, handleUserActivity)
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);

    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      activityEvents.forEach((event) =>
        window.removeEventListener(event, handleUserActivity)
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userData]);

  return (
    <AuthContext.Provider
      value={{
        userData,
        setUserData,
        creditNotifications,
        setCreditNotifications,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}