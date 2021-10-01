export const selectChatAction = (chatList, chatId) => ({
    type: 'SELECT_CHAT',
    chatList,
    chatId
});

export const newMessageAction = (chatList, chat) => ({
    type: 'NEW_MESSAGE_IN_CHAT',
    chatList,
    chat
});

export const readChatMessage = () => ({
    type: 'READ_CHAT_MESSAGE'
});
