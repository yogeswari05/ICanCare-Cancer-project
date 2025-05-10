import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, TextField, Button, Card, CardContent, CardActionArea } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/NavBar';
import Footer from '../components/Footer';

const DoctorForum = () => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [uniqueUsers, setUniqueUsers] = useState([]);
    const [filterBy, setFilterBy] = useState('title'); 
    const [selectedUser, setSelectedUser] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        const users = [...new Set(posts.map((post) => post.author?.name || 'Unknown Author'))];
        setUniqueUsers(users);
    }, [posts]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/forum/posts', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('Unable to load forum posts');
        } finally {
            setLoading(false);
        }
    };

    const handlePostSubmit = async () => {
        if (!newPost.title.trim() || !newPost.content.trim()) {
            toast.error('Title and content are required');
            return;
        }
        try {
            const newPostData = {
                ...newPost,
                author: { name: 'You' },
                createdAt: new Date().toISOString(), 
                _id: `temp-${Date.now()}`, 
            };
            setPosts([newPostData, ...posts]); 

            const response = await axios.post('http://localhost:5000/api/forum/posts', newPost, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === newPostData._id ? response.data : post
                )
            );

            setNewPost({ title: '', content: '' });
            toast.success('Post added successfully');
        } catch (error) {
            console.error('Error adding post:', error);
            toast.error('Failed to add post');
            setPosts((prevPosts) => prevPosts.filter((post) => !post._id.startsWith('temp-')));
        }
    };

    return (
        <Layout>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        fontWeight: 'bold',
                        textAlign: 'center',
                        mb: 4,
                        color: '#1565c0',
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    Doctor Forum
                </Typography>

                {/* Filter and Search Section */}
                <Paper
                    elevation={4}
                    sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #ffffff, #e3f2fd)',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            alignItems: 'center',
                            flexWrap: 'nowrap',
                        }}
                    >
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder={`Search posts by ${filterBy}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{
                                backgroundColor: '#fff',
                                borderRadius: 1,
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            }}
                        />
                        <TextField
                            select
                            label="Filter By"
                            value={filterBy}
                            onChange={(e) => {
                                setFilterBy(e.target.value);
                                setSelectedUser('');
                            }}
                            SelectProps={{
                                native: true,
                            }}
                            sx={{
                                minWidth: 150,
                                backgroundColor: '#fff',
                                borderRadius: 1,
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <option value="title">Title</option>
                            <option value="content">Content</option>
                            <option value="author">Author</option>
                        </TextField>
                        {filterBy === 'author' && (
                            <TextField
                                select
                                label="Select User"
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                SelectProps={{
                                    native: true,
                                }}
                                sx={{
                                    minWidth: 150,
                                    backgroundColor: '#fff',
                                    borderRadius: 1,
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                <option value="">All Users</option>
                                {uniqueUsers.map((user, index) => (
                                    <option key={index} value={user}>
                                        {user}
                                    </option>
                                ))}
                            </TextField>
                        )}
                    </Box>
                </Paper>

                {/* Create Post */}
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
                        variant="h6"
                        gutterBottom
                        sx={{
                            fontWeight: 'bold',
                            mb: 2,
                            color: '#333',
                        }}
                    >
                        Create a New Post
                    </Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Enter post title..."
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        sx={{
                            mb: 3,
                            backgroundColor: '#fff',
                            borderRadius: 1,
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        }}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        placeholder="Enter post content..."
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
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
                        onClick={handlePostSubmit}
                        disabled={!newPost.title.trim() || !newPost.content.trim()}
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
                        Post
                    </Button>
                </Paper>

                {/* Forum Posts */}
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                        fontWeight: 'bold',
                        mb: 3,
                        color: '#1565c0',
                        textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    Forum Posts
                </Typography>
                {loading ? (
                    <Typography sx={{ textAlign: 'center', mt: 4 }}>Loading...</Typography>
                ) : (
                    <Box>
                        {posts
                            .filter((post) => {
                                if (filterBy === 'title') {
                                    return post.title.toLowerCase().includes(searchQuery.toLowerCase());
                                } else if (filterBy === 'content') {
                                    return post.content.toLowerCase().includes(searchQuery.toLowerCase());
                                } else if (filterBy === 'author') {
                                    return (
                                        (selectedUser === '' ||
                                            post.author?.name === selectedUser) &&
                                        post.author?.name
                                            ?.toLowerCase()
                                            .includes(searchQuery.toLowerCase())
                                    );
                                }
                                return true;
                            })
                            .map((post) => (
                                <Card
                                    key={post._id}
                                    elevation={4}
                                    sx={{
                                        mb: 3,
                                        borderRadius: 4,
                                        background: 'linear-gradient(135deg, #ffffff, #e3f2fd)',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                                        },
                                    }}
                                >
                                    <CardActionArea onClick={() => navigate(`/forum/${post._id}`)}>
                                        <CardContent>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    mb: 1,
                                                    color: '#1565c0',
                                                }}
                                            >
                                                {post.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                sx={{ mb: 1 }}
                                            >
                                                {new Date(post.createdAt).toLocaleString()}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {post.content.slice(0, 100)}...
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            ))}
                    </Box>
                )}
            </Container>
            <Footer />
        </Layout>
    );
};

export default DoctorForum;
