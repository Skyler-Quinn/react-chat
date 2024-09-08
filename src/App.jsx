import Chat from "./components/chat/chat";
import List from "./components/list/List";
import Detail from "./components/detail/Detail";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";

const App = () => {
  const [showDetails, setShowDetails] = useState(false);
  const {currentUser, isLoading, fetchUserInfo} = useUserStore();
  const {chatId} = useChatStore();

  const handleUserClick = () => {
    setShowDetails(!showDetails);
  };

  useEffect(()=>{
    const unSub = onAuthStateChanged(auth, (user)=>{
      fetchUserInfo(user?.uid);
    });
    
    return () => {
      unSub();
    };

  },[fetchUserInfo]);

  if(isLoading) return <div className="loading">Loading...</div>
  return (
    <div className='container'>
      {currentUser?(
        <>
          <List/>
          {chatId && <Chat onUserClick={handleUserClick} />}
          {showDetails && <Detail />}
        </>
        ):( <Login/>)
      }
      
      <Notification />
    </div>
  )
}

export default App