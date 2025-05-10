import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
   Container,
   Box,
   Paper,
   TextField,
   Button,
   Typography,
   CircularProgress,
   Alert,
   Avatar,
   Chip,
   Divider,
   IconButton,
   Tooltip,
   InputAdornment,
   Fade,
   useTheme,
   Popover,
   FormGroup,
   FormControlLabel,
   Checkbox
} from '@mui/material';
import { 
   Send as SendIcon,
   ArrowBack,
   MedicalServices,
   AccessTime,
   Person,
   LocalHospital,
   Label as LabelIcon,
   Flag as FlagIcon,
   Help as HelpIcon,
   AssignmentLate as FollowUpIcon,
   MoreVert as MoreVertIcon,
   Reply as ReplyIcon,
   Close as CloseIcon,
   Search as SearchIcon,
   FilterList as FilterListIcon,
   Clear as ClearIcon,
   CheckBox as CheckBoxIcon,
   CheckBoxOutlineBlank as CheckBoxBlankIcon
} from '@mui/icons-material';
import { 
   Menu,
   MenuItem,
   ListItemIcon,
   ListItemText,
   Zoom
} from '@mui/material';
import axios from 'axios';
import Layout from '../components/NavBar.jsx';
import { toast } from 'react-toastify';

const ChatRoom = () => {
   const { caseId } = useParams();
   const [messages, setMessages] = useState([]);
   const [newMessage, setNewMessage] = useState('');
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [caseDetails, setCaseDetails] = useState(null);
   const [sendingMessage, setSendingMessage] = useState(false);
   const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
   const [userId, setUserId] = useState(localStorage.getItem('userId'));
   const [tagMenuAnchorEl, setTagMenuAnchorEl] = useState(null);
   const [selectedMessageId, setSelectedMessageId] = useState(null);
   const [messagesTags, setMessagesTags] = useState({});
   const [replyTo, setReplyTo] = useState(null);
   const [messageReplies, setMessageReplies] = useState({});
   const [searchText, setSearchText] = useState('');
   const [filterAnchorEl, setFilterAnchorEl] = useState(null);
   const [filters, setFilters] = useState({
      tags: {
         important: false,
         question: false,
         followup: false
      },
      senders: {
         doctor: true,
         patient: true
      },
      onlyMyMessages: false
   });
   
   const messagesEndRef = useRef(null);
   const theme = useTheme();
   const navigate = useNavigate();
   
   if (!localStorage.getItem('token')) {
      return <Navigate to="/auth" />;
   }
   
   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   };

   useEffect(() => {
      fetchMessages();
      fetchCaseDetails();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
   }, [caseId]);

   useEffect(() => {
      scrollToBottom();
   }, [messages]);

   const fetchCaseDetails = async () => {
      try {
         const response = await axios.get(`http://localhost:5000/api/case/${caseId}`, {
               headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
         });
         setCaseDetails(response.data);
      } catch (err) {
         console.error("Error fetching case details:", err);
      }
   };

