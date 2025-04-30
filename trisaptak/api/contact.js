// Node.js/Express.js সার্ভার সাইড কোড
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const helmet = require('helmet');

// রেট লিমিটার সেটআপ
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // প্রতি IP 100 রিকুয়েস্ট
});

// সিকিউরিটি হেডার
router.use(helmet());
router.use(express.json());

// কন্টাক্ট ফর্ম API
router.post('/contact', limiter, [
    body('name').trim().isLength({ min: 3 }).escape(),
    body('email').isEmail().normalizeEmail(),
    body('phone').optional().trim().isMobilePhone(),
    body('message').trim().isLength({ min: 10 }).escape()
], async (req, res) => {
    // ভ্যালিডেশন চেক
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // ইমেইল ট্রান্সপোর্টার কনফিগার করুন
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // ইমেইল অপশন
        const mailOptions = {
            from: `"ত্রিসপ্তক ওয়েবসাইট" <${process.env.EMAIL_USER}>`,
            to: process.env.CONTACT_EMAIL,
            subject: 'নতুন যোগাযোগ ফর্ম সাবমিশন',
            text: `
                নাম: ${req.body.name}
                ইমেইল: ${req.body.email}
                ফোন: ${req.body.phone || 'প্রদান করা হয়নি'}
                বার্তা: ${req.body.message}
            `,
            html: `
                <h2>ত্রিসপ্তক - নতুন বার্তা</h2>
                <p><strong>নাম:</strong> ${req.body.name}</p>
                <p><strong>ইমেইল:</strong> ${req.body.email}</p>
                <p><strong>ফোন:</strong> ${req.body.phone || 'প্রদান করা হয়নি'}</p>
                <p><strong>বার্তা:</strong></p>
                <p>${req.body.message}</p>
            `
        };

        // ইমেইল পাঠান
        await transporter.sendMail(mailOptions);

        // সাফল্য রেস্পন্স
        res.status(200).json({ 
            success: true, 
            message: 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে' 
        });

    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'বার্তা পাঠাতে সমস্যা হয়েছে' 
        });
    }
});

module.exports = router;
