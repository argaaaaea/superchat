import logo from './logo.svg';
import { useState, useRef } from 'react';
import './App.css';

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, serverTimestamp, query, orderBy, limit, addDoc } from 'firebase/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const app = initializeApp({
  apiKey: "AIzaSyDNcP1bE_V3hzkEstQW7rafI2rJ5k7DCYQ",
  authDomain: "superchat-9dc48.firebaseapp.com",
  projectId: "superchat-9dc48",
  storageBucket: "superchat-9dc48.appspot.com",
  messagingSenderId: "799427417189",
  appId: "1:799427417189:web:d5078cd71ff9a0e158228c",
  measurementId: "G-CYYHKBXX6K"
})

const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with google</button>
  )
}

function SignOut() {
  const [ user ]   = useAuthState(auth);
  return user && (

    <button onClick={() => signOut(auth)}>Sign Out</button>
  )
}

function ChatRoom() {

  const [ user ] = useAuthState(auth);
  const dummy = useRef()

  const messagesRef = collection(firestore, 'messages');
  const messageQuery = query(messagesRef, orderBy('createdAt'), limit(25))

  const [messages] = useCollectionData(messageQuery, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {

    e.preventDefault();

    const { uid, photoURL } = user;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

    dummy.current.scrollIntoView({
      behavior: 'smooth'
    });
  }

  return (<>
      <main>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}>

        </div>

      </main>

      <form onSubmit={sendMessage}>

        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />

        <button type="submit">
          send
        </button>
      </form>
    </>
  )
}

function ChatMessage(props) {

  const [ user ] = useAuthState(auth)
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === user.uid ? 'sent' : 'received';

  return (
      <div className={`message ${messageClass}`}>
        <img src={photoURL} />
        <p>{text}</p>
      </div>)

}

export default App;
