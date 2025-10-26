// Hooks
import { useRef, useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router";

// Utils
import "./Login.css";

const Login = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const [modo, setModo] = useState("login");
  const navigator = useNavigate();

  const handle_submit = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value.trim();

    if (!email || !password) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      let user_credential;

      if (modo === "login") {
        user_credential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        navigator("/home");
      } else {
        user_credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await setDoc(doc(db, "users", user_credential.user.uid), {
          email,
          criadoEm: new Date(),
        });
        navigator("/home");
      }
    } catch (erro) {
      console.error(erro);
    }
  };

  return (
    <div className="login_container">
      <h2>{modo === "login" ? "Entrar" : "Criar conta"}</h2>

      <form onSubmit={handle_submit}>
        <label>Email:</label>
        <input type="email" ref={emailRef} />
        <label>Senha:</label>
        <input type="password" ref={passwordRef} />
        <button type="submit">
          {modo === "login" ? "Entrar" : "Registrar"}
        </button>
      </form>

      <p>
        {modo === "login" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
        <button
          onClick={() => setModo(modo === "login" ? "registro" : "login")}
        >
          {modo === "login" ? "Criar conta" : "Entrar"}
        </button>
      </p>
    </div>
  );
};

export default Login;
