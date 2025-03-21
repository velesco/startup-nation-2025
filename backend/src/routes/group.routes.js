const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupClients,
  getGroupMeetings,
  createGroupMeeting,
  updateGroupMeeting,
  deleteGroupMeeting,
  addClientsToGroup,
  removeClientFromGroup,
  sendEmailToGroupMembers
} = require('../controllers/group.controller');

// Protect all routes
router.use(protect);
router.use(authorize('admin', 'partner'));

// Group CRUD routes
router.route('/')
  .get(getGroups)
  .post(createGroup);

router.route('/:id')
  .get(getGroupById)
  .put(updateGroup)
  .delete(deleteGroup);

// Group clients
router.route('/:id/clients')
  .get(getGroupClients)
  .post(addClientsToGroup);

router.delete('/:id/clients/:clientId', removeClientFromGroup);

// Group meetings
router.route('/:id/meetings')
  .get(getGroupMeetings)
  .post(createGroupMeeting);

router.route('/:id/meetings/:meetingId')
  .put(updateGroupMeeting)
  .delete(deleteGroupMeeting);

// Send email to group members
router.post('/:id/send-email', sendEmailToGroupMembers);

module.exports = router;