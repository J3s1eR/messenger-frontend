import { useState } from 'react';

import { Sidebar } from '../Sidebar/Sidebar';
import { ChatWindow } from '../ChatWindow/ChatWindow';
import { RightPanel } from '../RightPanel/RightPanel';
import { ResizablePanel } from '../ResizablePanel/ResizablePanel';

import { ChatMessageProvider } from '../../contexts/ChatMessagesContext';

import { useChatMessages } from '../../contexts/ChatMessagesContext';

import styles from './Layout.module.css';

export const Layout = () => {
  //const [activeChatId, setActiveChatId] = useState<number | null>(null); // Управление активным чатом
  //const [activeChatUid, setActiveChatUid] = useState<string | null>(null); // Управление активным чатом
  const {activeChatUid} = useChatMessages();
  const [chatListWidth, setChatListWidth] = useState(506);
  const [rightPanelWidth, setRightPanelWidth] = useState(440);

  return (
    <div className={styles.layout}>
      {/* Передаем setActiveChatId в Sidebar */}
      {/*<Sidebar activeChatId={activeChatId} setActiveChatId={setActiveChatId} />*/}
      {/*<Sidebar activeChatUid={activeChatUid} setActiveChatUid={setActiveChatUid} />*/}
      <ResizablePanel
        initialWidth={chatListWidth}
        minWidth={506}
        maxWidth={800}
        onResize={setChatListWidth}
        resizerPosition="right"
      >
        <Sidebar />
      </ResizablePanel>
      {/*<Sidebar className={styles.Sidebar_style} /> */}

      {/* Показываем окно чата только если выбран чат */}
      {/* <ChatWindow chatId={activeChatId} /> */}
      {/*activeChatId !== null ? <ChatWindow chatId={activeChatId}/> : */}
      {/*{activeChatUid !== null ? <ChatWindow chatUid={activeChatUid}/> : */}
      {activeChatUid !== null ? <ChatWindow /> : 
      <div className={styles.ChatWindowEmpty}>
        <p>Выберите, кому написать :)</p>
      </div>}

      {/*activeChatId !== null && <RightPanel /> */}
      {activeChatUid !== null && (
        <ResizablePanel
          initialWidth={rightPanelWidth}
          minWidth={440}
          maxWidth={700}
          onResize={setRightPanelWidth}
          resizerPosition="left"
        >
          <RightPanel />
        </ResizablePanel>
      )}
    </div>
  );
};