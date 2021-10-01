import React, {useEffect, useState, useRef} from 'react'
import { useSelector, useDispatch } from 'react-redux';
import * as FeatherIcon from 'react-feather'
import ChatHeader from "./ChatHeader"
import ChatFooter from "./ChatFooter"
import ManAvatar3 from "../../assets/img/man_avatar3.jpg"
import {selectedChat} from "../Sidebars/Chats/Data"
import PerfectScrollbar from "react-perfect-scrollbar"
import UnselectedChat from '../../assets/img/unselected-chat.svg'
import {
    selectChatAction,
    readChatMessage
} from "../../Store/Actions/chatActions"
import {mobileProfileAction} from "../../Store/Actions/mobileProfileAction";
import Loader from "../Utils/Loader";
import axios from 'axios';

import io from 'socket.io-client';

function Chat() {
    let activeChat = useSelector(state => state.chats.activeChat);
    let newMessagesInChat = useSelector(state => state.chats.newMessagesInChat);

    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState('');
    const [scrollEl, setScrollEl] = useState();
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);

    const dispatch = useDispatch();
    const mobileMenuBtn = () => document.body.classList.toggle('navigation-open');

    useEffect(() => {
      if (scrollEl) {
          scrollEl.scrollTop = scrollEl.scrollHeight;
      }
    }, [activeChat, scrollEl]);

    useEffect(() => {
        async function fetchMessages() {
            axios.defaults.headers.get['Content-Type'] = 'application/json';
            axios.defaults.headers.get['Access-Control-Allow-Origin'] = '*';
            await axios.get(`${process.env.REACT_APP_BACKEND_URL}/internal/chat?chatId=${activeChat.id}`)
                .then((response) => {
                    setMessages(response.data.messages);
                    setLoading(false);
                    return true
                })
        }
        if(activeChat.id) {
            setLoading(true);
            fetchMessages();
        }
    },[activeChat]);

    useEffect(() => {
        async function fetchMessages() {
            axios.defaults.headers.get['Content-Type'] = 'application/json';
            axios.defaults.headers.get['Access-Control-Allow-Origin'] = '*';
            await axios.get(`${process.env.REACT_APP_BACKEND_URL}/internal/chat?chatId=${activeChat.id}`)
                .then((response) => {
                    setMessages(response.data.messages);
                    return true
                })
        }

        if(newMessagesInChat !== null){
            fetchMessages();
            dispatch(readChatMessage());
        }
    },[newMessagesInChat]);

    const handleSubmit = async (formData) => {
      axios.defaults.headers.get['Content-Type'] = 'application/json';
      axios.defaults.headers.get['Access-Control-Allow-Origin'] = '*';
      let currTime= new Date().getTime()/1000;
      let mockMessage = {
          fromMe: true,
          body: formData.body,
          time:currTime
      }
      if(formData.type=='doc'){
        mockMessage = {
            fromMe: true,
            body: formData.filename,
            time:currTime
        }
      }
      setMessages(messages.concat([mockMessage]));
      console.log("message sent",formData);
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/internal/message`, formData)
        .then(async (response) => {
            setInputMsg("");
        })
    };

    const handleChange = (newValue) => {
        setInputMsg(newValue);
    };

    const MessagesView = (props) => {
        const {message} = props;

        if (message.type === 'divider') {
            return <div className="message-item messages-divider sticky-top" data-label={message.text}></div>
        } else {
            const messageClass = message.fromMe ? 'outgoing-message' : 'incoming-message'

            switch(message.type) {
                case 'ptt':
                    return(
                        <div className={"message-item " + messageClass}>
                            <audio controls>
                                <source src={message.body} type="audio/ogg" />
                                Your browser does not support the audio element.
                            </audio>
                            <div className="time">
                                {new Date(message.time * 1000).toLocaleString()}
                            </div>
                        </div>
                    );
                case 'image':
                    return(
                        <div className={"message-item " + messageClass}>
                            <img src={message.body} />
                            <div className="time">
                                {new Date(message.time * 1000).toLocaleString()}
                            </div>
                        </div>
                    )
                case 'video':
                    return(
                        <div className={"message-item " + messageClass}>
                            <video controls="controls" src={message.body}>
                                Your browser does not support the HTML5 Video element.
                            </video>
                        </div>
                    )
                default:
                    return(
                        <div className={"message-item " + messageClass}>
                            <div className="message-content">
                                {message.body}
                                <div className="time">
                                {new Date(message.time * 1000).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    )
            }
        }
    };

    if(JSON.stringify(activeChat.details)==JSON.stringify({})){
        return (
            <div className="chat">
                <div className="chat-header-action">
                    <ul className="list-inline">
                        <li className="list-inline-item d-xl-none d-inline">
                            <button onClick={mobileMenuBtn} className="btn btn-outline-light mobile-navigation-button">
                                <FeatherIcon.Menu/>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        )
    } else {
        if (loading) {
            return <Loader />
        } else {
            return (
                <div className="chat">
                    <ChatHeader/>
                    <PerfectScrollbar
                    containerRef={ref => setScrollEl(ref)}>

                        <div className="chat-body">
                            <div className="messages">
                                {
                                    messages.map((message, i) => <MessagesView message={message} key={i}/>)
                                }
                            </div>
                        </div>
                    </PerfectScrollbar>
                    <ChatFooter onSubmit={handleSubmit} onChange={handleChange} inputMsg={inputMsg} chatId={activeChat.id} />
                </div>
            )
        }
    }
}

export default Chat
