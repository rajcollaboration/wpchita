let initialState = {
    option: 'Unread',
    loading: false
}

const sidebarReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SIDEBAR':
            return {
                ...state,
                option: action.name,
                loading: false
            }
        default:
            return state
    }
};

export default sidebarReducer;
