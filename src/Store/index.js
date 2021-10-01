import {createStore, combineReducers} from "redux"

import sidebarReducer from "./Reducers/sidebarReducer"
import mobileSidebarReducer from "./Reducers/mobileSidebarReducer"
import profileSidebarReducer from "./Reducers/profileSidebarReducer"
import mobileProfileSidebarReducer from "./Reducers/mobileProfileSidebarReducer"
import pageTourReducer from "./Reducers/pageTourReducer"
import chatsReducer from "./Reducers/chatsReducer"

const reducers = combineReducers({
    selectedSidebar: sidebarReducer,
    mobileSidebar: mobileSidebarReducer,
    profileSidebar: profileSidebarReducer,
    mobileProfileSidebar: mobileProfileSidebarReducer,
    pageTour: pageTourReducer,
    chats: chatsReducer
});

const store = createStore(reducers);

export default store
