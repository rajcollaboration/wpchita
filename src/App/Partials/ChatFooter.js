import React, { useState, useRef, useEffect } from 'react'
import { Button, Input } from 'reactstrap'
import * as FeatherIcon from 'react-feather'
import WomenAvatar5 from "../../assets/img/women_avatar5.jpg";
import EmojiPicker from 'emoji-picker-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './chatFooterStyling.scss'


function ChatFooter(props) {
    const inputRef = useRef();
    const [message, setMessage] = useState('');
    const [showEmojiPanel, setShowEmojiPanel] = useState(false);
    const [showAttachment, setShowAttachment] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([])
    const [showCamera, setShowCamera] = useState(false)
    const [toggleVideo, setToggleVideo] = useState(true)
    const [snapshot, setSnapshot] = useState("")
    const [previewIndex, setPreviewIndex] = useState('0')
    const [showFilePreviewPanel, setShowFilePreviewPanel] = useState(false)
    const videoEl = useRef();
    const canvasEl = useRef();
    const [videoStrm, setVideoStrm] = useState(null)
    const notify = (msg) => toast.error(msg, {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
    const enterp = (e)=>{
        if(e.key === "Enter"){
            console.log(e.key);
            if (showEmojiPanel == true) {
                Shoot(!showEmojiPanel);
            }  
            if (message != "" || message.trim().length > 0) {
                props.onSubmit({
                    chatId: props.chatId,
                    body: message,
                    type: 'text'
                });
                setMessage('');
                console.log(message);
            }
        }
        inputRef.current.focus();
    };
    const [stopVideo, setStopVideo] = useState({})
    const removeFile = (index) => {
        // console.log("removeFile ", index);
        selectedFiles.splice(index, 1);
        setSelectedFiles([...selectedFiles]);
        setPreviewIndex('0')
        if(selectedFiles.length==0){
            setShowFilePreviewPanel(false)
        }
        // console.log(selectedFiles);
    }
    const Shoot = (visibility) => {
        // console.log("close clicked");
        setShowEmojiPanel(visibility);
    }
    const showAttachmentPanel = (visibility) => {
        // console.log(" AttachmentPanel close clicked");
        setShowAttachment(visibility);
    }

    const onEmojiClick = (event, emojiObject) => {
        let emoji = emojiObject.emoji || "";
        setMessage(message + "" + emoji);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        // console.log(message, "message");
        if (message != "" || message.trim().length > 0) {
            props.onSubmit({
                chatId: props.chatId,
                body: message,
                type: 'text'
            });
            setMessage('');
        }
        for (let ind = 0; ind < selectedFiles.length; ind++) {
            const element = selectedFiles[ind];
            console.log(element);
            props.onSubmit({
                chatId: props.chatId,
                body: element.base64,
                filename: element.name,
                type: 'doc',
                attachmentMsg:element.caption
            });
        }
        selectedFiles.splice(0, selectedFiles.length);
        setSelectedFiles([...selectedFiles]);
        let dt = new Date()
        if (snapshot != "") {
            props.onSubmit({
                chatId: props.chatId,
                body: snapshot,
                filename: "capture_" + dt.getDate() + "_" + (parseInt(dt.getMonth()) + 1) + "_" + dt.getFullYear() + "_" + dt.getHours() + "_" + dt.getMinutes() + "_" + dt.getSeconds() + ".png",
                type: 'doc',
                attachmentMsg:""
            });
        }
        setSnapshot("")
        setShowCamera(false);
        setShowFilePreviewPanel(false)

    };

    const handleChange = (e) => {
        setMessage(e.target.value);
    };
    const handleFileRead = async (event) => {

        let fileInfoList = []
        let fileObj = event.target.files;
        // console.log("handleFileRead", fileObj);
        for (let i = 0; i < fileObj.length; i++) {
            let file = fileObj[i];
            let filesize = Math.round(file.size / 1000);
            // console.log(filesize / 1000 + " MB");
            let limit = 61440;//60mb
            if (filesize <= limit) {
                const base64 = await convertBase64(file)
                // console.log("done");
                let fileInfo = {
                    name: file.name,
                    type: file.type,
                    size: filesize + ' kB',
                    base64: base64,
                    file: file,
                    error: "",
                    caption:""
                };
                fileInfoList.push(fileInfo)
                // console.log(file.type);
            } else {
                notify(file.name + " is more than 60MB")
            }
        }
        if(fileInfoList.length>0){
            setShowFilePreviewPanel(true)
        }
        setSelectedFiles(fileInfoList)
    };
    useEffect(() => {
        // console.log(previewIndex);
    }, [])
    const openCamera = () => {
        let video = videoEl.current;
        // console.log("video ref", video);
        setToggleVideo(true);
        var constraints = {
            audio: false,
            video: {
                facingMode: 'environment'
            }
        };
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                try {

                    let strm = window.URL.createObjectURL(stream);
                    setVideoStrm(strm)

                    let strmTrack = stream.getVideoTracks()[0];
                    setStopVideo(strmTrack)

                } catch (error) {

                    videoEl.current.srcObject = stream;

                    let strmTrack = stream.getTracks()[0];
                    setStopVideo(strmTrack)
                }

                videoEl.current.play();
            })
            .catch(err => {
                alert("There was an error with accessing the camera stream: " + err.name, err);
            })
    }
    const convertBase64 = (file) => {
        // console.log("converting started");
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file)
            fileReader.onload = () => {
                resolve(fileReader.result);
            }
            fileReader.onerror = (error) => {
                reject(error);
            }
        })
    };
    const updateFileCaption=(index,caption)=>{
        // console.log(index,caption);
        selectedFiles[index].caption = caption;
        setSelectedFiles([...selectedFiles]);
    }
    const FilePreview = (params) => {
        // console.log(selectedFiles,params.index);
        let index = params.index;
        let data = selectedFiles[index];
        if(data == undefined) return <div></div>;
        // console.log(data);
        if (data.type != undefined && data.type.includes("image")) {
            return(
                <div >
                    <div style={{height: '369px',width: '100%',display: 'flex',flexDirection: 'column',justifyContent: 'center'}}>
                        <img style={{  objectFit: 'contain',height: '79%' }} src={data.base64} />
                    </div>
                    <div className="wrapper">
                        <input autoFocus={true} value={data.caption} onChange={(event)=>{ updateFileCaption(index,event.target.value) }}  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" className="input" placeholder="Add a caption" type="text" />
                        <span className="underline"></span>
                    </div>
                </div>
            )
        } else if (data.type != undefined && data.type.includes("video")) {
            return (
                <div>
                    <div style={{height: '369px',width: '100%',display: 'flex',flexDirection: 'column',justifyContent: 'center'}}>
                        <video controls style={{width: '100%',height: '90%'}} ><source src={data.base64} type={data.type} ></source></video>
                    </div>
                    <div className="wrapper">
                        <input autoFocus={true} value={data.caption} onChange={(event)=>{ updateFileCaption(index,event.target.value) }} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" className="input" placeholder="Add a caption" type="text" />
                        <span className="underline"></span>
                    </div>
                </div>
            )
        } else {
            return(
                <div>
                   <div style={{height: '369px',width: '100%',display: 'flex',flexDirection: 'column',justifyContent: 'center'}}>
                        <img style={{  objectFit: 'contain',height: '79%' }} src={window.location.origin + '/document-icon.png'} />
                    </div>
                    <div className="wrapper">
                        <input autoFocus={true} value={data.caption} onChange={(event)=>{ updateFileCaption(index,event.target.value) }} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" className="input" placeholder="Add a caption" type="text" />
                        <span className="underline"></span>
                    </div>
                </div>
            ) 
        }

    }
    const captureImage = () => {
        if (toggleVideo) {
            let canvas = canvasEl.current;
            let video = videoEl.current;
            let context = canvas.getContext('2d');
            let width = video.videoWidth;
            let height = video.videoHeight;
            if (width && height) {
                canvas.width = width;
                canvas.height = height;
                context.drawImage(video, 0, 0, width, height);
                let snap = canvas.toDataURL('image/png');
                // console.log(snap);
                setSnapshot(snap)
                setToggleVideo(false);
                stopVideo.stop();
            }
        } else {
            setToggleVideo(true);
            setSnapshot("")
            openCamera()
        }

    }
    let objects = [1, 2, 3, 4, 5, 6, 7, 8, 6, 8];
    return (
        <div className="chat-footer" onKeyUp={enterp} onClick={enterp} >
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            {showCamera && (
                <div style={{ height: '60vh', overflow: 'auto', background: "#919191", }}>
                    <div style={{ width: "100%" }}>

                        <Button color="light" onClick={() => { setShowCamera(false); setSnapshot("") }} style={{ float: 'right', margin: "3px" }}>X</Button>
                        {/* <Button color="light" onClick={() => { if(snapshot!="")setToggleVideo(!toggleVideo); setSnapshot("") }} style={{ float: 'right', margin: "3px" }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9 12l-4.463 4.969-4.537-4.969h3c0-4.97 4.03-9 9-9 2.395 0 4.565.942 6.179 2.468l-2.004 2.231c-1.081-1.05-2.553-1.699-4.175-1.699-3.309 0-6 2.691-6 6h3zm10.463-4.969l-4.463 4.969h3c0 3.309-2.691 6-6 6-1.623 0-3.094-.65-4.175-1.699l-2.004 2.231c1.613 1.526 3.784 2.468 6.179 2.468 4.97 0 9-4.03 9-9h3l-4.537-4.969z" /></svg></Button> */}
                        <Button color="light" onClick={() => { captureImage(); }} style={{ float: 'right', margin: "3px" }}>📸</Button>
                    </div>
                    <div>
                        <video src={videoStrm} ref={videoEl} id="video" style={{ display: toggleVideo ? 'block' : 'none', width: "100%", height: "84%", borderRadius: 20 }} ></video>
                        <canvas ref={canvasEl} style={{ display: 'none' }} ></canvas>
                        <img src={snapshot} style={{ display: toggleVideo ? 'none' : 'block', width: "100%" }} />
                    </div>

                </div>
            )} 

            <div style={{ display: showFilePreviewPanel?'flex':'none', minHeight: "84vh", maxHeight: '84vh', maxWidth: '794px',marginBottom: '-44px',zIndex: '105',position: 'relative', overflow: "auto", flexDirection: 'column' }}>
                <div style={{ flex: '5',background:"#e6e6e6" }}>
                    <div style={{display:'flex', background:"#00bfa5",padding:"5px", color:"#fff", flexDirection:'row'}}>
                        <button onClick={()=>{ setShowFilePreviewPanel(false) }} className="btn" style={{ fontWeight:"600", color:"#fff"}}>X</button><h3 style={{paddingTop: '8px'}}>Preview</h3>
                    </div>
                {selectedFiles.length>0?(<FilePreview  index={previewIndex} />):<></>}
                    
                </div>
                <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background:"#d9d9d9" }}>
                    <div style={{ display: 'flex', flexDirection: 'row', overflow: 'auto', overflow: 'auto hidden' }}>

                        {selectedFiles.map(function (fileinfo, i) {
                            return (
                                <div onClick={() => { setPreviewIndex(i) }} key={i} name="wrapperClass" style={{ padding: '5px',height: '100px',minWidth: '100px',maxWidth:'101px',display: 'flex',overflow:'hidden', paddingRight:'10px' }}>
                                    <span onClick={()=>{removeFile(i)}} style={{ position: 'relative', left: '74px', top: '-9px', fontWeight: '600', cursor: 'pointer' }}>X</span>
                                    {fileinfo.type.includes("image") ? (<img style={{ width:'100%', display:'block', }} src={fileinfo.base64} />) : (<video width="70" ><source src={fileinfo.base64} type={fileinfo.type} ></source></video>)}
                                </div>);
                        })}

                    </div>
                </div>
                <span onClick={handleSubmit} style={{position: 'absolute',bottom: '73px',right: '14px',zIndex: '100',width: '60px',height: '60px',background: 'green',textAlign: 'center',borderRadius:'50%',paddingTop: '18px',paddingLeft: '3px',cursor: 'pointer'}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#fff" d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path></svg>
                </span>

            </div>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex' }}>
                    <Button color="light" className="mr-1" title="Emoji" onClick={() => { showAttachmentPanel(false); Shoot(!showEmojiPanel); }}>
                        <FeatherIcon.Smile />
                    </Button>
                    <div style={{ display: showEmojiPanel ? 'block' : 'none', position: 'absolute', bottom: '57px', marginRight: '30px', width: "62%" }} ref={inputRef}>
                        <EmojiPicker pickerStyle={{ width: '100%' }} onEmojiClick={onEmojiClick} color="light" className="mr-3" title="Emoji" />
                    </div>
                    <Button color="light" title="Attach" onClick={() => { Shoot(false); showAttachmentPanel(!showAttachment) }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.053 3.263.215l5.511-5.512c.28-.28.267-.722.053-.936l-.244-.244c-.191-.191-.567-.349-.957.04l-5.506 5.506c-.18.18-.635.127-.976-.214-.098-.097-.576-.613-.213-.973l7.915-7.917c.818-.817 2.267-.699 3.23.262.5.501.802 1.1.849 1.685.051.573-.156 1.111-.589 1.543l-9.547 9.549a3.97 3.97 0 0 1-2.829 1.171 3.975 3.975 0 0 1-2.83-1.173 3.973 3.973 0 0 1-1.172-2.828c0-1.071.415-2.076 1.172-2.83l7.209-7.211c.157-.157.264-.579.028-.814L11.5 4.36a.572.572 0 0 0-.834.018l-7.205 7.207a5.577 5.577 0 0 0-1.645 3.971z"></path></svg>
                    </Button>
                    <div style={{ display: showAttachment ? 'block' : 'none', position: 'absolute', bottom: '37px', width: '100px' }}>
                        <div style={{ paddingLeft: '0' }}>
                            <ul style={{ listStyleType: 'none' }}>
                                {/* <li title="Rooms" style={{cursor: 'pointer'}}><svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 53 53" width="53" height="53"><defs><circle id="rooms-SVGID_1_" cx="26.5" cy="26.5" r="25.5"></circle></defs><clipPath id="rooms-SVGID_2_"><use xlinkHref="#rooms-SVGID_1_" overflow="visible"></use></clipPath><g clipPath="url(#rooms-SVGID_2_)"><path fill="#396CD3" d="M26.5-1.1C11.9-1.1-1.1 5.6-1.1 27.6h55.2c-.1-19-13-28.7-27.6-28.7z"></path><path fill="#4079EC" d="M53 26.5H-1.1c0 14.6 13 27.6 27.6 27.6s27.6-13 27.6-27.6H53z"></path><path fill="#396CD3" d="M17 24.5h15v9H17z"></path></g><g fill="#F5F5F5"><path id="svg-rooms" fillRule="evenodd" clipRule="evenodd" d="M28.5 18a3.5 3.5 0 0 1 3.5 3.5v10a3.5 3.5 0 0 1-3.5 3.5h-10a3.5 3.5 0 0 1-3.5-3.5v-10a3.5 3.5 0 0 1 3.5-3.5h10zm-7.925 6.782a.804.804 0 0 0-1.045-.073l-.708.698-.297.33-.134.177a4.075 4.075 0 0 0 .433 5.265 4.07 4.07 0 0 0 2.886 1.198c.976 0 1.952-.349 2.73-1.05l.784-.777.077-.091.063-.102.045-.105a.797.797 0 0 0-.189-.824.806.806 0 0 0-1.045-.073l-.704.694-.123.116-.147.119-.15.105a2.5 2.5 0 0 1-3.099-.337 2.492 2.492 0 0 1-.12-3.392l.748-.756.076-.091.063-.102.046-.105a.794.794 0 0 0-.19-.824zm5.281-.637a.803.803 0 0 0-1.044-.073l-3.67 3.662-.078.091-.063.102-.045.105a.793.793 0 0 0 .754 1.056.805.805 0 0 0 .481-.16l3.671-3.662.076-.09.064-.102.045-.105a.795.795 0 0 0-.191-.824zm2.323-2.323a4.078 4.078 0 0 0-5.615-.149l-.785.777-.073.084-.062.098a.806.806 0 0 0 .14.941.803.803 0 0 0 1.043.072l.705-.693.127-.119.137-.111a2.494 2.494 0 0 1 3.257.227c.921.923.972 2.413.117 3.392l-.746.755-.072.084-.062.098a.8.8 0 0 0 .139.941.8.8 0 0 0 1.043.072l.709-.697.148-.156.145-.17a4.084 4.084 0 0 0-.295-5.446zm9.815-.188l.006.129v9.474c0 1.31-1.714 1.998-2.744 1.12l-.878-.847a2.828 2.828 0 0 1-.871-1.849l-.007-.19v-5.943c0-.765.316-1.498.879-2.039l.877-.846c.996-.848 2.631-.234 2.738.991z"></path></g></svg></li> */}
                                {/* <li title="Contacts" style={{cursor: 'pointer'}}><svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 53 53" width="53" height="53"><defs><circle id="contact-SVGID_1_" cx="26.5" cy="26.5" r="25.5"></circle></defs><clipPath id="contact-SVGID_2_"><use xlinkHref="#contact-SVGID_1_" overflow="visible"></use></clipPath><g clipPath="url(#contact-SVGID_2_)"><path fill="#0795DC" d="M26.5-1.1C11.9-1.1-1.1 5.6-1.1 27.6h55.2c-.1-19-13-28.7-27.6-28.7z"></path><path fill="#0EABF4" d="M53 26.5H-1.1c0 14.6 13 27.6 27.6 27.6s27.6-13 27.6-27.6H53z"></path></g><g fill="#F5F5F5"><path id="svg-contact" d="M26.5 26.5A4.5 4.5 0 0 0 31 22a4.5 4.5 0 0 0-4.5-4.5A4.5 4.5 0 0 0 22 22a4.5 4.5 0 0 0 4.5 4.5zm0 2.25c-3.004 0-9 1.508-9 4.5v1.125c0 .619.506 1.125 1.125 1.125h15.75c.619 0 1.125-.506 1.125-1.125V33.25c0-2.992-5.996-4.5-9-4.5z"></path></g></svg></li> */}
                                <li onClick={() => { showAttachmentPanel(false) }} title="Documents" style={{ cursor: 'pointer' }}><label style={{ cursor: 'pointer' }} htmlFor="uploadDocumentFile"><svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 53 53" width="53" height="53"><defs><circle id="document-SVGID_1_" cx="26.5" cy="26.5" r="25.5"></circle></defs><clipPath id="document-SVGID_2_"><use xlinkHref="#document-SVGID_1_" overflow="visible"></use></clipPath><g clipPath="url(#document-SVGID_2_)"><path fill="#5157AE" d="M26.5-1.1C11.9-1.1-1.1 5.6-1.1 27.6h55.2c-.1-19-13-28.7-27.6-28.7z"></path><path fill="#5F66CD" d="M53 26.5H-1.1c0 14.6 13 27.6 27.6 27.6s27.6-13 27.6-27.6H53z"></path></g><g fill="#F5F5F5"><path id="svg-document" d="M29.09 17.09c-.38-.38-.89-.59-1.42-.59H20.5c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H32.5c1.1 0 2-.9 2-2V23.33c0-.53-.21-1.04-.59-1.41l-4.82-4.83zM27.5 22.5V18l5.5 5.5h-4.5c-.55 0-1-.45-1-1z"></path></g></svg></label></li>
                                <li onClick={() => { showAttachmentPanel(false); setShowCamera(true); openCamera() }} title="Camera" style={{ cursor: 'pointer', marginBottom: ".5rem" }}><svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 53 53" width="53" height="53"><defs><circle id="camera-SVGID_1_" cx="26.5" cy="26.5" r="25.5"></circle></defs><clipPath id="camera-SVGID_2_"><use xlinkHref="#camera-SVGID_1_" overflow="visible"></use></clipPath><g clipPath="url(#camera-SVGID_2_)"><path fill="#D3396D" d="M26.5-1.1C11.9-1.1-1.1 5.6-1.1 27.6h55.2c-.1-19-13-28.7-27.6-28.7z"></path><path fill="#EC407A" d="M53 26.5H-1.1c0 14.6 13 27.6 27.6 27.6s27.6-13 27.6-27.6H53z"></path><path fill="#D3396D" d="M17 24.5h15v9H17z"></path></g><g fill="#F5F5F5"><path id="svg-camera" d="M27.795 17a3 3 0 0 1 2.405 1.206l.3.403a3 3 0 0 0 2.405 1.206H34.2a2.8 2.8 0 0 1 2.8 2.8V32a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4v-9.385a2.8 2.8 0 0 1 2.8-2.8h1.295a3 3 0 0 0 2.405-1.206l.3-.403A3 3 0 0 1 25.205 17h2.59zM26.5 22.25a5.25 5.25 0 1 0 .001 10.501A5.25 5.25 0 0 0 26.5 22.25zm0 1.75a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z"></path></g></svg></li>
                                <li onClick={() => { showAttachmentPanel(false) }} title="Photos and Videos" style={{ cursor: 'pointer' }}><label style={{ cursor: 'pointer' }} htmlFor="uploadImageFile"><svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 53 53" width="53" height="53"><defs><circle id="image-SVGID_1_" cx="26.5" cy="26.5" r="25.5"></circle></defs><clipPath id="image-SVGID_2_"><use xlinkHref="#image-SVGID_1_" overflow="visible"></use></clipPath><g clipPath="url(#image-SVGID_2_)"><path fill="#AC44CF" d="M26.5-1.1C11.9-1.1-1.1 5.6-1.1 27.6h55.2c-.1-19-13-28.7-27.6-28.7z"></path><path fill="#BF59CF" d="M53 26.5H-1.1c0 14.6 13 27.6 27.6 27.6s27.6-13 27.6-27.6H53z"></path><path fill="#AC44CF" d="M17 24.5h18v9H17z"></path></g><g fill="#F5F5F5"><path id="svg-image" d="M18.318 18.25h16.364c.863 0 1.727.827 1.811 1.696l.007.137v12.834c0 .871-.82 1.741-1.682 1.826l-.136.007H18.318a1.83 1.83 0 0 1-1.812-1.684l-.006-.149V20.083c0-.87.82-1.741 1.682-1.826l.136-.007h16.364zm5.081 8.22l-3.781 5.044c-.269.355-.052.736.39.736h12.955c.442-.011.701-.402.421-.758l-2.682-3.449a.54.54 0 0 0-.841-.011l-2.262 2.727-3.339-4.3a.54.54 0 0 0-.861.011zm8.351-5.22a1.75 1.75 0 1 0 .001 3.501 1.75 1.75 0 0 0-.001-3.501z"></path></g></svg></label></li>
                            </ul>
                        </div>
                        <div style={{ display: "none" }}>
                            <input type="file" onChange={handleFileRead} id="uploadDocumentFile" multiple />
                            <input type="file" accept="image/*,video/*" onChange={handleFileRead} id="uploadImageFile" multiple />
                        </div>
                    </div>


                </div>
                <Input type="text" className="form-control" placeholder="Tecla el mensaje." value={message} onChange={handleChange} />
                <div className="form-buttons">
                    <Button color="primary">
                        <FeatherIcon.Send />
                    </Button>
                </div>

            </form>
        </div>
    )
}

export default ChatFooter
