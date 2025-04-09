//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'

//import SquircleTest1Component from "./components/Test/SqTest1";
import { SquircleNoScript } from "./components/ultimate-squircle/squircle-js";

import { Layout } from "./components/Layout/Layout";
//import { MessageBubble } from "./components/MessageBubble/MessageBubble";
//import { MessageList } from './components/MessageList/MessageList';
//import { ChatHeader } from './components/ChatHeader/ChatHeader';
//import MessageInput from './components/MessageInput/MessageInput';
//import { ChatWindow } from './components/ChatWindow/ChatWindow';
//import { Sidebar } from './components/Sidebar/Sidebar';
//import  UserAvatar  from './components/UserAvatar/UserAvatar';
//import  FolderList  from './components/FolderList/FolderList';
//import { ChatList } from './components/ChatList/ChatList';
//
//
//import ContextMenu from "./components/Test/ContextMenu/ContextMenu";


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatMessageProvider } from './contexts/ChatMessagesContext';
import PrivateRoute from './routes/PrivateRoute';

import LoginPage from './pages/LoginPage';






//const menuItems = [
//  { label: "Выделить", action: () => alert("Выделение") },
//  { label: "Удалить", action: () => alert("Удаление") },
//];

//<Layout/>
//<MessageList/>
//<Sidebar/>
//

function App() {
  //const [count, setCount] = useState(0)

  return (
    <>
      <div>
      {/*<ContextMenu items={menuItems}></ContextMenu>*/}
      {/*<Layout/>*/}



      <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute />}>
            <Route path="/" element={
              <ChatMessageProvider>
                <Layout />
              </ChatMessageProvider>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>




      {/*<Sidebar/>
      <UserAvatar />
      <FolderList />
      <ChatList />
      <ChatWindow/>
      <ChatHeader />
      <MessageList />
      <MessageInput />
      
      <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>

      <MessageBubble text="Привет, мирывапвапвапвапвапвапвапв  вапвапвап вап вап" isOwn={false} />
      <MessageBubble text="ssdfg" isOwn={true} />
      <SquircleTest1Component></SquircleTest1Component>
      <SquircleTest1Component/>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>*/}
      {/* Добавляем компонент с Squircle */}
      
      <SquircleNoScript />
      </div>
    </>
  )
}

export default App
