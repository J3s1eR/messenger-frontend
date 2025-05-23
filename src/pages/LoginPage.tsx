import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import styles from "./LoginPage.module.css";
import { Squircle } from '../components/ultimate-squircle/squircle-js';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate("/"); // Перенаправляем в основное приложение после успешного входа
    } catch (error) {
      console.error("Ошибка входа:", error);
    }
  };

  return (
    <div className={styles.LoginPage}>
      <div className={styles.LoginPage_Main}>
      <h2 className={styles.LoginPage_Title}>Вход</h2>

      <form 
      className={styles.LoginPage_Form}
      onSubmit={handleLogin}
      >
        <Squircle 
          cornerRadius={20}

          cornerSmoothing={1}
          defaultWidth={500}
          defaultHeight={60}
          className={styles.inputContainer}

          asChild
        >
          <div className={styles.inputWrapper}>
            <input 
              className={styles.input}
              type="text" 
              placeholder="Логин" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>
        </Squircle>

        <Squircle 
          cornerRadius={20}

          cornerSmoothing={1}
          defaultWidth={500}
          defaultHeight={60}
          className={styles.inputContainer}

          asChild
        >
          <div className={styles.inputWrapper}>
            <input 
              className={styles.input}
              type="password" 
              placeholder="Пароль" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
        </Squircle>

        <Squircle 
          cornerRadius={20}

          cornerSmoothing={1}
          defaultWidth={120}
          defaultHeight={60}
          className={styles.ButtonContainer}

          asChild
        >
          <button type="submit" className={styles.Button}>Войти</button>
        </Squircle>
      </form>
      </div>
    </div>
  );
};

export default LoginPage;
