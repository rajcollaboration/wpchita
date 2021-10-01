import React from 'react'
import {useSelector} from 'react-redux'
import ChatsIndex from "./Chats"
import UnreadIndex from "./Unread"
import FriendsIndex from "./Friends"
import FavoritesIndex from "./Favorites"
import ArchivedIndex from "./Archived"

function Index() {

    const {selectedSidebar, mobileSidebar} = useSelector(state => state);

    return (
        <div className={`sidebar-group ${mobileSidebar ? "mobile-open" : ""}`}>
            {
                (() => {
                    if (selectedSidebar.option === 'Chats') {
                        return <ChatsIndex/>
                    } else if (selectedSidebar.option === 'Unread') {
                        return <UnreadIndex/>
                    } else if (selectedSidebar.option === 'Friends') {
                        return <FriendsIndex/>
                    } else if (selectedSidebar.option === 'Favorites') {
                        return <FavoritesIndex/>
                    } else if (selectedSidebar.option === 'Archived') {
                        return <ArchivedIndex/>
                    }
                })()
            }
        </div>
    )
}

export default Index
