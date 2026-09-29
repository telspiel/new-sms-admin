// import { createContext, useState, useEffect, useRef } from "react";

// export const AuthContext = createContext();

// const INACTIVITY_LIMIT_MS = 5 * 60 * 1000;

// export function AuthProvider({ children }) {
//   // Use sessionStorage so tabs remain isolated and closing/opening a new tab forces re-login
//   const [userData, setUserDataState] = useState(() => {
//     const sessionData = sessionStorage.getItem("userData");
//     return sessionData ? JSON.parse(sessionData) : null;
//   });

//   const [creditNotifications, setCreditNotifications] = useState(() => {
//     const notifications = sessionStorage.getItem("creditNotifications");
//     return notifications ? JSON.parse(notifications) : [];
//   });

//   const idleTimerRef = useRef(null);

//   // Sync state changes directly to sessionStorage
//   const setUserData = (data) => {
//     if (data) {
//       sessionStorage.setItem("userData", JSON.stringify(data));
//     } else {
//       sessionStorage.removeItem("userData");
//     }
//     setUserDataState(data);
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     sessionStorage.clear();
//     setUserDataState(null);
//     setCreditNotifications([]);
//     console.clear();
//     window.location.href = "/";
//   };

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

//   // Dynamic Favicon Manager Effect
//   useEffect(() => {
//     const faviconUrl = userData?.faviconUrl;
//     if (!faviconUrl) return;

//     const updateFaviconDOM = () => {
//       let iconLinks = document.querySelectorAll("link[rel*='icon']");

//       if (iconLinks.length === 0) {
//         const newLink = document.createElement("link");
//         newLink.rel = "icon";
//         newLink.href = faviconUrl;
//         document.head.appendChild(newLink);
//       } else {
//         iconLinks.forEach((link) => {
//           link.href = faviconUrl;
//         });
//       }
//     };

//     updateFaviconDOM();
//   }, [userData?.faviconUrl]);

//   useEffect(() => {
//     if (!userData) return;

//     const intervalId = setInterval(() => {
//       const storedUserData = sessionStorage.getItem("userData");
//       if (!storedUserData) {
//         handleLogout();
//       }
//     }, 1000);

//     return () => clearInterval(intervalId);
//   }, [userData]);

//   // Inactivity event listeners
//   useEffect(() => {
//     if (!userData) return;

//     const activityEvents = [
//       "mousemove",
//       "keydown",
//       "click",
//       "scroll",
//       "touchstart",
//     ];

//     const handleUserActivity = () => resetIdleTimer();

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
  const [userData, setUserDataState] = useState(() => {
    const sessionData = sessionStorage.getItem("userData") || localStorage.getItem("userData");
    return sessionData ? JSON.parse(sessionData) : null;
  });

  const [creditNotifications, setCreditNotifications] = useState(() => {
    const notifications = sessionStorage.getItem("creditNotifications") || localStorage.getItem("creditNotifications");
    return notifications ? JSON.parse(notifications) : [];
  });

  const idleTimerRef = useRef(null);
  // Controller ref to abort pending fetch requests on logout
  const abortControllerRef = useRef(new AbortController());

  // Function to return an active signal for custom fetch calls
  const getAbortSignal = () => abortControllerRef.current.signal;

  const setUserData = (data) => {
    if (data) {
      sessionStorage.setItem("userData", JSON.stringify(data));
      localStorage.setItem("userData", JSON.stringify(data));
    } else {
      sessionStorage.removeItem("userData");
      localStorage.removeItem("userData");
    }
    setUserDataState(data);
  };

  const handleLogout = () => {
    // 1. Abort all pending network API requests tied to this signal
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      // Re-initialize a new AbortController for future sessions
      abortControllerRef.current = new AbortController();
    }

    // 2. Clear browser storage
    localStorage.clear();
    sessionStorage.clear();

    // 3. Reset React State
    setUserDataState(null);
    setCreditNotifications([]);
    console.clear();

    // 4. Redirect to login page
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

  // Monitor storage changes (both cross-tab via 'storage' event and DevTools via 1-second polling)
  useEffect(() => {
    if (!userData) return;

    // Polling check for local DevTools clears
    const storageCheckInterval = setInterval(() => {
      const storedLocalData = localStorage.getItem("userData");
      const storedSessionData = sessionStorage.getItem("userData");

      if (!storedLocalData || !storedSessionData) {
        handleLogout();
      }
    }, 1000);

    // Event listener for cross-tab storage clears
    const handleStorageEvent = (event) => {
      if (
        (event.key === "userData" && !event.newValue) ||
        event.key === null // Triggered on localStorage.clear()
      ) {
        handleLogout();
      }
    };

    window.addEventListener("storage", handleStorageEvent);

    return () => {
      clearInterval(storageCheckInterval);
      window.removeEventListener("storage", handleStorageEvent);
    };
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
        getAbortSignal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}