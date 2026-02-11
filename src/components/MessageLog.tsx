import React, { useEffect, useRef } from 'react';
import './MessageLog.css';

interface MessageLogProps {
    messages: string[];
}

export const MessageLog: React.FC<MessageLogProps> = ({ messages }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) return null;

    return (
        <div className="message-log">
            {messages.map((msg, i) => (
                <div key={i} className="message-entry">
                    {msg}
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    );
};
