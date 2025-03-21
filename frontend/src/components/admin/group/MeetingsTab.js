import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  PlusCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Info, 
  Edit2, 
  Trash2, 
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const MeetingsTab = ({ groupId, meetings, onMeetingsUpdated, setError, setSuccess }) => {
  const navigate = useNavigate();
  const [expandedMeeting, setExpandedMeeting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };
  
  // Format time for display
  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours}h ${mins}m`;
  };
  
  // Toggle meeting expansion
  const toggleMeetingExpansion = (meetingId) => {
    if (expandedMeeting === meetingId) {
      setExpandedMeeting(null);
    } else {
      setExpandedMeeting(meetingId);
    }
  };
  
  // Navigate to add meeting page
  const handleAddMeeting = () => {
    navigate(`/admin/groups/${groupId}/meetings/add`);
  };
  
  // Navigate to edit meeting page
  const handleEditMeeting = (meeting) => {
    navigate(`/admin/groups/${groupId}/meetings/${meeting._id}/edit`);
  };
  
  // Delete meeting
  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Sigur doriți să ștergeți această întâlnire?')) {
      return;
    }
    
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';
      
      const response = await axios.delete(
        `${API_URL}/groups/${groupId}/meetings/${meetingId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        setSuccess('Întâlnire ștearsă cu succes');
        onMeetingsUpdated();
      } else {
        throw new Error(response.data?.message || 'Failed to delete meeting');
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
      setError(error.response?.data?.message || 'Nu s-a putut șterge întâlnirea. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  };
  
  // Sort meetings by date
  const sortedMeetings = [...(meetings || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return (
    <div>
      {/* Add meeting button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleAddMeeting}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg flex items-center shadow-md hover:shadow-lg transition-all"
          disabled={loading}
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          <span>Adaugă întâlnire</span>
        </button>
      </div>
      
      {/* Meetings list */}
      {sortedMeetings.length === 0 ? (
        <div className="glassmorphism rounded-xl p-10 shadow-lg text-center">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Nu există întâlniri programate</h3>
          <p className="text-gray-500 mb-4">Adăugați întâlniri pentru a ține evidența cursurilor și evenimentelor pentru această grupă.</p>
          <button
            onClick={handleAddMeeting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg inline-flex items-center"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>Adaugă prima întâlnire</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedMeetings.map((meeting) => (
            <div key={meeting._id} className="glassmorphism rounded-xl shadow-lg overflow-hidden">
              {/* Meeting header */}
              <div 
                className={`p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 ${
                  isDatePassed(meeting.date) ? 'border-l-4 border-green-500' : ''
                }`}
                onClick={() => toggleMeetingExpansion(meeting._id)}
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{meeting.topic || 'Întâlnire'}</div>
                  <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1">
                    <div className="flex items-center mr-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(meeting.date)}</span>
                    </div>
                    <div className="flex items-center mr-4">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatTime(meeting.duration)}</span>
                    </div>
                    {meeting.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{meeting.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditMeeting(meeting);
                    }}
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMeeting(meeting._id);
                    }}
                    disabled={loading}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  {expandedMeeting === meeting._id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 ml-2" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 ml-2" />
                  )}
                </div>
              </div>
              
              {/* Meeting expanded details */}
              {expandedMeeting === meeting._id && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  {meeting.description && (
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <Info className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Descriere</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-line pl-6 text-sm">
                        {meeting.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Materials section */}
                  {meeting.materials && meeting.materials.length > 0 && (
                    <div>
                      <div className="flex items-center mb-2">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Materiale</span>
                      </div>
                      <div className="pl-6 space-y-2">
                        {meeting.materials.map((material, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <a
                              href={`/api/materials/${material.path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              <span>{material.name}</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to check if date is in the past
const isDatePassed = (dateString) => {
  if (!dateString) return false;
  const meetingDate = new Date(dateString);
  const today = new Date();
  return meetingDate < today;
};

export default MeetingsTab;