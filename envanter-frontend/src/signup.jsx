import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Kayıt işlemleri burada yapılacak
    navigate("/"); // Ana sayfaya yönlendir
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src="/DepoStok .png" alt="DepoStok Logo" className="team-illustration" />
      </div>
      
      <div className="login-right">
        <div className="login-header">
          <h1>Kayıt Ol</h1>
          <div className="account-prompt">
            Zaten hesabınız var mı? <a href="/login">Giriş Yap</a>
          </div>
        </div>

        <div className="social-login">
          <button className="google-login">
            <img src="/google-icon.svg" alt="Google" />
            Google ile kayıt ol
          </button>
          <button className="microsoft-login">
            <img src="/microsoft-icon.svg" alt="Microsoft" />
            Microsoft ile kayıt ol
          </button>
        </div>

        <div className="divider">
          <span>Email ile kayıt ol</span>
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

          <div className="form-group">
            <label>Şifreyi Onayla</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••"
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              Şartları ve koşulları kabul ediyorum
            </label>
          </div>

          <button type="submit" className="login-button" style={{ backgroundColor: 'orange' }}>
            Hesap Oluştur
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
