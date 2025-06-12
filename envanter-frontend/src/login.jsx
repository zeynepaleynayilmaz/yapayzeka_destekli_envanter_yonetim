import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Login işlemleri burada yapılacak
    navigate("/"); // Ana sayfaya yönlendir
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img
          src="/DepoStok .png"
          alt="DepoStok Logo"
          className="team-illustration"
        />
      </div>

      <div className="login-right">
        <div className="login-header">
          <h1>Giriş Yap</h1>
          <div className="account-prompt">
            Hesabınız yok mu? <a href="/signup">Kayıt Ol</a>
          </div>
        </div>

        <div className="social-login">
          <button className="google-login">
            <img src="/google-icon.svg" alt="Google" />
            Google ile giriş yap
          </button>
          <button className="microsoft-login">
            <img src="/microsoft-icon.svg" alt="Microsoft" />
            Microsoft ile giriş yap
          </button>
        </div>

        <div className="divider">
          <span>Email ile giriş yap</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aleyna@depostok.com"
            />
          </div>

          <div className="form-group">
            <label>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Bu cihazı hatırla
            </label>
            <span className="forgot-password">
              Şifremi Unuttum
            </span>
          </div>

          <button type="submit" className="login-button" style={{ backgroundColor: 'orange' }}>
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
