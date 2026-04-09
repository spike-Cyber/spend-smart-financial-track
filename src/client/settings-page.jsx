import React, { useEffect, useState } from "react";
import { themeOptions } from "./config";
import { SavingsIllustration, SecurityIllustration } from "./visuals";
import { api, downloadJson, formatCurrency } from "./utils";
export function SettingsPage({ user, theme, compactMode, onThemeChange, onWorkspaceChange, onUserChange, onChangePassword }) {
  const [notifications, setNotifications] = useState(() => user?.emailNotifications !== false);
  const [weeklyDigest, setWeeklyDigest] = useState(() => user?.weeklyDigest === true);
  const [settingsFeedback, setSettingsFeedback] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState("");

  useEffect(() => {
    setNotifications(user?.emailNotifications !== false);
  }, [user?.emailNotifications]);

  useEffect(() => {
    setWeeklyDigest(user?.weeklyDigest === true);
  }, [user?.weeklyDigest]);

  async function toggleNotifications() {
    const next = !notifications;
    setNotifications(next);
    try {
      const response = await api("/api/preferences/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailNotifications: next })
      });
      setNotifications(response.user.emailNotifications !== false);
      onUserChange(response.user);
      setSettingsFeedback(`Email notifications ${response.user.emailNotifications ? "enabled" : "disabled"}.`);
    } catch {
      setNotifications(!next);
      setSettingsFeedback("We could not update email notifications right now.");
    }
  }

  async function toggleWeeklyDigest() {
    const next = !weeklyDigest;
    setWeeklyDigest(next);
    try {
      await onWorkspaceChange({ weeklyDigest: next });
      setSettingsFeedback(`Weekly digest ${next ? "enabled" : "disabled"}.`);
    } catch {
      setWeeklyDigest(!next);
      setSettingsFeedback("We could not update the weekly digest setting.");
    }
  }

  async function toggleCompactMode() {
    const next = !compactMode;
    try {
      await onWorkspaceChange({ compactMode: next });
      setSettingsFeedback(`Compact mode ${next ? "enabled" : "disabled"}.`);
    } catch {
      setSettingsFeedback("We could not update compact mode right now.");
    }
  }

  async function downloadExport(kind) {
    try {
      const response = await api(kind === "data" ? "/api/export/data" : "/api/export/profile");
      const fileName = kind === "data" ? "spend-smart-data-export.json" : "spend-smart-profile-backup.json";
      downloadJson(fileName, response);
      setSettingsFeedback(kind === "data" ? "Full data export downloaded." : "Profile backup downloaded.");
    } catch {
      setSettingsFeedback("We could not prepare that download right now.");
    }
  }

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Preferences</p>
          <h2 className="page-title">Settings</h2>
          <p className="helper">Personalize how Spend Smart looks, feels, and keeps you updated.</p>
        </div>
      </div>
      <div className="settings-grid">
        <article className="settings-card">
          <h3 className="section-title">Theme studio</h3>
          <p className="helper">Current theme: {theme}</p>
          <div className="theme-picker-grid">
            {themeOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`theme-swatch-card ${theme === option.id ? "selected" : ""}`}
                onClick={() => onThemeChange(option.id)}
              >
                <div className="swatch-strip">
                  {option.preview.map((color) => (
                    <span key={color} style={{ background: color }} />
                  ))}
                </div>
                <strong>{option.name}</strong>
              </button>
            ))}
          </div>
        </article>
        <article className="settings-card">
          <h3 className="section-title">Account snapshot</h3>
          <p className="helper">{user ? `Signed in as ${user.email}` : "Not signed in"}</p>
          <div className="mini-profile">
            <div className="mini-avatar">{user?.name?.slice(0, 1) || "S"}</div>
            <div>
              <strong>{user?.name || "Spend Smart User"}</strong>
              <p className="helper">Monthly goal: {formatCurrency(user?.monthlyGoal || 0)}</p>
            </div>
          </div>
        </article>
        <article className="settings-card">
          <h3 className="section-title">Alerts and reminders</h3>
          <div className="setting-toggle-row">
            <div>
              <strong>Email notifications</strong>
              <p className="helper">Get mail alerts when financial data is created, updated, or deleted.</p>
            </div>
            <button className={`toggle-chip ${notifications ? "active" : ""}`} onClick={toggleNotifications}>
              {notifications ? "On" : "Off"}
            </button>
          </div>
          <div className="setting-toggle-row">
            <div>
              <strong>Weekly digest</strong>
              <p className="helper">Save your preference for a weekly income and spending digest.</p>
            </div>
            <button className={`toggle-chip ${weeklyDigest ? "active" : ""}`} onClick={toggleWeeklyDigest}>
              {weeklyDigest ? "On" : "Off"}
            </button>
          </div>
        </article>
        <article className="settings-card">
          <h3 className="section-title">Workspace style</h3>
          <div className="setting-toggle-row">
            <div>
              <strong>Compact cards</strong>
              <p className="helper">Make dashboard blocks tighter for denser information.</p>
            </div>
            <button className={`toggle-chip ${compactMode ? "active" : ""}`} onClick={toggleCompactMode}>
              {compactMode ? "On" : "Off"}
            </button>
          </div>
          <div className="settings-actions">
            <button className="primary-button" onClick={() => onThemeChange("dark")}>Quick dark</button>
            <button className="ghost-button" onClick={() => downloadExport("data")}>Export data</button>
            <button className="ghost-button" onClick={() => downloadExport("profile")}>Backup profile</button>
          </div>
          <p className="feedback">{settingsFeedback}</p>
        </article>
        <article className="settings-card">
          <h3 className="section-title">Change password</h3>
          <form
            className="field-grid single-grid"
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const currentPassword = String(formData.get("currentPassword") || "");
              const newPassword = String(formData.get("newPassword") || "");
              try {
                const message = await onChangePassword({ currentPassword, newPassword });
                setPasswordFeedback(message);
                event.currentTarget.reset();
              } catch (error) {
                setPasswordFeedback(error.message);
              }
            }}
          >
            <label className="field full"><span>Current password</span><input name="currentPassword" type="password" required /></label>
            <label className="field full"><span>New password</span><input name="newPassword" type="password" placeholder="Minimum 6 characters" required /></label>
            <button type="submit" className="primary-button full-button">Update password</button>
            <p className="feedback full">{passwordFeedback}</p>
          </form>
        </article>
      </div>

      <div className="settings-visual-grid">
        <article className="settings-card visual-card">
          <div>
            <p className="eyebrow">Visual preview</p>
            <h3 className="section-title">Money flow illustration</h3>
            <p className="helper">A quick visual reminder that every smart decision compounds over time.</p>
          </div>
          <SavingsIllustration />
        </article>
        <article className="settings-card visual-card">
          <div>
            <p className="eyebrow">Security</p>
            <h3 className="section-title">Protected and organized</h3>
            <p className="helper">Your account now uses JWT auth and bcrypt password hashing for a stronger baseline.</p>
          </div>
          <SecurityIllustration />
        </article>
      </div>
    </section>
  );
}

