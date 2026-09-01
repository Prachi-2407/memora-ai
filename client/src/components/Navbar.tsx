import { useState } from "react";

export interface AppNotification {
  id: number;
  icon: string;
  title: string;
  message: string;
}

interface NavbarProps {
  user?: {
    name: string;
    email: string;
  } | null;
  notifications?: AppNotification[];
  onClearNotifications?: () => void;
}

function Navbar({
  user,
  notifications = [],
  onClearNotifications,
}: NavbarProps) {
  const [showSettings, setShowSettings] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("memoraai_dark_mode");
      if (saved !== null) {
        const isDark = JSON.parse(saved);
        if (isDark) {
          document.body.classList.add("dark-mode");
        }
        return isDark;
      }
      return false;
    } catch {
      return false;
    }
  });

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    document.body.classList.toggle("dark-mode", nextMode);
    try {
      localStorage.setItem("memoraai_dark_mode", JSON.stringify(nextMode));
    } catch {
      // localStorage is optional
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(
      (current) => !current
    );
  };

  const openNotifications = () => {
    setShowNotifications(
      (current) => !current
    );

    setShowSettings(false);
  };

  const openSettings = () => {
    setShowSettings(
      (current) => !current
    );

    setShowNotifications(false);
  };

  return (
    <header className="navbar">

      {/* LEFT */}

      <div className="navbar-left">

        <div className="mobile-logo">
          M
        </div>

        <div>
          <h1>MemoraAI</h1>

          <span>
            Knowledge, organized.
          </span>
        </div>

      </div>

      {/* RIGHT */}

      <div className="navbar-right">

        {/* Notifications */}

        <button
          className="navbar-icon-button notification-button"
          aria-label="Notifications"
          title="Notifications"
          onClick={openNotifications}
        >
          🔔

          {notificationsEnabled &&
            notifications.length > 0 && (
              <span className="notification-badge">
                {notifications.length}
              </span>
            )}
        </button>

        <div className="navbar-divider" />

        {/* Settings */}

        <button
          className="navbar-icon-button"
          aria-label="Settings"
          title="Settings"
          onClick={openSettings}
        >
          ⚙️
        </button>

        <div className="navbar-divider" />

        {/* User */}

        <div className="navbar-user">

          <div className="navbar-avatar">
            {user?.name?.trim()?.charAt(0)?.toUpperCase() || "P"}
          </div>

          <div className="navbar-user-info">

            <strong>
              {user?.name || "Prachi"}
            </strong>

            <span>
              {user?.email || "Personal"}
            </span>

          </div>

        </div>

      </div>

      {/* NOTIFICATIONS PANEL */}

      {showNotifications && (

        <div className="notifications-panel">

          <div className="notifications-header">

            <div>

              <h2>
                Notifications
              </h2>

              <p>
                Stay updated with MemoraAI.
              </p>

            </div>

            <button
              className="settings-close"
              onClick={() =>
                setShowNotifications(false)
              }
              aria-label="Close notifications"
            >
              ×
            </button>

          </div>

          {!notificationsEnabled ? (

            <div className="notifications-empty">

              <div>
                🔕
              </div>

              <h3>
                Notifications are off
              </h3>

              <p>
                Enable notifications in Settings.
              </p>

            </div>

          ) : notifications.length === 0 ? (

            <div className="notifications-empty">

              <div>
                🔕
              </div>

              <h3>
                You're all caught up!
              </h3>

              <p>
                No new notifications.
              </p>

            </div>

          ) : (

            <>

              <div className="notification-list">

                {notifications.map(
                  (notification) => (

                    <div
                      className="notification-item"
                      key={notification.id}
                    >

                      <div className="notification-icon">
                        {notification.icon}
                      </div>

                      <div className="notification-content">

                        <strong>
                          {notification.title}
                        </strong>

                        <p>
                          {notification.message}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

              <button
                className="mark-read-button"
                onClick={
                  onClearNotifications
                }
              >
                ✓ Mark all as read
              </button>

            </>

          )}

        </div>

      )}

      {/* SETTINGS PANEL */}

      {showSettings && (

        <div className="settings-panel">

          <div className="settings-header">

            <div>

              <h2>
                Settings
              </h2>

              <p>
                Customize your MemoraAI experience.
              </p>

            </div>

            <button
              className="settings-close"
              onClick={() =>
                setShowSettings(false)
              }
              aria-label="Close settings"
            >
              ×
            </button>

          </div>

          {/* Appearance */}

          <div className="settings-section">

            <h3>
              Appearance
            </h3>

            <div className="settings-row">

              <div>

                <strong>
                  Dark Mode
                </strong>

                <p>
                  Use a darker appearance.
                </p>

              </div>

              <button
                className={`settings-toggle ${
                  darkMode
                    ? "active"
                    : ""
                }`}
                onClick={
                  toggleDarkMode
                }
              >
                {darkMode
                  ? "ON"
                  : "OFF"}
              </button>

            </div>

          </div>

          {/* Notifications */}

          <div className="settings-section">

            <h3>
              Notifications
            </h3>

            <div className="settings-row">

              <div>

                <strong>
                  Notifications
                </strong>

                <p>
                  Allow MemoraAI notifications.
                </p>

              </div>

              <button
                className={`settings-toggle ${
                  notificationsEnabled
                    ? "active"
                    : ""
                }`}
                onClick={
                  toggleNotifications
                }
              >
                {notificationsEnabled
                  ? "ON"
                  : "OFF"}
              </button>

            </div>

          </div>

          {/* About */}

          <div className="settings-section">

            <h3>
              About
            </h3>

            <div className="settings-about">

              <strong>
                MemoraAI
              </strong>

              <span>
                Your personal AI-powered
                knowledge assistant.
              </span>

              <small>
                Version 1.0.0
              </small>

            </div>

          </div>

        </div>

      )}

    </header>
  );
}

export default Navbar;