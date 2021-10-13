import './App.css';
import React, {useState, useEffect} from 'react';
import Post from './components/Post.js';
import {db, auth, storage} from './firebase.js';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import { Button,Input } from '@material-ui/core';
import {Avatar} from '@material-ui/core'
import firebase from 'firebase';

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {
  const [posts,setPosts] = useState([]);
  const classes = useStyles();
  const [openSignIn, setOpenSignIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [modalStyle] = useState(getModalStyle);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [image,setImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [caption, setCaption] = useState('');
  const [showUpload, setShowUpload] = useState(false);


  useEffect(() => {
    db.collection('posts').orderBy('timestamp','desc').onSnapshot(snapshot => {
      setPosts(snapshot.docs.map(doc => ({
        id: doc.id,
        post: doc.data()
      })));
    })
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if(authUser) {
        // user has logged in...
        console.log(authUser);
        setUser(authUser);
      }else {
        // user has logged out....
        setUser(null);
      }
    })
     
    return () => {
      // perform some cleanup action
      unsubscribe();
    }
  },[user, username]);

  // Sign up function
  const signUp = (event) => {
    event.preventDefault();

    auth.createUserWithEmailAndPassword(email, password).then((authUser) => {
      return authUser.user.updateProfile({
        displayName: username,
      })
    }).catch((error) => alert(error.message));
    setOpen(false);
  }

  // sign in function
  const signIn = (event) => {
    event.preventDefault();
    auth.signInWithEmailAndPassword(email,password).catch((error) =>alert(error.message));

    setOpenSignIn(false);
  }

  // upload file function..
  const handleChange =(e) => {
    if(e.target.files[0]) {
        setImage(e.target.files[0]);
    }
  };

  // hanlde uploading function..
  const handleUpload = () => {
      const uploadTask = storage.ref(`images/${image.name}`).put(image);
      uploadTask.on(
          "state_changed",
          (snapshot) => {
              // progress function ...
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setProgress(progress);
          },
          (error) => {
              // error function ...
              console.log(error);
              alert(error.message);
          },
          () => {
              // complete function ...
              storage.ref("images").child(image.name).getDownloadURL().then(url => {
                  db.collection("posts").add({
                      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                      caption: caption,
                      imageUrl: url,
                      username: user.displayName
                  });

                  setProgress(0);
                  setCaption("");
                  setImage(null);
              });
          }
      )
  }
  return (
    <div className="App">
      {/* signup modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className="app_signup">
            <center>
              <h5>Instagram</h5>
            </center>
            <Input placeholder="username" type="text" autoComplete="off" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Input placeholder="email" type="text" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="password" type="password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" onClick={signUp}>Sign up</Button>
          </form>            
        </div>
      </Modal>
      {/* Login modal */}
      <Modal open={openSignIn} onClose={() => setOpenSignIn(false)}>
        <div style={modalStyle} className={classes.paper}>
          <form className="app_login">
            <center>
              <h5>Instagram Clone</h5>
            </center>
            <Input placeholder="email" type="text" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="password" type="password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" onClick={signIn}>Sign In</Button>
          </form>            
        </div>
      </Modal>
      {/* Upload image Modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)}>
        <div className="uploadbg">
          <div className="imageupload">
            <button className="close" onClick={() =>setShowUpload(false)}>X</button>
            <input className="image_caption" type="text" placeholder="Enter a caption" onChange={event => setCaption(event.target.value)} value={caption} />
            <input className="image_file" type="file" onChange={handleChange}/>
            <button className="image_btn" onClick={handleUpload}>Upload</button>
            <progress className="imageupload_progress" value={progress} max="100" />
          </div>
        </div>
      </Modal>
      {/* App header */}
      <div className="app_header">
        <div className="app_header_left">
            {user && (
              <div className="app_header_left_info">
                <Avatar src="" alt={user.displayName}/>
                <h3>{user.displayName}</h3>
              </div>
            )}
        </div>
        <div className="app_header_center">
          <h1>Instagram Clone</h1>
        </div>
        <div className="app_header_right">
          {user ? (
            <div>
              <button className="upload_btn" onClick={() => setShowUpload(true)}>+</button>
              <button className="logout_btn" onClick={() => auth.signOut()}>LogOut</button>
            </div>
            ) : (
            <div className="app_loginContainer">
              <button className="signin_btn btn" onClick={() => setOpenSignIn(true)}>Sign In</button>
              <button className="signup_btn btn" onClick={() => setOpen(true)}>Sign Up</button>
            </div>
          )}
        </div>
      </div>
      {
          !user && <p className="warning">Please Login in to post or to comment</p>
      }
      {/* Posts */}
      {
        posts.map(({id,post}) => (<Post key={id} postId={id} user={user} username={post.username} caption={post.caption} imageUrl={post.imageUrl}/>))
      }

    </div>
  );
}

export default App;
