import React, { useState, useEffect } from 'react';
import { Container, Typography, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
   const [events, setEvents] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [selectedEvent, setSelectedEvent] = useState(null);
   const navigate = useNavigate();

   useEffect(() => {
      const role = localStorage.getItem('userRole');
      fetchMeetings(role);
   }, []);

   const fetchMeetings = async (role) => {
      try {
         const response = await axios.get(`http://localhost:5000/api/meetings?role=${role}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
         });
         console.log(response.data);
         const events = response.data.map(meeting => ({
            title: meeting.summary,
            start: new Date(meeting.startTime),
            end: new Date(meeting.endTime),
            allDay: false,
            description: meeting.description,
            hangoutLink: meeting.meetLink,
            caseId: meeting.caseId,
            patientId: meeting.patientId,
         }));
         setEvents(events);
         setLoading(false);
      } catch (err) {
         setError(err.message);
         setLoading(false);
      }
   };

   const handleEventClick = (event) => {
      setSelectedEvent(event);
   };

   const handleCloseDialog = () => {
      setSelectedEvent(null);
   };

   if (loading) {
      return (
         <>
            <Container sx={{ mt: 10, display: 'flex', justifyContent: 'center' }}>
               <CircularProgress />
            </Container>
         </>
      );
   }

   return (
      <>
         <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>

               {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

               <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '80vh' }}
                  eventPropGetter={(event) => ({
                     style: {
                        backgroundColor: '#1a73e8',
                        borderRadius: '5px',
                        opacity: 0.8,
                        color: 'white',
                        border: '0px',
                        display: 'block'
                     }
                  })}
                  onSelectEvent={handleEventClick}
               />
         </Container>

         <Dialog open={!!selectedEvent} onClose={handleCloseDialog}>
            <DialogTitle>Meeting Details</DialogTitle>
            <DialogContent>
               {selectedEvent && (
                  <>
                     <Typography variant="h6">{selectedEvent.title}</Typography>
                     <Typography variant="body1">{selectedEvent.description}</Typography>
                     <Typography variant="body2">Start: {new Date(selectedEvent.start).toLocaleString()}</Typography>
                     <Typography variant="body2">End: {new Date(selectedEvent.end).toLocaleString()}</Typography>
                     <Typography variant="body2">Patient: {selectedEvent.patientId}</Typography>
                     {selectedEvent.hangoutLink && (
                        <Typography variant="body2">
                           Link: <a href={selectedEvent.hangoutLink} target="_blank" rel="noopener noreferrer">{selectedEvent.hangoutLink}</a>
                        </Typography>
                     )}
                  </>
               )}
            </DialogContent>
            <DialogActions>
               <Button onClick={handleCloseDialog} color="primary">Close</Button>
            </DialogActions>
         </Dialog>
      </>
   );
};

export default CalendarPage;
