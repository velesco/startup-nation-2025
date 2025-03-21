const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide meeting title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters']
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Meeting must be associated with a group']
    },
    date: {
      type: Date,
      required: [true, 'Please provide a meeting date']
    },
    endDate: {
      type: Date
    },
    duration: {
      type: Number, // in minutes
      default: 120,
      min: [15, 'Meeting duration must be at least 15 minutes']
    },
    location: {
      type: String,
      trim: true,
      default: 'Online'
    },
    locationDetails: {
      address: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number
      },
      meetingUrl: String,
      meetingId: String,
      meetingPassword: String
    },
    description: {
      type: String,
      trim: true
    },
    agenda: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['Planned', 'InProgress', 'Completed', 'Cancelled'],
      default: 'Planned'
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify meeting organizer']
    },
    attendance: [
      {
        client: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Client',
          required: true
        },
        status: {
          type: String,
          enum: ['Confirmed', 'Attended', 'Absent', 'Excused'],
          default: 'Confirmed'
        },
        checkinTime: Date,
        feedback: String,
        notes: String
      }
    ],
    materials: [
      {
        name: {
          type: String,
          required: true
        },
        description: {
          type: String
        },
        path: {
          type: String,
          required: true
        },
        mimeType: {
          type: String
        },
        size: {
          type: Number
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        uploadDate: {
          type: Date,
          default: Date.now
        }
      }
    ],
    notes: {
      type: String,
      trim: true
    },
    recurring: {
      type: Boolean,
      default: false
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ['Daily', 'Weekly', 'Biweekly', 'Monthly'],
      },
      interval: {
        type: Number,
        min: 1,
        default: 1
      },
      endDate: Date,
      daysOfWeek: [Number] // 0 = Sunday, 1 = Monday, etc.
    },
    reminders: [
      {
        time: {
          type: Number, // minutes before meeting
          required: true
        },
        type: {
          type: String,
          enum: ['Email', 'Push', 'SMS'],
          default: 'Email'
        },
        sent: {
          type: Boolean,
          default: false
        },
        sentAt: Date
      }
    ],
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for attendance count
MeetingSchema.virtual('attendanceCount').get(function() {
  if (!this.attendance) return 0;
  return this.attendance.filter(a => a.status === 'Attended').length;
});

// Virtual field for attendance percentage
MeetingSchema.virtual('attendancePercentage').get(function() {
  if (!this.attendance || this.attendance.length === 0) return 0;
  const attended = this.attendance.filter(a => a.status === 'Attended').length;
  return Math.round((attended / this.attendance.length) * 100);
});

module.exports = mongoose.model('Meeting', MeetingSchema);
