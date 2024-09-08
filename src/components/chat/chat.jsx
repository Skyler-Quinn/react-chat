import { useEffect, useRef, useState } from "react"
import "./chat.css"
import EmojiPicker from "emoji-picker-react"
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";

const Chat = ({ onUserClick }) => {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState();
  const [text, setText] = useState("");
  const {chatId, user, isCurrentUserBlocked, isReceiverBlocked} = useChatStore();
  const {currentUser} = useUserStore();
  const endRef = useRef(null);
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  useEffect(()=>{
    endRef.current?.scrollIntoView({behavior: "smooth"})
  },[]);

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "chats",chatId), (res) => {
        setChat(res.data());
      }
    );

    return () => {
      unSub();
    }
  },[chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
  };

  const handleImg = e =>{
    if(e.target.files[0]){
        setImg({
            file: e.target.files[0],
            url: URL.createObjectURL(e.target.files[0])
        })
    }       
}

  const handleSend = async () => {
    if (text == "") return;

    let imgUrl = null;

    try{
      if(img.file){
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId),{
        messages:arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && {img: imgUrl}),
        })
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        if(userChatsSnapshot.exists()){
          const userChatData = userChatsSnapshot.data();
          const chatIndex = userChatData.chats.findIndex(c => c.chatId == chatId);
          userChatData.chats[chatIndex].lastMessage = text;
          userChatData.chats[chatIndex].seen = id === currentUser.id ? true : false;
          userChatData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatData.chats,

          });
        }
        
      });
      

    }catch(err){
      console.log(err);
    }

    setImg({
      file: null,
      url: "",
    });

    setText("");

  };

    return (
      <div className='chat'>
        <div className="top">
          <div className="user" onClick={onUserClick}>
            <img src={user?.avatar || "./avatar.png"} alt="" />
            <div className="texts">
              <span>{user?.username}</span>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
            </div>
          </div>
          <div className="icons">
            <img src="./phone.png" alt="" />
            <img src="./video.png" alt="" />
            <img src="./info.png" alt="" />
          </div>
        </div>
        <div className="center">
          {chat?.messages?.map((message) => (
            <div className={message.senderId === currentUser?.id ? "msg own" : "msg"} key={message?.createdAt}>
              {message.img && <img src = {message.img} alt = ""/>}
              <p>{message.text}</p>
              {/*<span>1 min ago</span>*/}
            </div>
          ))}
          {img.url && (
            <div className="msg own">
              <img src = {img.url} alt = ""/>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="bottom">
          <div className="icons">
            <label htmlFor="file">
              <img src="./img.png" alt="" />
            </label>
            <input type="file" id="file" style={{display: "none"}} onChange={handleImg} disabled = {isCurrentUserBlocked || isReceiverBlocked} />
            <img src="./camera.png" alt="" />
            <img src="./mic.png" alt="" />
          </div>
          <input type="text" placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You are blocked" : "Type message to send..."} onChange={e => setText(e.target.value)} value={text} onClick={()=> setOpen(false)} disabled = {isCurrentUserBlocked || isReceiverBlocked}/>
          <div className="emoji">
            <img src="./emoji.png" alt="" onClick={()=> setOpen((prev) => !prev)}/>
            <div className="picker">
              <EmojiPicker open = {open} onEmojiClick={handleEmoji}/>
            </div>
          </div>
          <button className="sendbtn" onClick={handleSend} disabled = {isCurrentUserBlocked || isReceiverBlocked}>Send</button>
        </div>
      </div>
    )
  }
  
  export default Chat