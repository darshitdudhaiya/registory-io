const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const Attachment = require('../../models/Attachment');
const { connectToDatabase } = require('../../config/db');

const updateDetails = async (req, res) => {
  try {
    await connectToDatabase();
    const { fullName, dob: dobString, email, mobile, address } = req.body;
    if (!fullName || !dobString || !email || !mobile || !address) {
      return res.status(400).json({ error: 'All fields (Full Name, Date of Birth, Email, Mobile, Address) are required' });
    }
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) {
      return res.status(400).json({ error: 'Invalid Date of Birth' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    const mobileRegex = /^[+]?[0-9\s\-()]{10,20}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({ error: 'Invalid mobile number' });
    }
    const file = req.file;
    const existingAttachment = await Attachment.findOne({ userId: req.user.userId });
    let attachmentSaved = false;
    if (file) {
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: 'Invalid file type. Supported formats: JPG, PNG, PDF.' });
      }
      if (existingAttachment) {
        existingAttachment.filename = file.originalname;
        existingAttachment.mimeType = file.mimetype;
        existingAttachment.size = file.size;
        existingAttachment.data = file.buffer;
        await existingAttachment.save();
      } else {
        const newAttachment = new Attachment({
          userId: req.user.userId,
          filename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          data: file.buffer
        });
        await newAttachment.save();
      }
      attachmentSaved = true;
    } else if (!existingAttachment) {
      return res.status(400).json({ error: 'Supporting document (JPG, PNG, or PDF) is required' });
    }
    await User.findByIdAndUpdate(req.user.userId, {
      $set: {
        'profileDetails.fullName': fullName.trim(),
        'profileDetails.dob': dob,
        'profileDetails.email': email.trim(),
        'profileDetails.mobile': mobile.trim(),
        'profileDetails.address': address.trim(),
        'profileDetails.isSubmitted': true
      }
    });
    return res.json({
      message: 'Personal details and attachment saved successfully',
      attachmentUpdated: attachmentSaved
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error occurred' });
  }
};

const changePassword = async (req, res) => {
  try {
    await connectToDatabase();
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.json({ message: 'Password changed successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error occurred' });
  }
};

module.exports = { updateDetails, changePassword };
