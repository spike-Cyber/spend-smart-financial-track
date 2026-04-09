import React from "react";
import { demoMonthly } from "./config";
import { AuthIllustration, HeroOrbitIllustration } from "./visuals";
import { formatCurrency } from "./utils";
export function SplashPage({ onContinue, onSkip }) {
  return (
    <div className="sequence-shell splash-shell">
      <div className="splash-card glass animated-stage">
        <div className="motion-orb orb-one" />
        <div className="motion-orb orb-two" />
        <div className="motion-ring ring-one" />
        <div className="logo-mark large-mark animated-mark">S</div>
        <p className="eyebrow centered">Built for better money habits</p>
        <h1 className="page-title centered">Spend Smart</h1>
        <p className="helper centered wider">See your cash flow clearly, catch spending patterns early, and step into a finance workspace that feels calm and focused.</p>
        <HeroOrbitIllustration />
        <div className="loading-track"><span className="loading-fill" /></div>
        <p className="helper centered">Preparing your smart finance workspace...</p>
        <div className="hero-actions centered-row">
          <button className="primary-button" onClick={onContinue}>Start exploring</button>
          <button className="ghost-button" onClick={onSkip}>Continue to sign in</button>
        </div>
      </div>
    </div>
  );
}

export function LandingPage({ heroTotals, onLogin, onSignup }) {
  return (
    <div className="sequence-shell">
      <header className="hero glass">
        <div className="topbar">
          <div className="brand">
            <div className="logo-mark">S</div>
            <div>
              <p className="logo-name">Spend Smart</p>
              <p className="logo-sub">Take control of every rupee</p>
            </div>
          </div>
          <div className="nav-links">
            <button className="ghost-button" onClick={onLogin}>Login</button>
            <button className="primary-button" onClick={onSignup}>Sign up</button>
          </div>
        </div>
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Effortless financial management</span>
            <h1>Track spending, grow income, and understand your money in one place.</h1>
            <p>A one stop solution to manage your finances effectively.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={onSignup}>Create account</button>
              <button className="ghost-button" onClick={onLogin}>Welcome back</button>
            </div>
          </div>
          <div className="hero-visual landing-motion-area">
            <div className="hero-card glass floating-card card-one">
              <p className="muted">Demo balance</p>
              <strong className="page-title">{formatCurrency(heroTotals.balance)}</strong>
              <p className="helper">A quick look at what financial clarity can feel like.</p>
            </div>
            <div className="hero-preview glass live-preview">
              <div className="section-head">
                <div>
                  <p className="logo-name">Live activity</p>
                  <p className="helper">Momentum at a glance</p>
                </div>
                <span className="chip pulse-chip">Syncing</span>
              </div>
              <div className="live-bars">
                {demoMonthly.map((item, index) => {
                  const max = Math.max(...demoMonthly.map((entry) => entry.income));
                  return (
                    <div className="spark-item" key={item.month}>
                      <span className="spark-fill animated-fill" style={{ height: `${Math.max((item.income / max) * 120, 18)}px`, animationDelay: `${index * 0.14}s` }} />
                      <span className="helper">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="hero-card glass floating-card card-two">
              <p className="muted">Motion preview</p>
              <strong className="page-title">{formatCurrency(heroTotals.income)}</strong>
              <p className="helper">Live motion keeps the experience feeling active and intentional.</p>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export function AuthPage({ mode, feedback, onSubmit, onBack, onSwitch, onForgotPassword }) {
  const isSignup = mode === "signup";
  return (
    <div className="sequence-shell auth-shell">
      <div className="auth-layout glass">
        <div className="auth-copy">
          <p className="eyebrow">{isSignup ? "Join the platform" : "Welcome back"}</p>
          <h1 className="page-title">{isSignup ? "Build your personal finance command center" : "Pick up right where your money story left off"}</h1>
          <p className="helper">{isSignup ? "Create your account to start tracking balance, expenses, income, and investments with a cleaner workflow." : "Sign in to reconnect with your live balance, analytics, and money decisions in seconds."}</p>
          <div className="hero-actions">
            <button className="ghost-button" onClick={onBack}>Back</button>
            <button className="ghost-button" onClick={onSwitch}>{isSignup ? "Already have an account?" : "Create a new account"}</button>
          </div>
          <AuthIllustration mode={mode} />
        </div>
        <form onSubmit={(event) => onSubmit(event, mode)} className="panel auth-form-panel">
          <h3>{isSignup ? "Signup" : "Login"}</h3>
          <div className="field-grid single-grid">
            {isSignup && <label className="field full"><span>Full name</span><input name="name" placeholder="Aniket Sharma" required /></label>}
            <label className="field full"><span>Email</span><input name="email" type="email" placeholder="you@example.com" required /></label>
            <label className="field full"><span>Password</span><input name="password" type="password" placeholder="Minimum 6 characters" required /></label>
            {isSignup && <label className="field full"><span>Monthly savings goal</span><input name="monthlyGoal" type="number" defaultValue="2500" min="0" /></label>}
            <button type="submit" className="primary-button full-button">{isSignup ? "Create account" : "Login"}</button>
            {!isSignup && <button type="button" className="ghost-button full-button" onClick={onForgotPassword}>Forgot password?</button>}
            <p className="feedback full">{feedback}</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ForgotPasswordPage({ feedback, onSubmit, onBack }) {
  return (
    <div className="sequence-shell auth-shell">
      <div className="auth-layout glass">
        <div className="auth-copy">
          <p className="eyebrow">Password help</p>
          <h1 className="page-title">Reset access to your finance workspace</h1>
          <p className="helper">Enter the email linked to your account and we will prepare a password reset link for you.</p>
          <div className="hero-actions">
            <button className="ghost-button" onClick={onBack}>Back to login</button>
          </div>
          <AuthIllustration mode="login" />
        </div>
        <form onSubmit={onSubmit} className="panel auth-form-panel">
          <h3>Forgot password</h3>
          <div className="field-grid single-grid">
            <label className="field full"><span>Email</span><input name="email" type="email" placeholder="you@example.com" required /></label>
            <button type="submit" className="primary-button full-button">Send reset link</button>
            <p className="feedback full">{feedback}</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ResetPasswordPage({ email, token, feedback, onSubmit, onBackToLogin }) {
  return (
    <div className="sequence-shell auth-shell">
      <div className="auth-layout glass">
        <div className="auth-copy">
          <p className="eyebrow">Create new password</p>
          <h1 className="page-title">Choose a new password for Spend Smart</h1>
          <p className="helper">Finish your reset by confirming the email, using the prepared reset token, and setting a new password.</p>
          <div className="hero-actions">
            <button className="ghost-button" onClick={onBackToLogin}>Back to login</button>
          </div>
          <AuthIllustration mode="signup" />
        </div>
        <form onSubmit={onSubmit} className="panel auth-form-panel">
          <h3>Reset password</h3>
          <div className="field-grid single-grid">
            <label className="field full"><span>Email</span><input name="email" type="email" defaultValue={email || ""} required /></label>
            <label className="field full"><span>Reset token</span><input name="token" defaultValue={token || ""} placeholder="Paste reset token" required /></label>
            <label className="field full"><span>New password</span><input name="newPassword" type="password" placeholder="Minimum 6 characters" required /></label>
            <button type="submit" className="primary-button full-button">Reset password</button>
            <p className="feedback full">{feedback}</p>
          </div>
        </form>
      </div>
    </div>
  );
}

