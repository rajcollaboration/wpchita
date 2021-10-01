let initialState = {
    activeChat: {
        id: null,
        details: {},
        messages: [],
    },
    chatId: null,
    details: {},
    messages: [],
    newMessagesInChat: null
}

const chatsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SELECT_CHAT':
            let selectedChat = null;
            action.chatList.forEach((chat) => {
                if(chat.id === action.chatId) {
                    chat.selected = chat.id === action.chatId
                    selectedChat = chat;
                    chat.unreadMessages = 0;
                } else {
                    chat.selected = false;
                }
            });
            return {
                ...state,
                activeChat: {
                    id: action.chatId,
                    details: selectedChat,
                    messages: action.messages,
                },
            };

        case 'NEW_MESSAGE_IN_CHAT':
            action.chatList.forEach((chat) => {
                if(chat.id === action.chat.id) {
                    chat.unreadMessages = action.chat.unreadMessages;
                };
            });
            let newMessagesInChat = action.chat.id === state.activeChat.id;
            return {
                ...state,
                newMessagesInChat: newMessagesInChat
            };

        case 'READ_CHAT_MESSAGE':
            return {
                ...state,
                newMessagesInChat: null
            }

        default:
            return state
    }
};

export default chatsReducer;
