import { useEffect, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { useNavigate } from "react-router-dom";



const BASE_URL = import.meta.env.VITE_USERHUB_URL;



const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [userName, setUsername] = useState("");
    const [userList, setUserList] = useState<string[]>([]);

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl(BASE_URL)
                .build();

        newConnection.start().then(() => {
            newConnection.invoke("GetUserList").then((users) => {
                setUserList([...users]);
            });
        });

        return () => {
            newConnection.stop();
        };
    }, []);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userName.trim() === "") {
            alert("Lütfen geçerli bir kullanıcı adı girin.");
            return;
        }

        if (userList.includes(userName)) {
            alert("Bu kullanıcı adı zaten mevcut.");
            return;
        }

        navigate(`/chat/${userName}`);
    };
    return (

        <div className="background">
            <div className="form-card">
                <div className="form-title">
                    Welcome 👋
                </div>

                <div className="form-subtitle">
                    Select your username to get started
                </div>

                <div className="auth">
                    <div className="auth-label">Username</div>
                    <input className="auth-input"
                           type="text"
                           value={userName}
                           onChange={handleUsernameChange}/>
                    <button className="auth-button" type="submit" onClick={handleSubmit}>Join Chat!</button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;