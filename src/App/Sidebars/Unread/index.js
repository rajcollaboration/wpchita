import React, {useEffect, useRef, useState} from 'react'
import {useDispatch} from "react-redux"
import * as FeatherIcon from 'react-feather'
import {Tooltip} from 'reactstrap'
import 'react-perfect-scrollbar/dist/css/styles.css'
import PerfectScrollbar from 'react-perfect-scrollbar'
import AddGroupModal from "../../Modals/AddGroupModal"
import {mobileSidebarAction} from "../../../Store/Actions/mobileSidebarAction";
import {
    selectChatAction,
    newMessageAction
} from "../../../Store/Actions/chatActions"
import Loader from "../../Utils/Loader";
import Avatar from "../../../assets/img/avatar.png"
import io from 'socket.io-client';
// import {sidebarAction} from "../../../Store/Actions/sidebarAction"
// import {chatLists} from "./Data";

import axios from 'axios';

function Index() {
    let myChatListSocket = io(process.env.REACT_APP_BACKEND_SOCKET, {transports: ['websocket']});
    async function fetchChats(searchQuery="") {
        setSearchItemBg(false);
        let queryParam = "?unread=true";
        if(searchQuery!=""){
            console.log(searchQuery);
            queryParam += "&mobile="+searchQuery;
            setSearchItemBg(true);
        }
        axios.defaults.headers.get['Content-Type'] = 'application/json';
        axios.defaults.headers.get['Access-Control-Allow-Origin'] = '*';
        let chatList = []
        await axios.get(`${process.env.REACT_APP_BACKEND_URL}/internal/chats${queryParam}`)
            .then((response) => {
                chatList = response.data.chats;
            })
        setChatList(chatList);
        setLoading(false);

        myChatListSocket.on('connect', () => {
            console.log('chatListSocket.connected');
        });
        myChatListSocket.on('newMessages', chat => {
            console.log('received new messages ...');
            dispatch(newMessageAction(chatList, chat));
        });
    }
    useEffect(() => {
        fetchChats();
    },[]);

    const dispatch = useDispatch();

    const inputRef = useRef();


    const [chatList, setChatList] = useState([]);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchItemBg, setSearchItemBg] = useState(false);

    const toggle = () => setTooltipOpen(!tooltipOpen);

    const mobileSidebarClose = () => {
        dispatch(mobileSidebarAction(false));
        document.body.classList.remove('navigation-open');
    };

    const selectChat = async (chat) => {
        axios.defaults.headers.get['Content-Type'] = 'application/json';
        axios.defaults.headers.get['Access-Control-Allow-Origin'] = '*';
        await axios.get(`${process.env.REACT_APP_BACKEND_URL}/internal/chat?chatId=${chat.id}`)
            .then((response) => {
                dispatch(selectChatAction(chatList, chat.id, response.data.messages));
                return true
            })
    };

    const ChatListView = (props) => {
        const {chat} = props;

        return <li className={"list-group-item " + (searchItemBg?'search-item-bg':'') + (chat.selected === true ? 'open-chat' : '')} onClick={(event) => selectChat(chat)} >
            <figure className="avatar">
                { chat.image ?
                    <img src={chat.image} className="rounded-circle" alt="avatar" onError={(e)=>{
                        e.target.onError = null;
                        e.target.src="https://image.shutterstock.com/image-vector/default-avatar-profile-icon-social-260nw-1677509740.jpg"
                    }}/>
                    :
                    <img src="https://image.shutterstock.com/image-vector/default-avatar-profile-icon-social-260nw-1677509740.jpg" className="rounded-circle" alt="avatar"/>
                }
            </figure>
            <div className="users-list-body">
                <div>
                    <h5 className={chat.unread_messages ? 'text-primary' : ''}>{chat.name}</h5>
                    {chat.text}
                </div>
                <div className="users-list-action">
                    {chat.unreadMessages ? <div className="new-message-count">{chat.unreadMessages}</div> : ''}
                    <small className={chat.unreadMessages ? 'text-primary' : 'text-muted'}>{new Date(chat.updatedAt).toDateString()}</small>
                </div>
            </div>
        </li>
    };

    const SideBar = () => {
        if(loading) {
            return <Loader />
        } else {
            return (
                <PerfectScrollbar>
                    <ul className="list-group list-group-flush">
                        {
                            chatList.map((chat, i) => <ChatListView chat={chat} key={i}/>)
                        }
                    </ul>
                </PerfectScrollbar>
            )
        }
    };

    return (
        <div className="sidebar active">
            <header>
                <span>Chats</span>
                <ul className="list-inline">
                    <li className="list-inline-item d-xl-none d-inline">
                        <button onClick={mobileSidebarClose}
                                className="btn btn-outline-light text-danger sidebar-close">
                            <FeatherIcon.X/>
                        </button>
                    </li>
                </ul>
            </header>
            <form>
                <input type="text" onChange={event => fetchChats(event.target.value)} className="form-control" placeholder="Search" ref={inputRef}/>
            </form>
            <div className="sidebar-body">
                <SideBar />
            </div>
        </div>
    )
}

export default Index
