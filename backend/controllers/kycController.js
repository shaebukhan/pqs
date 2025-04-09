const kycModel = require("../models/kycModel");
const UserModel = require("../models/UserModel");
const createTransporter = require("../config/emailConfig");
const cloudinary = require("../utilis/cloudinaryConfig");
const { generateSign, generateRandomString, getChainIdForAsset } = require("../helpers/walletHelper");
const WalletModel = require("../models/WalletModel");
const axios = require('axios');
const ChainData = require("../helpers/ChainData");
//add kyc

const newKycController = async (req, res) => {
    const {
        id, email, firstName, lastName, phone, dob, gender, postal, address, street, city, state, country, designation, identityType, companyName, companyRegNum
    } = req.body;


    const files = req.files;
    // Input Validation
    if (!id || !email) {
        return res.status(200).json({
            success: false,
            message: 'User ID and Email are required.',
        });
    }



    try {
        // Find the user by ID
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(201).json({ success: false, message: 'User not found.' });
        }

        // Helper function to upload a file to Cloudinary
        const uploadToCloudinary = (fileBuffer, folder) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({
                    resource_type: 'auto',
                    folder: `kyc-documents/${folder}`
                }, (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        reject("Error uploading file");
                    } else {
                        resolve(result.secure_url);
                    }
                });

                // Convert the file buffer into a readable stream and pipe it to Cloudinary
                const bufferStream = require('stream').Readable.from(fileBuffer);
                bufferStream.pipe(stream);
            });
        };

        // Prepare data for the KYC entry, uploading files to Cloudinary if they exist
        const kycData = {
            userID: id,
            userEmail: email,
            identityType,
            firstName,
            lastName,
            phone,
            dob,
            gender,
            postal,
            address,
            street,
            city,
            state,
            country,
            designation,
            companyName,
            companyRegNum,
            idCardImage: files.nationalId ? await uploadToCloudinary(files.nationalId[0].buffer, 'nationalId') : null,
            proofOfResidence: files.proofOfResidence ? await uploadToCloudinary(files.proofOfResidence[0].buffer, 'proofOfResidence', 'raw') : null,
            signature: files.signature ? await uploadToCloudinary(files.signature[0].buffer, 'signature') : null,
            listDirectors: files.listDirectors ? await uploadToCloudinary(files.listDirectors[0].buffer, 'listDirectors', 'raw') : null,
            listShareHolders: files.listShareHolders ? await uploadToCloudinary(files.listShareHolders[0].buffer, 'listShareHolders', 'raw') : null,
            listBeneficialOwners: files.listBeneficialOwners ? await uploadToCloudinary(files.listBeneficialOwners[0].buffer, 'listBeneficialOwners', 'raw') : null,
            listOwnersHoldings: files.listOwnersHoldings ? await uploadToCloudinary(files.listOwnersHoldings[0].buffer, 'listOwnersHoldings', 'raw') : null,
            certificate: files.certificate ? await uploadToCloudinary(files.certificate[0].buffer, 'certificate', 'raw') : null,
            memorandum: files.memorandum ? await uploadToCloudinary(files.memorandum[0].buffer, 'memorandum', 'raw') : null,
            financialAccounts: files.financialAccounts ? await uploadToCloudinary(files.financialAccounts[0].buffer, 'financialAccounts', 'raw') : null,
        };

        // Save the new KYC entry in the database
        const newKyc = new kycModel(kycData);
        await newKyc.save();

        // Update user's KYC status
        user.kycstatus = 1;
        await user.save();

        await sendKycEmail(email, firstName, lastName);

        return res.status(201).send({ success: true, message: 'KYC information saved successfully.' });
    } catch (error) {
        console.error('KYC information error:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
};

//update 
const updateUserKycController = async (req, res) => {
    const {
        id, email, firstName, lastName, phone, gender, postal, address, street, city, state
    } = req.body;
    // Validate input
    if (!id) {
        return res.status(200).json({
            success: false,
            message: 'KYC ID is required.',
        });
    }

    try {
        // Find the KYC entry by ID
        const kyc = await kycModel.findById(id);
        if (!kyc) {
            return res.status(404).json({ success: false, message: 'KYC entry not found.' });
        }

        // Update fields in the KYC entry
        kyc.userEmail = email || kyc.userEmail;
        kyc.firstName = firstName || kyc.firstName;
        kyc.lastName = lastName || kyc.lastName;
        kyc.phone = phone || kyc.phone;
        kyc.gender = gender || kyc.gender;
        kyc.postal = postal || kyc.postal;
        kyc.address = address || kyc.address;
        kyc.street = street || kyc.street;
        kyc.city = city || kyc.city;
        kyc.state = state || kyc.state;
        // Save updated KYC entry
        await kyc.save();

        return res.status(200).json({
            success: true,
            message: 'KYC information updated successfully.',
            kyc,
        });
    } catch (error) {
        console.error('Error updating KYC information:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
};



//get all Kyc 

const getAllKycController = async (req, res) => {
    try {
        // Fetch all transactions
        const kycs = await kycModel.find({});
        if (!kycs || kycs.length === 0) {
            return res.status(204).json({ success: false, message: "No kyc found" });
        }
        return res.status(200).send({
            success: true,
            kycs
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in fetching kycs",
            error,
        });
    }
};
//update controller
// const updateKycController = async (req, res) => {
//     try {
//         const { status, reason } = req.body;
//         const { id } = req.params;

//         // Find the KYC entry by its ID
//         const kyc = await kycModel.findById(id);
//         if (!kyc) {
//             return res.status(404).send({
//                 success: false,
//                 message: "KYC not found",
//             });
//         }

//         // Find the related user by user ID stored in KYC entry
//         const user = await UserModel.findById(kyc.userID);
//         if (!user) {
//             return res.status(404).send({
//                 success: false,
//                 message: "User not found",
//             });
//         }

//         // Update the KYC status
//         kyc.status = status;
//         await kyc.save();

//         // Send email and update user KYC status based on approval or rejection
//         if (status === 1) { 

//             await KycAcceptedEmail(kyc.userEmail, kyc.firstName, kyc.lastName);
//             user.kycstatus = 2;
//         } else if (status === 2) {
//             if (!reason) {
//                 return res.status(200).send({
//                     success: false,
//                     message: "KYC Rejected",
//                 });
//             }
//             await KycRejectedEmail(kyc.userEmail, kyc.firstName, kyc.lastName, reason);
//             user.kycstatus = 3;
//         }
//         await user.save();

//         return res.status(200).send({
//             success: true,
//             message: "KYC updated successfully",
//         });
//     } catch (error) {
//         console.error("Error in updating KYC status:", error);
//         return res.status(500).send({
//             success: false,
//             message: "Error in updating KYC status",
//             error: error.message || error,
//         });
//     }
// };
const updateKycController = async (req, res) => {
    try {
        const { status, reason } = req.body;
        const { id } = req.params;

        // Find the KYC entry by its ID
        const kyc = await kycModel.findById(id);
        if (!kyc) {
            return res.status(200).send({
                success: false,
                message: "KYC not found",
            });
        }

        // Find the related user by user ID stored in the KYC entry
        const user = await UserModel.findById(kyc.userID);
        if (!user) {
            return res.status(200).send({
                success: false,
                message: "User not found",
            });
        }

        // Update the KYC status
        kyc.status = status;
        await kyc.save();

        // Handle KYC approval
        if (status === 1) {
            // Send KYC approval email
            await KycAcceptedEmail(kyc.userEmail, kyc.firstName, kyc.lastName);
            user.kycstatus = 2;

            // Add KYC details to the user's profile
            const kycDetails = {
                identityType: kyc.identityType || "",
                firstName: kyc.firstName || kyc.companyName,
                lastName: kyc.lastName,
                phone: kyc.phone,
                dob: kyc.dob,
                gender: kyc.gender,
                postal: kyc.postal,
                address: kyc.address,
                street: kyc.street,
                city: kyc.city,
                state: kyc.state,
                country: kyc.country,
                designation: kyc.designation,
            };

            // Ensure `profile.details` exists and is an array
            if (!Array.isArray(user.profile.details)) {
                user.profile.details = [];
            }

            // Add KYC details to the profile
            user.profile.details.push(kycDetails);

            // Loop through each asset and create a wallet
            for (const chainData of ChainData) {
                const apiKey = process.env.CREGIS_API;
                const requestParams = {
                    pid: process.env.CREGIS_PID,
                    callback_url: 'https://www.pqs.fund/',
                    chain_id: chainData.chain_id, // Use chain_id from ChainData
                    alias: chainData.name, // Use asset name as alias
                    nonce: generateRandomString(6), // Generate a random 6-character string
                    timestamp: Math.floor(Date.now() / 1000), // Current timestamp in seconds
                };

                // Generate the 'sign' parameter
                const sign = generateSign(apiKey, requestParams);

                const finalRequestParams = { ...requestParams, sign };

                // Make the POST request to create a wallet
                const response = await axios.post('https://t-ayekrgpo.cregis.io/api/v1/address/create', finalRequestParams);

                if (response.data.code === '00000' && response.data.data.address) {
                    console.log(response.data.data.address);

                    // Save the wallet address to the database
                    const newWallet = new WalletModel({
                        userId: user._id,
                        asset: chainData.name,
                        wallet: response.data.data.address,
                    });
                    await newWallet.save();
                } else {
                    console.error(`Failed to create wallet for asset ${chainData.name}:`, response.data);
                }
            }
        } else if (status === 2) {
            // Handle KYC rejection
            if (!reason) {
                return res.status(400).send({
                    success: false,
                    message: "Rejection reason is required",
                });
            }
            await KycRejectedEmail(kyc.userEmail, kyc.firstName, kyc.lastName, reason);
            user.kycstatus = 3;
        }

        // Save the updated user
        await user.save();

        return res.status(200).send({
            success: true,
            message: "KYC updated successfully",
        });
    } catch (error) {
        console.error("Error in updating KYC status:", error);
        return res.status(500).send({
            success: false,
            message: "Error in updating KYC status",
            error: error.message || error,
        });
    }
};

//get single 

const getSingleKycController = async (req, res) => {
    try {
        const { id } = req.params; // Extract the user ID from the route parameter

        // Find the user by ID
        const kyc = await kycModel.findById(id);

        if (!kyc) {
            return res.status(204).json({ success: false, message: 'KYC not found' });
        }

        // Respond with success
        res.json({
            success: true,
            kyc
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
//get user kyc data 
const getSingleKycUserController = async (req, res) => {
    try {
        const { userID } = req.params;
        const kyc = await kycModel.findOne({ userID, status: 1 });
        if (!kyc) {
            return res.status(201).json({ success: false, message: 'Data not found' });
        }

        // Respond with success
        res.json({
            success: true,
            kyc
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
const sendKycEmail = async (email, firstName, lastName) => {
    // Configure the email transport using nodemailer
    const transporter = createTransporter();

    // Email options
    const mailOptions = {
        from: process.env.AUTH_EMAIL_P, // Change sender to a more professional address
        to: email,
        subject: 'KYC Submission',
        html: `
        <div style="background: #0E2340; text-align: center;">
            <h1 style="font-size: 45px; font-weight: bold; background: #0E2340; color:#fff;padding:10px 0px;">PQS</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h5 style="color: #333; font-size: 16px; margin-bottom: 5px;">Dear <span >${firstName + " " + lastName}</span>,</h5>
             
            <p style="color: #333; font-size: 16px; margin-bottom: 5px;">
            Your application has been received by our compliance team and we will revert to you shortly.
</p>
             
            <h5 style="color: #333; font-size: 16px; margin-bottom: 5px;">Kind regards ,<br>PQS Compliance team</h5>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 13px;">
            <h6>This is an automated message, please do not reply to this email.</h6>
        </div>`
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

const KycAcceptedEmail = async (email, firstName, lastName) => {
    // Configure the email transport using nodemailer
    const transporter = createTransporter();

    // Email options
    const mailOptions = {
        from: process.env.AUTH_EMAIL_P, // Change sender to a more professional address
        to: email,
        subject: 'KYC Verification Completion',
        html: `
        <div style="background: #0E2340; text-align: center;">
            <h1 style="font-size: 45px; font-weight: bold; background: #0E2340; color:#fff;padding:10px 0px;">PQS</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h5 style="color: #333; font-size: 16px; margin-bottom: 5px;">Dear <span >${firstName + " " + lastName}</span>,</h5>
             
            <p style="color: #333; font-size: 16px; margin-bottom: 5px;">
            Your application for the Verification of KYC has been Approved. Now You can access our Services.
</p>
             
            <h5 style="color: #333; font-size: 16px; margin-bottom: 5px;">Kind regards ,<br>PQS Compliance team</h5>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 13px;">
            <h6>This is an automated message, please do not reply to this email.</h6>
        </div>`
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

const KycRejectedEmail = async (email, firstName, lastName, reason) => {
    // Configure the email transport using nodemailer
    const transporter = createTransporter();

    // Email options
    const mailOptions = {
        from: process.env.AUTH_EMAIL_P, // Change sender to a more professional address
        to: email,
        subject: 'KYC Verification Completion',
        html: `
        <div style="background: #0E2340; text-align: center;">
            <h1 style="font-size: 45px; font-weight: bold; background: #0E2340; color:#fff;padding:10px 0px;">PQS</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h5 style="color: #333; font-size: 16px; margin-bottom: 5px;">Dear <span >${firstName + " " + lastName}</span>,</h5>
             
            <p style="color: #333; font-size: 16px; margin-bottom: 5px;">
            Your application for the Verification of KYC has not been  Approved. Your details are rejected due to following reason: ${reason}.
</p>
             
            <h5 style="color: #333; font-size: 16px; margin-bottom: 5px;">Kind regards ,<br>PQS Compliance team</h5>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 13px;">
            <h6>This is an automated message, please do not reply to this email.</h6>
        </div>`
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};
module.exports = { newKycController, getAllKycController, updateKycController, updateUserKycController, getSingleKycController, getSingleKycUserController };