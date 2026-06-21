const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const envPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.error('Missing .env.local');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const parts = trimmed.split('=');
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const uri = envVars['MONGODB_URI'];

const UserSchema = new mongoose.Schema({
  username: String,
  profileDetails: {
    fullName: String,
    dob: Date,
    email: String,
    mobile: String,
    address: String,
    isSubmitted: Boolean,
  }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function testPdfLib() {
  console.log('Connecting to database...');
  await mongoose.connect(uri);
  console.log('Connected!');

  const user = await User.findOne({ username: 'darshitdudhaiya' });
  if (!user) {
    console.error('User darshitdudhaiya not found.');
    await mongoose.disconnect();
    process.exit(1);
  }

  const details = user.profileDetails;
  const formattedDob = details.dob
    ? new Date(details.dob).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  console.log('Generating PDF using pdf-lib...');
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawRectangle({
      x: 0,
      y: height - 120,
      width: width,
      height: 120,
      color: rgb(30 / 255, 27 / 255, 75 / 255),
    });

    page.drawText('USER PROFILE SPECIFICATION', {
      x: 50,
      y: height - 65,
      size: 20,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });

    page.drawText(`Generated on ${new Date().toLocaleDateString('en-US')}`, {
      x: 50,
      y: height - 90,
      size: 10,
      font: helvetica,
      color: rgb(165 / 255, 180 / 255, 252 / 255),
    });

    page.drawText('Personal Details', {
      x: 50,
      y: height - 170,
      size: 15,
      font: helveticaBold,
      color: rgb(30 / 255, 27 / 255, 75 / 255),
    });

    page.drawLine({
      start: { x: 50, y: height - 182 },
      end: { x: width - 50, y: height - 182 },
      thickness: 1,
      color: rgb(229 / 255, 231 / 255, 235 / 255),
    });

    let currentY = height - 215;

    const drawRow = (label, value) => {
      page.drawText(label, {
        x: 50,
        y: currentY,
        size: 11,
        font: helveticaBold,
        color: rgb(107 / 255, 114 / 255, 128 / 255),
      });

      const maxChars = 40;
      if (value.length > maxChars) {
        const line1 = value.substring(0, maxChars);
        const line2 = value.substring(maxChars);
        page.drawText(line1, {
          x: 200,
          y: currentY,
          size: 11,
          font: helvetica,
          color: rgb(17 / 255, 24 / 255, 39 / 255),
        });
        currentY -= 15;
        page.drawText(line2, {
          x: 200,
          y: currentY,
          size: 11,
          font: helvetica,
          color: rgb(17 / 255, 24 / 255, 39 / 255),
        });
      } else {
        page.drawText(value, {
          x: 200,
          y: currentY,
          size: 11,
          font: helvetica,
          color: rgb(17 / 255, 24 / 255, 39 / 255),
        });
      }

      currentY -= 15;

      page.drawLine({
        start: { x: 50, y: currentY },
        end: { x: width - 50, y: currentY },
        thickness: 0.5,
        color: rgb(243 / 255, 244 / 255, 246 / 255),
      });

      currentY -= 20;
    };

    drawRow('Full Name', details.fullName || 'N/A');
    drawRow('Date of Birth', formattedDob);
    drawRow('Email Address', details.email || 'N/A');
    drawRow('Mobile Number', details.mobile || 'N/A');
    drawRow('Residential Address', details.address || 'N/A');

    currentY -= 10;
    page.drawRectangle({
      x: 50,
      y: currentY - 50,
      width: width - 100,
      height: 60,
      color: rgb(249 / 255, 250 / 255, 251 / 255),
      borderColor: rgb(229 / 255, 231 / 255, 235 / 255),
      borderWidth: 1,
    });

    page.drawText('Declaration & Integrity Statement:', {
      x: 65,
      y: currentY - 12,
      size: 9,
      font: helveticaBold,
      color: rgb(55 / 255, 65 / 255, 81 / 255),
    });

    page.drawText('The information provided above represents the accurate and official personal profile details', {
      x: 65,
      y: currentY - 26,
      size: 8.5,
      font: helvetica,
      color: rgb(107 / 255, 114 / 255, 128 / 255),
    });
    
    page.drawText('stored securely in the system registry.', {
      x: 65,
      y: currentY - 38,
      size: 8.5,
      font: helvetica,
      color: rgb(107 / 255, 114 / 255, 128 / 255),
    });

    const pdfBytes = await pdfDoc.save();
    const outPath = path.join(__dirname, '../test_profile_lib.pdf');
    fs.writeFileSync(outPath, pdfBytes);
    console.log('PDF Generated successfully by pdf-lib at:', outPath);
  } catch (error) {
    console.error('PDF Generation Exception:', error);
  }

  await mongoose.disconnect();
}

testPdfLib();
