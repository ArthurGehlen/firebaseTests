// Hooks
import { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { useNavigate } from "react-router";

// Utils
import "./Home.css";

const Home = () => {
  const [mensagens, setMensagens] = useState([]);
  const mensagemRef = useRef();
  const navigator = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      alert("Usuário não encontrado!");
      navigator("/");
    }

    const mensagensRef = collection(db, "users", user.uid, "messages");
    const q = query(mensagensRef, orderBy("criadaEm", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMensagens(lista);
    });

    return () => unsubscribe();
  }, []);

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

  return (
    <div id="home_main">
      <header className="home_header">
        <h1>Bem vindo, {auth.currentUser.email}</h1>
        {/* preguiça de escrever um formulario pra pegar o nickname kkkkk vai de email msm */}
      </header>

      <div className="home_content">
        <header className="home_content_header">
          <h2>Mensagens</h2>
        </header>

        <div className="message_wrapper">
          <ul>
            {mensagens.map((m) => (
              <li key={m.id}>{m.texto}</li>
            ))}
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
