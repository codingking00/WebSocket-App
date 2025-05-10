'use client'
import { useEffect, useRef, useState } from "react";


export default function Home() {
  const [messages, setMessages] = useState<{username:String,content:String}[]>([]);
  const [nameInput,setNameInput]= useState('')
  const [user,setUser] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connected');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
          setConnectionStatus('connected');
      }
      ws.onclose = () => {
          setConnectionStatus('disconnected');
      }
      ws.onmessage = (e) => {
        const parsed=JSON.parse(e.data);
        if(parsed.username && parsed.content) {
          setMessages((pre) => [...pre, parsed]);
        }
            
      }
      const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
              ws.send(`{"event":"ping"}`);
          }
      }, 29000)

      return () => {
          clearInterval(pingInterval);
          if (wsRef.current) {
              wsRef.current.close();
          }
      }
  }, [])
  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!newMessage.trim()) return;

      if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({username:user, content:newMessage}));
          setNewMessage('');
      }
  }

  if (!user) {
      return (
        <main className="h-screen flex items-center justify-center bg-gray-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if(nameInput.trim()) {
                  setUser(nameInput)
              }
            }}
            className="bg-white p-8 rounded shadow-lg space-y-4"
          >
            <h2 className="text-lg font-semibold text-gray-700">Enter your name</h2>
            <input
              type="text"
              value={nameInput}
              onChange={e=> {
                  setNameInput(e.target.value)
              }}
              placeholder="Your name"
              className="border px-4 py-2 rounded w-full"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
              Join Chat
            </button>
          </form>
        </main>
      );
    }
  return (
          <main className="flex justify-center min-h-screen items-center bg-gradient-to-b from-gray-400 to-gray-100">
              <div className="w-full max-w-2xl border border-gray-200 mx-4 bg-white rounded-xl shadow-lg flex flex-col h-[60vh] ">
                  <div className={`px-6 py-4 text-sm font-bold rounded-t-xl ${
                      connectionStatus==='connected'? 'bg-green-100 text-green-700 border-b border-green-200':
                      connectionStatus==='disconnected'? 'bg-red-100 text-red-700 border-b border-red-200':
                      'bg-yellow-100 text-yellow-700 border-b border-yellow-200'
                  }`}>
                      <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                              connectionStatus==='connected'? 'bg-green-500':
                              connectionStatus==='disconnected'? 'bg-red-500':
                              'bg-yellow-500 animate-ping'
                          }`}></div>
                          Status:{connectionStatus}
                      </div>
                  </div>
                  <div className="flex-1 bg-gray-50 overflow-y-auto space-y-4">
                      {messages.map((message,index)=> (
                          <div key={index} className="bg-white p-2 rounded-lg  shadow-sm border border-gray-100 transition-all hover:shadow-md ">
                              <p className=" font-medium text-shadow-amber-950">{message.username}: {message.content}</p>
                          </div>
                      ))}
                  </div>
                  <form onSubmit={sendMessage} className="border-t border-gray-100 p-3 bg-white rounded-b-xl">
                      <div className="flex gap-3">
                          <input type="text" value={newMessage} onChange={e=> {
                              setNewMessage(e.target.value)
                          }}
                          className="flex-1 rounded-lg border border-gray-200 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all"
                          placeholder="Type your message" />
                          <button type="submit" disabled={connectionStatus!=='connected'}
                          className={`px-6 py-3 rounded-lg font-medium transition-all ${
                              connectionStatus==='connected'? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 shadow-sm hover:shadow':
                              'bg-gray-300 text-gray-400 cursor-not-allowed'
                          }`}>
                              Send
                          </button>
                      </div>
                  </form>
              </div>
          </main>
  )
}
