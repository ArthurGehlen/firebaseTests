import { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router";

import "./Home.css";

const Home = () => {
  const [mensagens, setMensagens] = useState([]);
  const mensagemRef = useRef();
  const mensagensEndRef = useRef(null); // ref para o fim da lista
  const [user, setUser] = useState(null);
  const navigator = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        alert("Usuário não encontrado!");
        navigator("/");
        return;
      }

      setUser(u);

      const mensagensRef = collection(db, "users", u.uid, "messages");
      const q = query(mensagensRef, orderBy("criadaEm", "asc"));

      const unsubMsgs = onSnapshot(q, (snapshot) => {
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMensagens(lista);
      });

      return () => unsubMsgs();
    });

    return () => unsubscribe();
  }, [navigator]);

  // useEffect pra fazer a animação de fim de lista
  useEffect(() => {
    if (mensagensEndRef.current) {
      mensagensEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensagens]);

  const enviar_mensagem = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    const texto = mensagemRef.current.value.trim();
    if (!texto) return;

    await addDoc(collection(db, "users", user.uid, "messages"), {
      texto,
      criadaEm: new Date(),
    });

    mensagemRef.current.value = "";
  };

  const sair = async () => {
    await signOut(auth);
    navigator("/");
  };

  return (
    <div id="home_main">
      <header className="home_header">
        <h1>Bem vindo, {user ? user.email : "..."}</h1>
        <button onClick={sair}>Sair</button>
      </header>

      <div className="home_content">
        <div className="message_wrapper">
          <ul>
            {mensagens.map((m) => (
              <li key={m.id}>{m.texto}</li>
            ))}
            <div ref={mensagensEndRef} style={{ marginBottom: "0.8rem" }} />
          </ul>

          <form onSubmit={enviar_mensagem}>
            <input
              type="text"
              placeholder="Digite sua mensagem"
              ref={mensagemRef}
            />
            <button type="submit">Enviar</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
