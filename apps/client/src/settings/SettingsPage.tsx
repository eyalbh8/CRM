import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthProvider";

export function SettingsPage() {
  const { changePassword, employee } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password changed successfully");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Settings</p>
        <div>
          <h1>Settings</h1>
          <p>Manage account security for {employee?.email ?? employee?.login}.</p>
        </div>
      </section>

      <section className="table-card settings-card">
        <div className="table-toolbar">
          <div>
            <h2>Change password</h2>
            <p>Enter your current password before setting a new one.</p>
          </div>
        </div>

        <form className="settings-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Current password</span>
            <input
              autoComplete="current-password"
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              type="password"
              value={currentPassword}
            />
          </label>

          <label className="form-field">
            <span>New password</span>
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              type="password"
              value={newPassword}
            />
          </label>

          <label className="form-field">
            <span>Confirm new password</span>
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
          </label>

          {error ? <div className="form-message form-message--error">{error}</div> : null}
          {message ? <div className="form-message form-message--info">{message}</div> : null}

          <div className="form-actions">
            <button className="primary-action-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Changing..." : "Change password"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
