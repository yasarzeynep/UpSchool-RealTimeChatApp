import { ChangeEvent, useEffect, useState } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./ChatPage.css";

const BASE_URL = import.meta.env.VITE_USERHUB_URL;

type Message = {
    username: string;
    content: string;
    createdOn: Date;
};



const ChatPage = () => {
    const navigate = useNavigate();
  const { userName  } = useParams<{ userName: string }>();
    const [message, setMessage] = useState<Message>({
        username: "",
        content: "",
        createdOn: new Date(),
    });
    const [userList, setUserList] = useState<string[]>([]);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [connection, setConnection] = useState<HubConnection>();
    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl(BASE_URL)
                .build();

        newConnection.start().then(() => {
            newConnection.invoke("GetUserList").then((users) => {
                setUserList([...users]);


                if (userName && users.includes(userName)) {
                    console.log("Kullanıcı zaten eklenmiş:", userName);
                } else if (userName) {
                    newConnection.invoke("addUser", userName).then(() => {
                        console.log("Kullanıcı eklendi:", userName);
                    });
                }
            });
        });

        newConnection.on("UserAdded", (user: string) => {
            setUserList((prevUserList) => [...prevUserList, user]);
            console.log("Kullanıcı eklendi:", user);
        });

        newConnection.on("UserDeleted", (user: string) => {
            setUserList((prevUserList) => prevUserList.filter((u) => u !== user));
            console.log("Kullanıcı çıkarıldı:", user);
        });

        newConnection.on("MessageListUpdated", (messages: Message[]) => {
            setChatMessages(messages);
            console.log("Mesaj listesi güncellendi:", messages);
        });



        return () => {
            newConnection.stop();
        };
    }, [userName]);



    useEffect(() => {
        const hubConnection = new HubConnectionBuilder()
            .withUrl(BASE_URL)
            .withAutomaticReconnect()
            .build();


        hubConnection.on("MessageAdded", (message: Message) => {
            setChatMessages((prevMessages) =>
                prevMessages ? [...prevMessages, message] : [message]
            );
        });

        const startConnection = async () => {
            try {
                await hubConnection.start();
                console.log("SignalR connection started.");
                setConnection(hubConnection);


                const messages = await hubConnection.invoke("GetMessageList");
                setChatMessages(messages);
            } catch (err: any) {
                console.error(err.toString());
            }
        };

        startConnection();

        return () => {
            if (hubConnection) {
                hubConnection.stop();
            }
        };
    }, [userName]);

    const handleSendMessage = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (message.content.trim() === "") {
            alert("Lütfen geçerli bir mesaj girin.");
            return;
        }

        if (connection && connection.state === "Connected") {
            connection
                .invoke("AddMessage", {
                    username: userName,
                    content: message.content,
                    createdOn: new Date(),
                })
                .then(() => {
                    console.log("Mesaj gönderildi:", message.content);
                    setMessage({
                        username: "",
                        content: "",
                        createdOn: new Date(),
                    });
                })
                .catch((err: Error) => console.error(err.toString()));
        } else {
            console.error("SignalR connection is not in the 'Connected' state.");
        }
    };

    const handleLeaveRoom = () =>
    {
    navigate("/");
    connection?.invoke("DeleteUser", userName);
    };

    return (
        <body>
        <div className="chat-container">
            <header className="chat-header">
                <h1><i className="fas fa-smile"></i> Chat App</h1>
                <a id="leave-btn" className="btn" onClick={handleLeaveRoom}>Leave Room</a>
            </header>
            <main className="chat-main">
                <div className="chat-sidebar">
                    <h3><i className="fas fa-users"></i> Users</h3>
                    <ul>
                        {userList.map((user, index) => (
                            <li key={index}>{user}</li>
                        ))}
                    </ul>
                </div>
                <div className="chat-messages">
                    <h2>Messages:</h2>
                    {chatMessages ? (
                        <ul>
                            {chatMessages.map((msg, index) => (
                                <li key={index}>
                                    <strong>{msg.username}:</strong> {msg.content}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
                <div className="chat-form-container">
                    <form id="chat-form">
                        <input
                            type="text"
                            value={message.content}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setMessage({
                                    ...message,
                                    content: e.target.value,
                                    createdOn: new Date(),
                                })
                            }
                        />
                        <button onClick={handleSendMessage} className="send-button">Send</button>
                    </form>
                </div>
            </main>
        </div>
        </body>

    );
};

export default ChatPage;

