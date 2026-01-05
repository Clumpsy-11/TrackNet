'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id?: string;
  type: 'chat' | 'system';
  username?: string;
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const [username, setUsername] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    wsRef.current = ws;

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'join', username: username.trim() }));
      setHasJoined(true);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'chat', content: inputMessage.trim() }));
      setInputMessage('');
    }
  };

  if (!hasJoined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-2">
              Join TrackNet Chat
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Enter your name to start chatting
            </p>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-600"
                  disabled={!isConnected}
                />
              </div>
              {!isConnected && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Connecting to chat server...
                </p>
              )}
              <button
                type="submit"
                disabled={!username.trim() || !isConnected}
                className="w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Join Chat
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold text-black dark:text-zinc-50">
            TrackNet Chat
          </h1>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                <p>No messages yet. Say hello!</p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id || message.timestamp}
                className={`flex ${
                  message.type === 'system'
                    ? 'justify-center'
                    : 'justify-start'
                }`}
              >
                {message.type === 'system' ? (
                  <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs text-zinc-600 dark:text-zinc-400">
                    {message.content}
                  </div>
                ) : (
                  <div className="max-w-[80%] bg-zinc-100 dark:bg-zinc-800 rounded-lg px-4 py-2">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-sm text-black dark:text-zinc-50">
                        {message.username}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-500">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-black dark:text-zinc-100 break-words">
                      {message.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="border-t border-zinc-200 dark:border-zinc-700 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-600"
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || !isConnected}
                className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