const fetchMessages = async () => {
   try {
      const response = await axios.get(`http://localhost:5000/api/chat/${caseId}`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const fetchedMessages = response.data;
      setMessages(fetchedMessages);
      
      // Build tag information from fetched messages
      const updatedTags = {};
      fetchedMessages.forEach((message) => {
         if (message.tags) {
            updatedTags[message._id] = message.tags;
         }
      });
      setMessagesTags(updatedTags);
      
      // Build reply relationships from fetched messages
      const updatedReplies = {};
      fetchedMessages.forEach((message) => {
         if (message.replyTo) {
            updatedReplies[message._id] = message.replyTo;
         }
      });
      setMessageReplies(updatedReplies);

      setLoading(false);
   } catch (err) {
      setError(err.message);
      setLoading(false);
   }
};

   const handleSendMessage = async () => {
      if (!newMessage.trim()) return;
   
      setSendingMessage(true);
      try {
         const messageData = { 
            content: newMessage,
         };
   
         // Include replyTo information if replying to a message
         if (replyTo) {
            messageData.replyTo = replyTo._id;
         }
   
         const response = await axios.post(
            `http://localhost:5000/api/chat/${caseId}/message`,
            messageData,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
         );
         
         if (replyTo) {
            setMessageReplies(prev => ({
               ...prev,
               [response.data?._id || `temp-${Date.now()}`]: replyTo._id
            }));
            setReplyTo(null);
         }
         
         setNewMessage('');
         fetchMessages();
      } catch (err) {
         toast.error(`Failed to send message: ${err.response?.data?.message || err.message}`);
         console.error('Error sending message:', err);
      } finally {
         setSendingMessage(false);
      }
   };

   const getInitials = (name) => {
      if (!name) return '?';
      return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
   };

   const getAvatarColor = (senderModel, senderId) => {
      if (senderModel === 'Patient') return theme.palette.error.main;
      if (caseDetails?.primaryDoctor?._id === senderId) return theme.palette.success.main;
      return theme.palette.primary.main;
   };

   const getBubbleColors = (isSender) => {
      if (isSender) {
         return {
               background: theme.palette.primary.main,
               text: '#ffffff'
         };
      } else {
         return {
               background: '#f0f0f0',
               text: '#000000'
         };
      }
   };

   const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
   };
   
   const formatDate = (timestamp) => {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
         return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
         return 'Yesterday';
      } else {
         return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
         });
      }
   };

   const groupedMessages = messages.reduce((groups, message) => {
      const date = formatDate(message.timestamp);
      if (!groups[date]) {
         groups[date] = [];
      }
      groups[date].push(message);
      return groups;
   }, {});

   const tagTypes = {
      important: { 
         label: 'Important', 
         color: '#f44336', 
         icon: 'FlagIcon' 
      },
      question: { 
         label: 'Question', 
         color: '#2196f3', 
         icon: 'HelpIcon' 
      },
      followup: { 
         label: 'Follow-up', 
         color: '#ff9800', 
         icon: 'FollowUpIcon' 
      }
   };

   const renderTagIcon = (iconName) => {
      const icons = {
         FlagIcon: <FlagIcon fontSize="small" />,
         HelpIcon: <HelpIcon fontSize="small" />,
         FollowUpIcon: <FollowUpIcon fontSize="small" />,
      };
      return icons[iconName] || <LabelIcon fontSize="small" />;
   };

   const normalizeTag = (tag) => {
      if (!tag) return null;
      
      // Extract the tag value safely depending on what type it is
      let tagValue;
      if (typeof tag === 'string') {
         tagValue = tag;
      } else if (typeof tag === 'object') {
         // Handle when tag is an object with various possible properties
         tagValue = tag.label || tag.name || tag.type || tag.value || Object.keys(tag)[0] || '';
      } else {
         // Fallback for any other types
         return null;
      }
      
      // Now that we have a string, normalize it
      const normalizedTag = tagValue.toLowerCase().replace(/[^a-z]/g, "");
      
      // Check against known tag types
      return Object.keys(tagTypes).find(
         (key) =>
            key === normalizedTag ||
            tagTypes[key].label.toLowerCase().replace(/[^a-z]/g, "") === normalizedTag
      );
   };

   useEffect(() => {
      const savedTags = localStorage.getItem(`messageTags_${caseId}`);
      if (savedTags) {
         try {
            setMessagesTags(JSON.parse(savedTags));
         } catch (e) {
            console.error('Error parsing saved message tags:', e);
            setMessagesTags({});
         }
      }
   }, [caseId]);

   useEffect(() => {
      if (Object.keys(messagesTags).length > 0) {
         localStorage.setItem(`messageTags_${caseId}`, JSON.stringify(messagesTags));
      }
   }, [messagesTags, caseId]);

   useEffect(() => {
      const savedReplies = localStorage.getItem(`messageReplies_${caseId}`);
      if (savedReplies) {
         try {
            setMessageReplies(JSON.parse(savedReplies));
         } catch (e) {
            console.error('Error parsing saved message replies:', e);
            setMessageReplies({});
         }
      }
   }, [caseId]);

   useEffect(() => {
      if (Object.keys(messageReplies).length > 0) {
         localStorage.setItem(`messageReplies_${caseId}`, JSON.stringify(messageReplies));
      }
   }, [messageReplies, caseId]);

   const handleOpenTagMenu = (event, messageId) => {
      event.stopPropagation();
      setTagMenuAnchorEl(event.currentTarget);
      setSelectedMessageId(messageId);
   };

   const handleCloseTagMenu = () => {
      setTagMenuAnchorEl(null);
      setSelectedMessageId(null);
   };

   const handleAddTag = async (tagType) => {
      if (selectedMessageId) {
         try {
            const normalizedTag = normalizeTag(tagType);
            if (!normalizedTag) {
               toast.error("Invalid tag type");
               return;
            }

            await axios.post(
               `http://localhost:5000/api/chat/${caseId}/message/${selectedMessageId}/tags`,
               { tag: normalizedTag },
               { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            setMessagesTags((prev) => ({
               ...prev,
               [selectedMessageId]: normalizedTag,
            }));

            // toast.success("Tag added successfully");
         } catch (err) {
            console.error("Error updating tag:", err);
            if (err.response) {
               toast.error(`Error: ${err.response.data.message}`);
            } else {
               toast.error("Network error. Please try again.");
            }
         }
      }
      handleCloseTagMenu();
   };

   const handleRemoveTag = async (event, messageId) => {
      event.stopPropagation();
      try {
         await axios.post(
            `http://localhost:5000/api/chat/${caseId}/message/${messageId}/tags`,
            { tag: null },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
         );

         setMessagesTags((prev) => {
            const newTags = { ...prev };
            delete newTags[messageId];
            return newTags;
         });
      } catch (err) {
         toast.error("Failed to remove tag");
         console.error("Error removing tag:", err);
      }
   };

   const handleReplyToMessage = (message) => {
      setReplyTo(message);
      document.querySelector('textarea').focus();
   };

   const handleClearReply = () => {
      setReplyTo(null);
   };

   const getReplyingTo = (messageId) => {
      const replyToId = messageReplies[messageId];
      if (!replyToId) return null;
      
      return messages.find(msg => msg._id === replyToId);
   };

   const handleOpenFilterMenu = (event) => {
      setFilterAnchorEl(event.currentTarget);
   };

   const handleCloseFilterMenu = () => {
      setFilterAnchorEl(null);
   };

   const handleFilterChange = (category, key) => {
      setFilters(prev => ({
         ...prev,
         [category]: {
            ...prev[category],
            [key]: !prev[category][key]
         }
      }));
   };

   const handleToggleMyMessages = () => {
      setFilters(prev => ({
         ...prev,
         onlyMyMessages: !prev.onlyMyMessages
      }));
   };

   const handleClearFilters = () => {
      setFilters({
         tags: {
               important: false,
               question: false,
               followup: false
         },
         senders: {
               doctor: true,
               patient: true
         },
      });
      setSearchText('');
   };

   const getActiveFilterCount = () => {
      let count = 0;
      Object.values(filters.tags).forEach(val => { if (val) count++; });
      const senderCount = Object.values(filters.senders).filter(val => !val).length;
      if (senderCount > 0) count++;
      return count;
   };

   const filterMessages = (messages) => {
      return messages.filter(message => {
         // Filter by search text
         if (searchText && !message.content.toLowerCase().includes(searchText.toLowerCase())) {
            return false;
         }
         
         // Filter by sender type
         if (message.senderModel === 'Doctor' && !filters.senders.doctor) {
            return false;
         }
         if (message.senderModel === 'Patient' && !filters.senders.patient) {
            return false;
         }
         
         // Filter by user's own messages
         if (filters.onlyMyMessages) {
            // Check the senderId field which is the correct field based on your UI rendering
            if (message.senderId !== userId) {
               return false;
            }
         }
         
         // Filter by tags
         const anyTagFilterActive = Object.values(filters.tags).some(val => val);
         if (anyTagFilterActive) {
            // Get the message tag from either the API response or local state
            const messageTag = message.tags || messagesTags[message._id];
            
            if (!messageTag) {
               return false;
            }
            
            try {
               // Try to normalize the tag safely
               const normalizedTag = normalizeTag(messageTag);
               
               if (!normalizedTag) {
                  return false;
               }
               
               // Is this tag in our active filters?
               if (!filters.tags[normalizedTag]) {
                  return false;
               }
            } catch (err) {
               console.error("Error processing tag:", err, messageTag);
               return false;
            }
         }
         
         return true;
      });
   };

   const filterGroupedMessages = (groupedMessages) => {
      const filtered = {};
      
      Object.entries(groupedMessages).forEach(([date, messages]) => {
         const filteredMessages = filterMessages(messages);
         if (filteredMessages.length > 0) {
            filtered[date] = filteredMessages;
         }
      });
      
      return filtered;
   };

   const filteredGroupedMessages = filterGroupedMessages(groupedMessages);
   
   const hasFilteredMessages = Object.keys(filteredGroupedMessages).length > 0;

   if (loading) {
      return (
         <Layout>
            <Container maxWidth="lg" sx={{ mt: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
               <CircularProgress size={60} />
               <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
                  Loading messages...
               </Typography>
            </Container>
         </Layout>
      );
   }

   return (
      <Layout>
         <Container maxWidth="lg" sx={{ mt: 0, mb: 0 }}>
            <Paper 
               elevation={0}
               sx={{ 
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: 'calc(100vh - 120px)',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.12)'
               }}
            >
               {/* Chat Header */}
               <Box
                  sx={{
                        p: 2,
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                  }}
               >
                  <Box display="flex" alignItems="center" gap={1.5}>
                        <IconButton 
                           color="inherit" 
                           onClick={() => navigate(`/case/${caseId}`)}
                           sx={{ 
                              bgcolor: 'rgba(255,255,255,0.1)',
                              '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.2)'
                              }
                           }}
                        >
                           <ArrowBack />
                        </IconButton>
                        <Box>
                           <Box display="flex" alignItems="center" gap={1}>
                              <MedicalServices />
                              <Typography variant="h5" fontWeight="bold">
                                    Chat
                              </Typography>
                           </Box>
                           <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.3 }}>
                              {messages.length} messages • {caseDetails?.doctors.length || 0} doctors
                           </Typography>
                        </Box>
                  </Box>
                  
                  <Chip 
                        icon={<AccessTime sx={{ '&&': { color: 'white' } }} />} 
                        label={`Created: ${caseDetails ? new Date(caseDetails.createdAt).toLocaleDateString('en-US', { 
                           month: 'short',
                           day: 'numeric',
                           year: 'numeric'
                        }) : 'Loading...'}`}
                        sx={{ 
                           bgcolor: 'rgba(255,255,255,0.2)', 
                           color: 'white',
                           '& .MuiChip-icon': { color: 'white' }
                        }}
                  />
               </Box>

               {/* Add Search and Filter Bar */}
               <Box
                  sx={{
                        p: 1.5,
                        backgroundColor: 'white',
                        borderBottom: '1px solid #eaeaea',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                  }}
               >
                  <TextField
                        placeholder="Search messages..."
                        size="small"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        sx={{ flex: 1 }}
                        InputProps={{
                           startAdornment: (
                              <InputAdornment position="start">
                                    <SearchIcon color="action" fontSize="small" />
                              </InputAdornment>
                           ),
                           endAdornment: searchText && (
                              <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchText('')}>
                                       <ClearIcon fontSize="small" />
                                    </IconButton>
                              </InputAdornment>
                           ),
                           sx: { 
                              borderRadius: 4,
                              bgcolor: '#f7f7f9'
                           }
                        }}
                  />
                  
                  <Tooltip title="Filter messages">
                        <span>
                           <Button 
                              variant="outlined"
                              color="primary"
                              onClick={handleOpenFilterMenu}
                              startIcon={<FilterListIcon />}
                              endIcon={getActiveFilterCount() > 0 && (
                                 <Box 
                                    sx={{
                                       minWidth: 20,
                                       height: 20,
                                       borderRadius: '50%',
                                       bgcolor: 'primary.main',
                                       color: 'white',
                                       display: 'flex',
                                       alignItems: 'center',
                                       justifyContent: 'center',
                                       fontSize: '0.75rem',
                                       fontWeight: 'bold'
                                    }}
                                 >
                                    {getActiveFilterCount()}
                                 </Box>
                              )}
                              sx={{ 
                                 borderRadius: 4,
                                 borderColor: getActiveFilterCount() > 0 ? 'primary.main' : 'divider',
                                 color: getActiveFilterCount() > 0 ? 'primary.main' : 'text.secondary',
                                 '&:hover': {
                                    bgcolor: 'rgba(25, 118, 210, 0.04)'
                                 }
                              }}
                           >
                              Filter
                           </Button>
                        </span>
                  </Tooltip>
               </Box>

               {/* Messages Area */}
               <Box 
                  sx={{ 
                     flex: 1, 
                     overflowY: 'auto', 
                     p: 3,
                     backgroundColor: '#f5f7fa',
                     display: 'flex',
                     flexDirection: 'column'
                  }}
               >
                  {error && (
                     <Alert 
                        severity="error" 
                        sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                     >
                        {error}
                     </Alert>
                  )}

                  {messages.length === 0 ? (
                     <Box 
                        sx={{ 
                           flex: 1, 
                           display: 'flex', 
                           flexDirection: 'column', 
                           justifyContent: 'center', 
                           alignItems: 'center',
                           textAlign: 'center',
                           p: 4
                        }}
                     >
                        <Avatar sx={{ width: 70, height: 70, mb: 2, bgcolor: 'primary.light' }}>
                           <SendIcon sx={{ fontSize: 36 }} />
                        </Avatar>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                           No messages yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                           Be the first to send a message to this case discussion. All messages are shared with the patient and assigned doctors.
                        </Typography>
                     </Box>
                  ) : !hasFilteredMessages ? (
                        /* New empty state for no results after filtering */
                     <Box 
                        sx={{ 
                           flex: 1, 
                           display: 'flex', 
                           flexDirection: 'column', 
                           justifyContent: 'center', 
                           alignItems: 'center',
                           textAlign: 'center',
                           p: 4
                        }}
                     >
                        <Avatar sx={{ width: 70, height: 70, mb: 2, bgcolor: 'grey.300' }}>
                           <SearchIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
                        </Avatar>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                           No matching messages
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                           Try adjusting your search or filters to find messages.
                        </Typography>
                        <Button 
                           variant="outlined" 
                           startIcon={<ClearIcon />}
                           onClick={handleClearFilters}
                           sx={{ mt: 2 }}
                        >
                           Clear filters
                        </Button>
                     </Box>
                  ) : (
                        <Fade in={true}>
                           <Box>
                              {Object.entries(filteredGroupedMessages).map(([date, dateMessages]) => (
                                 <Box key={date} sx={{ mb: 3 }}>
                                    <Box 
                                       sx={{ 
                                             display: 'flex', 
                                             alignItems: 'center', 
                                             justifyContent: 'center',
                                             mb: 2
                                       }}
                                    >
                                       <Chip 
                                             label={date} 
                                             size="small"
                                             sx={{ 
                                                bgcolor: 'rgba(0,0,0,0.08)', 
                                                color: 'text.secondary',
                                                fontWeight: 500,
                                                fontSize: '0.75rem',
                                                height: 24
                                             }} 
                                       />
                                    </Box>
                                    {dateMessages.map((message, index) => {
                                       const isSender = message.senderId === userId;
                                       const bubbleColors = getBubbleColors(isSender);
                                       const roleColor = getAvatarColor(message.senderModel, message.senderId);
                                       const messageTag = message.tags;
                                       const replyingTo = getReplyingTo(message._id);

                                       return (
                                             <Box
                                                key={index}
                                                sx={{
                                                   display: 'flex',
                                                   flexDirection: 'row',
                                                   justifyContent: isSender ? 'flex-end' : 'flex-start',
                                                   mb: 2,
                                                   position: 'relative'
                                                }}
                                             >
                                                {/* Avatar for non-sender */}
                                                {!isSender && (
                                                   <Avatar 
                                                         sx={{ 
                                                            bgcolor: roleColor,
                                                            width: 38,
                                                            height: 38,
                                                            mr: 1,
                                                            mt: 0.5
                                                         }}
                                                   >
                                                         {getInitials(message.senderName)}
                                                   </Avatar>
                                                )}
                                                
                                                <Box
                                                   sx={{
                                                         maxWidth: '70%',
                                                         minWidth: '120px',
                                                         position: 'relative'
                                                   }}
                                                >
                                                   {/* Display name for non-sender messages */}
                                                   {!isSender && (
                                                         <Box display="flex" alignItems="center" gap={1} sx={{ ml: 1, mb: 0.5 }}>
                                                            <Typography variant="subtitle2" color={roleColor} fontWeight="500">
                                                               {message.senderName} ({message.senderModel})
                                                            </Typography>
                                                         </Box>
                                                   )}
                                                   
                                                   <Box sx={{ position: 'relative' }}>
                                                         {/* Only render the tag bubble if a tag exists */}
                                                         {messageTag && (
                                                            <Zoom in={true}>
                                                               <Box 
                                                                     sx={{ 
                                                                        position: 'absolute',
                                                                        top: -8,
                                                                        right: isSender ? 'auto' : -8,
                                                                        left: isSender ? -8 : 'auto',
                                                                        zIndex: 1,
                                                                        bgcolor: messageTag.color,
                                                                        color: 'white',
                                                                        borderRadius: '50%',
                                                                        width: 24,
                                                                        height: 24,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        cursor: 'pointer',
                                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                                     }}
                                                                     title={messageTag.label}
                                                               >
                                                                     {renderTagIcon(messageTag.icon)}
                                                               </Box>
                                                            </Zoom>
                                                         )}
                                                         
                                                         <Paper
                                                            elevation={0}
                                                            sx={{
                                                               p: 1.5,
                                                               borderRadius: isSender ? '18px 18px 0 18px' : '18px 18px 18px 0',
                                                               backgroundColor: bubbleColors.background,
                                                               color: bubbleColors.text,
                                                               ml: isSender ? 0 : 1,
                                                               position: 'relative',
                                                               boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                                               ...(messageTag && {
                                                                     borderLeft: isSender ? 'none' : `4px solid ${messageTag.color}`,
                                                                     borderRight: isSender ? `4px solid ${messageTag.color}` : 'none',
                                                               }),
                                                               pb: replyingTo ? 0.5 : 1.5, 
                                                            }}
                                                            onMouseEnter={(e) => {
                                                               e.currentTarget.style.opacity = 0.95;
                                                            }}
                                                            onMouseLeave={(e) => {
                                                               e.currentTarget.style.opacity = 1;
                                                            }}
                                                         >
                                                            {/* Add reply preview if this message is a reply */}
                                                            {replyingTo && (
                                                               <Box 
                                                                     sx={{ 
                                                                        p: 1, 
                                                                        mb: 1,
                                                                        borderLeft: `3px solid ${getAvatarColor(replyingTo.senderModel, replyingTo.senderId)}`,
                                                                        bgcolor: 'rgba(0,0,0,0.03)',
                                                                        borderRadius: 1
                                                                     }}
                                                               >
                                                                     <Typography 
                                                                        variant="caption" 
                                                                        color={getAvatarColor(replyingTo.senderModel, replyingTo.senderId)}
                                                                        sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}
                                                                     >
                                                                        Replying to {replyingTo.senderName}
                                                                     </Typography>
                                                                     <Typography 
                                                                        variant="caption" 
                                                                        sx={{ 
                                                                           display: 'block',
                                                                           color: isSender ? 'rgba(255,255,255,0.9)' : 'text.secondary',
                                                                           whiteSpace: 'nowrap',
                                                                           overflow: 'hidden',
                                                                           textOverflow: 'ellipsis',
                                                                           maxWidth: '100%'
                                                                        }}
                                                                     >
                                                                        {replyingTo.content}
                                                                     </Typography>
                                                               </Box>
                                                            )}

                                                            {/* Message content */}
                                                            <Typography sx={{ wordBreak: 'break-word' }}>
                                                               {message.content}
                                                            </Typography>
                                                            
                                                            {/* Only timestamp in the footer, removed tag button */}
                                                            <Typography 
                                                               variant="caption" 
                                                               sx={{ 
                                                                     display: 'block',
                                                                     textAlign: 'right',
                                                                     mt: 0.5,
                                                                     color: isSender ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                                                               }}
                                                            >
                                                               {formatTime(message.timestamp)}
                                                            </Typography>
                                                         </Paper>
                                                   </Box>
                                                </Box>
                                                
                                                {/* Tag button - moved outside message bubble */}
                                                <Box 
                                                   sx={{ 
                                                         display: 'flex',
                                                         flexDirection: 'column',
                                                         justifyContent: 'center',
                                                         ml: 0.5,
                                                         mr: isSender ? 0.5 : 0,
                                                         opacity: 0.7,
                                                         '&:hover': { 
                                                            opacity: 1 
                                                         },
                                                         transition: 'opacity 0.2s'
                                                   }}
                                                >
                                                   <IconButton 
                                                         size="small" 
                                                         onClick={(e) => handleOpenTagMenu(e, message._id)}
                                                         sx={{ 
                                                            p: 0.5,
                                                            bgcolor: 'rgba(0,0,0,0.05)',
                                                            '&:hover': { 
                                                               bgcolor: 'rgba(0,0,0,0.1)' 
                                                            }
                                                         }}
                                                   >
                                                         <LabelIcon fontSize="small" />
                                                   </IconButton>
                                                   
                                                   {/* Reply button */}
                                                   <IconButton 
                                                         size="small" 
                                                         onClick={() => handleReplyToMessage(message)}
                                                         sx={{ 
                                                            p: 0.5,
                                                            bgcolor: 'rgba(0,0,0,0.05)',
                                                            '&:hover': { 
                                                               bgcolor: 'rgba(0,0,0,0.1)' 
                                                            }
                                                         }}
                                                   >
                                                         <ReplyIcon fontSize="small" />
                                                   </IconButton>
                                                </Box>
                                                
                                                {/* Avatar for sender */}
                                                {isSender && (
                                                   <Avatar 
                                                         sx={{ 
                                                            bgcolor: roleColor,
                                                            width: 38,
                                                            height: 38,
                                                            ml: 1,
                                                            mt: 0.5
                                                         }}
                                                   >
                                                         {getInitials(message.senderName)}
                                                   </Avatar>
                                                )}
                                                {isSender && (
                                                   <Box display="flex" alignItems="center" gap={1} sx={{ textAlign: 'right', mb: 0.5 }}>
                                                      <Typography variant="subtitle2" color={roleColor} fontWeight="500">
                                                         {message.senderName} ({message.senderModel})
                                                      </Typography>
                                                   </Box>
                                                )}
                                             </Box>
                                       );
                                    })}
                                 </Box>
                              ))}
                           </Box>
                        </Fade>
                  )}
                  <div ref={messagesEndRef} />
               </Box>

               {/* Message Input Area */}
               <Box
                  sx={{
                        p: 2,
                        backgroundColor: 'white',
                        borderTop: '1px solid #eaeaea',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                  }}
               >
                  {/* Show reply preview if replying to a message */}
                  {replyTo && (
                     <Box 
                        sx={{ 
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'space-between',
                           p: 1,
                           bgcolor: 'rgba(0,0,0,0.03)',
                           borderRadius: 1,
                           mb: 1
                        }}
                     >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <ReplyIcon fontSize="small" color="action" />
                           <Box>
                                 <Typography variant="caption" fontWeight="bold">
                                    Replying to {replyTo.senderName}
                                 </Typography>
                                 <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{ 
                                       display: 'block',
                                       whiteSpace: 'nowrap',
                                       overflow: 'hidden',
                                       textOverflow: 'ellipsis',
                                       maxWidth: '300px'
                                    }}
                                 >
                                    {replyTo.content}
                                 </Typography>
                           </Box>
                        </Box>
                        <IconButton size="small" onClick={handleClearReply}>
                           <CloseIcon fontSize="small" />
                        </IconButton>
                     </Box>
                  )}
                  
                  {/* Message input and send button */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                     <TextField
                        fullWidth
                        variant="outlined"
                        placeholder={replyTo ? "Type your reply..." : "Type your message..."}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        multiline
                        maxRows={4}
                        InputProps={{
                           sx: { 
                              borderRadius: 5,
                              backgroundColor: '#f7f7f9',
                              '&.Mui-focused': {
                                 backgroundColor: 'white'
                              }
                           }
                        }}
                     />
                     
                     <Tooltip title={replyTo ? "Send reply" : "Send message"}>
                        <span>
                           <Button
                              variant="contained"
                              color="primary"
                              disabled={!newMessage.trim() || sendingMessage}
                              onClick={handleSendMessage}
                              sx={{
                                 minWidth: 0,
                                 width: 52,
                                 height: 52,
                                 borderRadius: '50%',
                                 p: 0
                              }}
                           >
                              <SendIcon />
                           </Button>
                        </span>
                     </Tooltip>
                  </Box>
               </Box>
            </Paper>
         </Container>

         {/* Add Tag Menu */}
         <Menu
            anchorEl={tagMenuAnchorEl}
            open={Boolean(tagMenuAnchorEl)}
            onClose={handleCloseTagMenu}
            TransitionComponent={Fade}
            PaperProps={{
               elevation: 3,
               sx: { borderRadius: 2, width: 200 }
            }}
         >
            <MenuItem onClick={() => handleAddTag('important')}>
               <ListItemIcon sx={{ color: tagTypes.important.color }}>
                  <FlagIcon fontSize="small" />
               </ListItemIcon>
               <ListItemText 
                  primary="Mark Important"
                  primaryTypographyProps={{ variant: 'body2' }}
               />
            </MenuItem>
            <MenuItem onClick={() => handleAddTag('question')}>
               <ListItemIcon sx={{ color: tagTypes.question.color }}>
                  <HelpIcon fontSize="small" />
               </ListItemIcon>
               <ListItemText 
                  primary="Mark as Question"
                  primaryTypographyProps={{ variant: 'body2' }}
               />
            </MenuItem>
            <MenuItem onClick={() => handleAddTag('followup')}>
               <ListItemIcon sx={{ color: tagTypes.followup.color }}>
                  <FollowUpIcon fontSize="small" />
               </ListItemIcon>
               <ListItemText 
                  primary="Needs Follow-up"
                  primaryTypographyProps={{ variant: 'body2' }}
               />
            </MenuItem>
            <MenuItem onClick={(e) => handleRemoveTag(e, selectedMessageId)}>
               <ListItemIcon>
                  <ClearIcon fontSize="small" />
               </ListItemIcon>
               <ListItemText 
                  primary="Remove Tag"
                  primaryTypographyProps={{ variant: 'body2' }}
               />
            </MenuItem>
         </Menu>

         {/* Filter Menu Popover */}
         <Popover
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleCloseFilterMenu}
            anchorOrigin={{
               vertical: 'bottom',
               horizontal: 'right',
            }}
            transformOrigin={{
               vertical: 'top',
               horizontal: 'right',
            }}
            PaperProps={{
               elevation: 3,
               sx: { 
                  borderRadius: 2, 
                  width: 280,
                  p: 2
               }
            }}
         >
            <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <Typography variant="subtitle1" fontWeight="bold">
                  Filter Messages
               </Typography>
               <Button 
                  size="small"
                  startIcon={<ClearIcon fontSize="small" />}
                  onClick={handleClearFilters}
                  disabled={getActiveFilterCount() === 0}
               >
                  Clear all
               </Button>
            </Box>
               
            <Divider sx={{ mb: 1.5 }} />
               
            {/* By Message Tags */}
            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 1 }}>
               By Tag
            </Typography>
            <FormGroup sx={{ mb: 2 }}>
               <FormControlLabel 
                  control={
                     <Checkbox 
                        checked={filters.tags.important}
                        onChange={() => handleFilterChange('tags', 'important')}
                        icon={<CheckBoxBlankIcon fontSize="small" />}
                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                        sx={{ color: tagTypes.important.color, '&.Mui-checked': { color: tagTypes.important.color } }}
                     />
                  } 
                  label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                           {renderTagIcon(tagTypes.important.icon)}
                           <Typography variant="body2">Important</Typography>
                        </Box>
                  }
               />
               <FormControlLabel 
                  control={
                        <Checkbox 
                           checked={filters.tags.question}
                           onChange={() => handleFilterChange('tags', 'question')}
                           icon={<CheckBoxBlankIcon fontSize="small" />}
                           checkedIcon={<CheckBoxIcon fontSize="small" />}
                           sx={{ color: tagTypes.question.color, '&.Mui-checked': { color: tagTypes.question.color } }}
                        />
                  } 
                  label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                           {renderTagIcon(tagTypes.question.icon)}
                           <Typography variant="body2">Questions</Typography>
                        </Box>
                  }
               />
               <FormControlLabel 
                  control={
                        <Checkbox 
                           checked={filters.tags.followup}
                           onChange={() => handleFilterChange('tags', 'followup')}
                           icon={<CheckBoxBlankIcon fontSize="small" />}
                           checkedIcon={<CheckBoxIcon fontSize="small" />}
                           sx={{ color: tagTypes.followup.color, '&.Mui-checked': { color: tagTypes.followup.color } }}
                        />
                  } 
                  label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                           {renderTagIcon(tagTypes.followup.icon)}
                           <Typography variant="body2">Follow-ups</Typography>
                        </Box>
                  }
               />
            </FormGroup>
               
            <Divider sx={{ my: 1.5 }} />
               
            {/* By Sender */}
            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 1 }}>
               By Sender
            </Typography>
            <FormGroup sx={{ mb: 2 }}>
               <FormControlLabel 
                  control={
                     <Checkbox 
                        checked={filters.senders.doctor}
                        onChange={() => handleFilterChange('senders', 'doctor')}
                     />
                  } 
                  label={
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocalHospital fontSize="small" color="primary" />
                        <Typography variant="body2">Doctors</Typography>
                     </Box>
                  }
               />
               <FormControlLabel 
                  control={
                     <Checkbox 
                        checked={filters.senders.patient}
                        onChange={() => handleFilterChange('senders', 'patient')}
                     />
                  } 
                  label={
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Person fontSize="small" color="error" />
                        <Typography variant="body2">Patients</Typography>
                     </Box>
                  }
               />
            </FormGroup>
               
            <Divider sx={{ my: 1.5 }} />
            {/* Other Filters */}
         </Popover>
      </Layout >
   );
};

export default ChatRoom;