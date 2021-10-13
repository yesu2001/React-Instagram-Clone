import React, { useState, useEffect } from 'react';
import './Post.css';
import {db} from '../firebase.js'
import {Avatar} from '@material-ui/core';
import firebase from 'firebase';

function Post({postId,user,username,imageUrl,caption}) {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');
    useEffect(() => {
        let unsubscribe;
        if(postId) {
            unsubscribe = db.collection('posts').doc(postId).collection("comments").orderBy('timestamp','desc').onSnapshot((snapshot) => {
                setComments(snapshot.docs.map((doc) => doc.data()));
            });
        }

        return () => {
            unsubscribe();
        };
    }, [postId]);

    const postComment = (event) => {
        event.preventDefault();
        db.collection("posts").doc(postId).collection("comments").add({
            text: comment,
            username: user.displayName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        setComment('');
    }

    return (
        <div className="post">
            <div className="post_header">
                <Avatar className="post_avatar" alt="" src="" />
                <h3>{username}</h3>
            </div>
            <img src={imageUrl} alt="" className="post_image"/>
            <div className="post_caption">
                <h4><strong>{username}</strong>: {caption}</h4>
                <button className="like_btn">❤️</button>
                {/* <FormControlLabel control={<Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} name="checkedH" />} label={likeCount} /> */}
            </div>
            <div className="post_comments">
                {
                    comments.map((comment) => (
                        <p>
                            <strong>{comment.username}</strong>  {comment.text}
                        </p>
                    ))
                }
            </div>
            {user && (
                <form className="post_commentbox">
                    <input className="post_input" type="text" placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)}/>
                    <button className="post_button" disabled={!comment} onClick={postComment} type="submit">
                    Post
                    </button>
                </form> 
            )}           
        </div>
    )
}

export default Post