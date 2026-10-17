import { useEffect, useState } from "react";
import {
    Bot,
    History,
    Send,
    Sparkles,
    UserRound,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import {
    getAIHistory,
    sendAIMessage,
} from "../services/aiService";

const AIChat = () => {
    const [ messages, setMessages ] = useState([]);
    const [ question, setQuestion ] = useState("");
    const [ loading, setLoading ] = useState(false);
    const [ historyLoading, setHistoryLoading ] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await getAIHistory();

                const history = Array.isArray(data)
                    ? data
                    : data.results || data.history || [];

                const formatted = [];

                history.forEach((item) => {
                    if (item.question) {
                        formatted.push({
                            role: "user",
                            text: item.question,
                        });
                    }

                    if (item.response || item.answer) {
                        formatted.push({
                            role: "ai",
                            text: item.response || item.answer,
                        });
                    }
                });

                setMessages(formatted);
            } catch {
                // History is optional for the first load.
            } finally {
                setHistoryLoading(false);
            }
        };

        loadHistory();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmed = question.trim();

        if (!trimmed || loading) return;

        setMessages((current) => [
            ...current,
            {
                role: "user",
                text: trimmed,
            },
        ]);

        setQuestion("");
        setLoading(true);

        try {
            const data = await sendAIMessage(trimmed);

            const answer =
                data.response ||
                data.answer ||
                data.message ||
                "I could not generate a response.";

            setMessages((current) => [
                ...current,
                {
                    role: "ai",
                    text: answer,
                },
            ]);
        } catch {
            setMessages((current) => [
                ...current,
                {
                    role: "ai",
                    text: "Sorry, something went wrong. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (historyLoading) {
        return <Loading />;
    }

    return (
        <div className="app-layout">
            <Navbar />

            <main className="page-container ai-page">
                <section className="page-header">
                    <p className="eyebrow">AI ASSISTANT</p>
                    <h1>Your personal habit coach.</h1>
                    <p>
                        Ask for practical ideas, routines, or motivation.
                    </p>
                </section>

                <section className="ai-card">
                    <div className="ai-intro">
                        <div className="ai-icon">
                            <Sparkles size={24} />
                        </div>

                        <div>
                            <h2>Habit Coach</h2>
                            <p>
                                Get simple suggestions tailored to your goals.
                            </p>
                        </div>

                        <History size={20} className="history-icon" />
                    </div>

                    <div className="chat-area">
                        {messages.length === 0 && (
                            <div className="chat-empty">
                                <Bot size={42} />
                                <h3>How can I help?</h3>
                                <p>
                                    Try asking: "Give me a simple morning habit."
                                </p>
                            </div>
                        )}

                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`message ${message.role === "user"
                                    ? "message-user"
                                    : "message-ai"
                                    }`}
                            >
                                <div className="message-icon">
                                    {message.role === "user" ? (
                                        <UserRound size={17} />
                                    ) : (
                                        <Bot size={17} />
                                    )}
                                </div>

                                <div className="message-content">
                                    {message.text}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="message message-ai">
                                <div className="message-icon">
                                    <Bot size={17} />
                                </div>

                                <div className="typing">
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>

                    <form className="chat-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Ask your habit coach..."
                            value={question}
                            onChange={(event) =>
                                setQuestion(event.target.value)
                            }
                        />

                        <button
                            className="primary-button"
                            disabled={loading || !question.trim()}
                            title="Send message"
                        >
                            <Send size={18} />
                            Send
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default AIChat;