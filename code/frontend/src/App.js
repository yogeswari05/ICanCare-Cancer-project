import DoctorsChat from './pages/DoctorsChat';

function App() {
  return (
    <Router>
      <Routes>
        {/* existing routes */}
        <Route path="/case/:caseId/chat" element={<Chat />} />
        <Route path="/case/:caseId/doctors-chat" element={<DoctorsChat />} />
        {/* other routes */}
      </Routes>
    </Router>
  );
}

export default App;