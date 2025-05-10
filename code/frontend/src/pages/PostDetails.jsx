import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, TextField, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import Layout from '../components/NavBar';
import Footer from '../components/Footer';

const PostDetails = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [newReply, setNewReply] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchPostDetails();
    }, [postId]);

    const fetchPostDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/forum/posts/${postId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPost(response.data);
        } catch (error) {
            console.error('Error fetching post details:', error);
            toast.error('Unable to load post details');
        } finally {
            setLoading(false);
        }
    };

    const handleReplySubmit = async () => {
        if (!newReply.trim()) return;

        try {
            const response = await axios.post(
                `http://localhost:5000/api/forum/posts/${postId}/replies`,
                { content: newReply },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );

            setPost({ ...post, replies: [response.data, ...post.replies] });
            setNewReply('');
            toast.success('Reply added successfully');
        } catch (error) {
            console.error('Error adding reply:', error);
            toast.error('Failed to add reply');
        }
    };

    return (
        <Layout>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
                {loading ? (
                    <Typography sx={{ textAlign: 'center', mt: 4 }}>Loading...</Typography>
                ) : (
                    <>
                        <Paper
                            elevation={4}
                            sx={{
                                p: 4,
                                mb: 6,
                                borderRadius: 4,
                                background: 'linear-gradient(135deg, #e3f2fd, #ffffff)',
                                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                            }}
                        >
                            <Typography
                                variant="h5"
                                gutterBottom
                                sx={{
                                    fontWeight: 'bold',
                                    mb: 2,
                                    color: '#1565c0',
                                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                                }}
                            >
                                {post.title}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    mb: 3,
                                    color: '#333',
                                    lineHeight: 1.6,
                                }}
                            >
                                {post.content}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="textSecondary"
                                sx={{
                                    fontStyle: 'italic',
                                }}
                            >
                                {new Date(post.createdAt).toLocaleString()}
                            </Typography>
                        </Paper>
                        <Paper
                            elevation={4}
                            sx={{
                                p: 4,
                                mb: 6,
                                borderRadius: 4,
                                background: 'linear-gradient(135deg, #ffffff, #e3f2fd)',
                                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                            }}
                        >
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                    fontWeight: 'bold',
                                    mb: 2,
                                    color: '#1565c0',
                                }}
                            >
                                Add a Reply
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                variant="outlined"
                                placeholder="Write your reply..."
                                value={newReply}
                                onChange={(e) => setNewReply(e.target.value)}
                                sx={{
                                    mb: 3,
                                    backgroundColor: '#fff',
                                    borderRadius: 1,
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleReplySubmit}
                                disabled={!newReply.trim()}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(90deg, #1565c0, #42a5f5)',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                    '&:disabled': {
                                        background: '#b0bec5',
                                        color: '#ffffff',
                                    },
                                }}
                            >
                                Submit Reply
                            </Button>
                        </Paper>

                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search replies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{
                                mb: 3,
                                backgroundColor: '#fff',
                                borderRadius: 1,
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            }}
                        />

                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                                fontWeight: 'bold',
                                mb: 3,
                                color: '#1565c0',
                                textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)',
                            }}
                        >
                            Replies
                        </Typography>
                        <List>
                            {post.replies
                                .filter((reply) =>
                                    reply.content.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((reply) => (
                                    <React.Fragment key={reply._id}>
                                        <ListItem
                                            alignItems="flex-start"
                                            sx={{
                                                mb: 2,
                                                p: 2,
                                                borderRadius: 3,
                                                background: 'linear-gradient(135deg, #ffffff, #f3f4f6)',
                                                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                                                transition: 'transform 0.3s, box-shadow 0.3s',
                                                '&:hover': {
                                                    transform: 'scale(1.02)',
                                                    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                                                },
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            color: '#1565c0',
                                                        }}
                                                    >
                                                        {reply.author?.name || 'Unknown Author'}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography
                                                            variant="body2"
                                                            color="textPrimary"
                                                            sx={{
                                                                mb: 1,
                                                                lineHeight: 1.6,
                                                            }}
                                                        >
                                                            {reply.content}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            color="textSecondary"
                                                            sx={{
                                                                fontStyle: 'italic',
                                                            }}
                                                        >
                                                            {new Date(reply.createdAt).toLocaleString()}
                                                        </Typography>
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                        <Divider component="li" />
                                    </React.Fragment>
                                ))}
                        </List>
                    </>
                )}
            </Container>
            <Footer />
        </Layout>
    );
};

export default PostDetails;
