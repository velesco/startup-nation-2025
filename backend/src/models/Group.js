const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide group name'],
      trim: true,
      unique: true,
      maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date']
    },
    endDate: {
      type: Date
    },
    capacity: {
      type: Number,
      default: 25,
      min: [1, 'Capacity must be at least 1']
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Cancelled', 'Planned'],
      default: 'Planned'
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    meetings: [
      {
        date: {
          type: Date,
          required: true
        },
        duration: {
          type: Number, // in minutes
          default: 120
        },
        location: {
          type: String,
          trim: true
        },
        topic: {
          type: String,
          trim: true
        },
        description: {
          type: String,
          trim: true
        },
        materials: [
          {
            name: {
              type: String,
              required: true
            },
            path: {
              type: String,
              required: true
            }
          }
        ]
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

// Virtual for client count in this group
GroupSchema.virtual('clientCount', {
  ref: 'Client',
  localField: '_id',
  foreignField: 'group',
  count: true
});

module.exports = mongoose.model('Group', GroupSchema);
