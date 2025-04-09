import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import UserSidebar from "./UserSidebar";
import { toast } from "react-toastify";
import UserNav from "./UserNav";
import axios from "axios";
import Loader from "../../components/Loader";
import Countries from "./components/Countries";
import ProgressBar from "./components/ProgressBar";
import { motion } from "framer-motion";
import { MdClear, MdPendingActions, MdUpload } from "react-icons/md";
import { FaCheck } from "react-icons/fa6";
import SignatureCanvas from "react-signature-canvas";
import "currency-flags/dist/currency-flags.min.css";
import ProgressBarCompany from "./components/ProgressBarCompany";

const stepVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};
const Kyc = () => {
  const authDataString = Cookies.get("auth")
    ? JSON.parse(Cookies.get("auth"))
    : null;
  const token = Cookies.get("token");
  const [isSpaceActive, setIsSpaceActive] = useState(false);

  const { email, _id } = authDataString.user;
  const KycStatus = authDataString.user.kycstatus;
  const navigate = useNavigate();
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [final, setFinal] = useState(false);
  // State for Photo ID
  const [photoIdFile, setPhotoIdFile] = useState(null);
  const [photoIdProgress, setPhotoIdProgress] = useState(0);
  const [dragPhotoIdActive, setDragPhotoIdActive] = useState(false);

  // State for Address Proof
  const [addressProofFile, setAddressProofFile] = useState(null);
  const [addressProofProgress, setAddressProofProgress] = useState(0);
  const [dragAddressActive, setDragAddressActive] = useState(false);
  const isImage = addressProofFile?.type?.startsWith("image/");

  //list of directors
  const [listOFDirectorsFile, setListOfDirectorsFile] = useState(null);
  const [listOFDirectorsProgress, setListOfDirectorsProgress] = useState(0);
  const [dragListOfDirectors, setDragListOfDirectors] = useState(false);

  //list of shareholders
  const [listOFShareHoldersFile, setListOfShareHoldersFile] = useState(null);
  const [listOFShareHoldersProgress, setListOfShareHoldersProgress] =
    useState(0);
  const [dragListOfShareHolders, setDragListOfShareHolders] = useState(false);
  //list of beneficial owners
  const [listOFBeneficialOwnersFile, setListOfBeneficialOwnersFile] =
    useState(null);
  const [listOFBeneficialOwnersProgress, setListOfBeneficialOwnersProgress] =
    useState(0);
  const [dragListOfBeneficialOwners, setDragListOfBeneficialOwners] =
    useState(false);
  //list of  Owners holdings
  const [listOFOwnersHoldingsFile, setListOfOwnersHoldingsFile] =
    useState(null);
  const [listOFOwnersHoldingsProgress, setListOfOwnersHoldingsProgress] =
    useState(0);
  const [dragListOfOwnersHoldings, setDragListOfOwnersHoldings] =
    useState(false);
  //   Certificate of Incorporation
  const [certificateOfIncorporationFile, setCertificateOfIncorporationFile] =
    useState(null);
  const [
    certificateOfIncorporationProgress,
    setCertificateOfIncorporationProgress,
  ] = useState(0);
  const [dragCertificateOfIncorporation, setDragCertificateOfIncorporation] =
    useState(false);
  //  Memorandum and articles of Incorporation
  const [memorandumFile, setMemorandumFile] = useState(null);
  const [memorandumProgress, setMemorandumProgress] = useState(0);
  const [dragMemorandum, setDragMemorandum] = useState(false);
  //  LatestFinancialAccounts
  const [latestFinancialAccountsFile, setLatestFinancialAccountsFile] =
    useState(null);
  const [latestFinancialAccountsProgress, setLatestFinancialAccountsProgress] =
    useState(0);
  const [dragLatestFinancialAccounts, setDragLatestFinancialAccounts] =
    useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dob: "",
    gender: "",
    postal: "",
    address: "",
    street: "",
    city: "",
    state: "",
    country: "",
    designation: "",
    identityType: "",
    companyName: "",
    companyAddress: "",
    countryOfInc: "",
    registrationNumber: "",
    email: email,
    id: _id,
  });
  const [errors, setErrors] = useState({}); // To store validation errors

  // Function to toggle the sidebar open/close
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const handleSpaceToggle = () => {
    setIsSpaceActive(!isSpaceActive);
  };
  // Handle form data changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    if (authDataString.user.kycstatus === 1) {
      setFinal(true);
    }
  }, [authDataString.user.kycstatus]);

  // Validation function
  const validateFields = (fields) => {
    const newErrors = {};
    fields.forEach((field) => {
      if (!formData[field]) newErrors[field] = "This field is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    let requiredFields = [];

    if (currentStep === 1) {
      requiredFields = ["identityType"];
      if (!validateFields(requiredFields)) return;

      if (formData.identityType === "company") {
        setCurrentStep(6);
        return;
      }
    } else if (currentStep === 2) {
      requiredFields = [
        "firstName",
        "lastName",
        "phone",
        "dob",
        "gender",
        "postal",
        "address",
        "street",
        "city",
        "state",
        "country",
        "designation",
      ];
    } else if (currentStep === 3) {
      if (!photoIdFile && !addressProofFile) {
        toast.error("Please upload Photo of ID  .");
        return;
      }
      if (!addressProofFile) {
        toast.error("Please upload proof of address.");
        return;
      }
    } else if (currentStep === 4) {
      if (!signatureUrl) {
        toast.error("Please add signature");
        return;
      }
    } else if (currentStep === 6) {
      requiredFields = [
        "companyName",
        "companyAddress",
        "postal",
        "street",
        "city",
        "countryOfInc",
        "registrationNumber",
      ];
    } else if (currentStep === 7) {
      if (!listOFDirectorsFile) {
        toast.error("Please upload List of Directors File");
        return;
      }
      if (!listOFShareHoldersFile) {
        toast.error("Please upload  List of Share Holders File");
        return;
      }
      if (!listOFBeneficialOwnersFile) {
        toast.error(" Please upload List of Ultimate Beneficial Owners File");
        return;
      }
      if (!listOFOwnersHoldingsFile) {
        toast.error(
          " Please upload  List of Beneficial Owners and their % Holdings File"
        );
        return;
      }
      if (!certificateOfIncorporationFile) {
        toast.error(" Please upload Certificate of Incorporation File");
        return;
      }
      if (!memorandumFile) {
        toast.error(
          " Please upload Memorandum and articles of Incorporation File"
        );
        return;
      }
      if (!latestFinancialAccountsFile) {
        toast.error(" Please upload Latest Financial Accounts File");
        return;
      }
    }
    if (validateFields(requiredFields)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (formData.identityType === "company" && currentStep === 6) {
      setCurrentStep(1);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append("id", formData.id);
    data.append("email", formData.email);
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("phone", formData.phone);
    data.append("dob", formData.dob);
    data.append("gender", formData.gender);
    data.append("postal", formData.postal);
    data.append("address", formData.address || formData.companyAddress);
    data.append("street", formData.street);
    data.append("city", formData.city);
    data.append("state", formData.state);
    data.append("country", formData.country || formData.countryOfInc);
    data.append("designation", formData.designation);
    data.append("identityType", formData.identityType);
    data.append("companyName", formData.companyName);
    data.append("companyRegNum", formData.registrationNumber);
    data.append("proofOfResidence", addressProofFile);
    data.append("nationalId", photoIdFile);
    data.append("listDirectors", listOFDirectorsFile);
    data.append("listShareHolders", listOFShareHoldersFile);
    data.append("listBeneficialOwners", listOFBeneficialOwnersFile);
    data.append("listOwnersHoldings", listOFOwnersHoldingsFile);
    data.append("certificate", certificateOfIncorporationFile);
    data.append("memorandum", memorandumFile);
    data.append("financialAccounts", latestFinancialAccountsFile);
    if (signatureUrl) {
      const base64Signature = signatureUrl; // Use as is since it's already shortened
      const byteString = atob(base64Signature.split(",")[1]);
      const mimeString = base64Signature
        .split(",")[0]
        .split(":")[1]
        .split(";")[0];
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uintArray = new Uint8Array(arrayBuffer);

      for (let i = 0; i < byteString.length; i++) {
        uintArray[i] = byteString.charCodeAt(i);
      }

      const signatureBlob = new Blob([arrayBuffer], { type: mimeString });
      data.append("signature", signatureBlob, "signature.png");
    }
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API}/api/v1/kyc/new-kyc`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setFinal(true);
        authDataString.user.kycstatus = 1;
        // Step 3: Set the updated auth data back to the cookie
        Cookies.set("auth", JSON.stringify(authDataString), { expires: 1 });
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit KYC. Try again.");
    } finally {
      setLoading(false); // Hide loader
    }
  };

  const simulateUpload = (setProgress) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setProgress(progress);
      if (progress >= 100) clearInterval(interval);
    }, 200);
  };

  // Handle Drag & Drop Events
  const handleDragOver = (e, setDragActive) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (setDragActive) => {
    setDragActive(false);
  };

  const handleDrop = (e, setFile, setProgress, setDragActive, allowedTypes) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];

    if (file && allowedTypes.includes(file.type)) {
      setFile(file);
      simulateUpload(setProgress);
    } else {
      alert(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`);
    }
  };

  // Handle File Input Change
  const handleFileChange = (
    e,
    setFile,
    setProgress,
    allowedTypes,
    maxSizeMB = 5
  ) => {
    const file = e.target.files[0]; // Get the first file
    const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        alert(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`);
        return;
      }

      if (file.size > maxSizeBytes) {
        alert(`File size exceeds the limit of ${maxSizeMB}MB.`);
        return;
      }

      setFile(file);
      simulateUpload(setProgress);
    }
  };

  const sigPad = useRef(null);

  // Clear the signature canvas
  const clearSignature = () => {
    sigPad.current.clear();
    if (setSignatureUrl) {
      setSignatureUrl(null);
    }
  };

  // Save the signature and pass it to the parent component
  const saveSignature = () => {
    if (sigPad.current.isEmpty()) {
      alert("Please provide a signature.");
      return;
    }

    // Get the Base64 URL of the signature
    const signatureDataURL = sigPad.current
      .getTrimmedCanvas()
      .toDataURL("image/png");
    // Pass the signature back to the parent via signUrl
    if (signatureDataURL) {
      setSignatureUrl(signatureDataURL);
    }

    alert("Signature saved successfully!");
  };

  // Rendering different step components based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="kyc-screen common-prop">
            {KycStatus === 3 ? (
              <>
                <h1 className="text-danger mb-4">KYC Rejected</h1>
                <div className="kyc-text w-50 mb-5">
                  Your KYC was rejected. Please review the requirements and
                  submit a new one.
                </div>
                <button className="new-kyc-btn" onClick={handleNextStep}>
                  Submit New KYC
                </button>
              </>
            ) : (
              <>
                <h1 className="kyc-title mb-4">KYC Verification</h1>
                <div className="kyc-text w-50 mb-5">
                  To ensure the security of your account and comply with
                  regulatory requirements, we need to verify your identity.{" "}
                  <span>This will only take 5 minutes!</span>
                </div>
                <button className="common-kyc-button" onClick={handleNextStep}>
                  Get Started
                </button>
              </>
            )}
          </div>
        );
      case 1:
        return (
          <div className="kyc-screen common-prop">
            <h1 className="kyc-title mb-4">Determine Your Identity</h1>
            <div className="kyc-text w-50 mb-5">
              Please select one from the following options to process your
              application
            </div>
            <div className="select-main">
              <div className="inp-card-radio">
                <div className="d-flex align-items-center">
                  <span className="span-text ms-3">Individual</span>
                </div>
                <input
                  type="radio"
                  name="identityType"
                  value="individual"
                  onChange={handleInputChange}
                />
              </div>
              <div className="inp-card-radio">
                <div className="d-flex align-items-center">
                  <span className="span-text ms-3">Company</span>
                </div>
                <input
                  type="radio"
                  name="identityType"
                  value="company"
                  onChange={handleInputChange}
                />
              </div>
            </div>
            {errors.identityType && (
              <p className="error-text">{errors.identityType}</p>
            )}
            <button className="common-kyc-button" onClick={handleNextStep}>
              Continue
            </button>
          </div>
        );
      case 2:
        return (
          <div className="kyc-screen common-prop">
            <h1 className="kyc-title my-4">Verify Your Identity</h1>
            <div className="personal-info">
              <div className="personal-info-card">
                <div className="per-info-card">
                  <label>Designation</label>
                  <select
                    name="designation"
                    className="personal-inp"
                    value={formData.designation}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                  </select>
                  {errors.designation && (
                    <p className="error-text">{errors.designation}</p>
                  )}
                </div>
                <div className="per-info-card">
                  <label>First Name</label>
                  <input
                    type="text"
                    className="personal-inp"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                  {errors.firstName && (
                    <p className="error-text">{errors.firstName}</p>
                  )}
                </div>
                <div className="per-info-card">
                  <label>Last Name</label>
                  <input
                    type="text"
                    className="personal-inp"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                  {errors.lastName && (
                    <p className="error-text">{errors.lastName}</p>
                  )}
                </div>
                <div className="per-info-card">
                  <label>Phone</label>
                  <input
                    type="number"
                    className="personal-inp"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  {errors.phone && <p className="error-text">{errors.phone}</p>}
                </div>
                <div className="per-info-card">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    className="personal-inp"
                    name="dob"
                    placeholder="Date of Birth"
                    value={formData.dob}
                    onChange={handleInputChange}
                  />
                  {errors.dob && <p className="error-text">{errors.dob}</p>}
                </div>
                <div className="per-info-card">
                  <label>Gender</label>
                  <select
                    name="gender"
                    className="personal-inp"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {errors.gender && (
                    <p className="error-text">{errors.gender}</p>
                  )}
                </div>
                <div className="per-info-card">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    className="personal-inp"
                    name="postal"
                    placeholder="Postal Code"
                    value={formData.postal}
                    onChange={handleInputChange}
                  />
                  {errors.postal && (
                    <p className="error-text">{errors.postal}</p>
                  )}
                </div>

                <div className="per-info-card w-100">
                  <label>Home Address</label>
                  <input
                    type="text"
                    className="personal-inp"
                    name="address"
                    placeholder="Home Address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                  {errors.address && (
                    <p className="error-text">{errors.address}</p>
                  )}
                </div>
                <div className="per-info-card w-100">
                  <label>Street Address</label>
                  <input
                    type="text"
                    className="personal-inp"
                    name="street"
                    placeholder="Street Address"
                    value={formData.street}
                    onChange={handleInputChange}
                  />
                  {errors.street && (
                    <p className="error-text">{errors.street}</p>
                  )}
                </div>
                <div className="per-info-card">
                  <label>City </label>
                  <input
                    type="text"
                    className="personal-inp"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                  {errors.city && <p className="error-text">{errors.city}</p>}
                </div>
                <div className="per-info-card">
                  <label>State </label>
                  <input
                    type="text"
                    className="personal-inp"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                  {errors.state && <p className="error-text">{errors.state}</p>}
                </div>
                <div className="per-info-card">
                  <label>Country</label>
                  <select
                    name="country"
                    className="personal-inp"
                    value={formData.country}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    {Countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="error-text">{errors.country}</p>
                  )}
                </div>
              </div>
              <div className="d-flex justify-content-between my-3">
                <button className="common-kyc-button" onClick={handlePrevStep}>
                  Back
                </button>
                <button className="common-kyc-button" onClick={handleNextStep}>
                  Continue
                </button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="kyc-screen common-prop">
            <h1 className="kyc-title mb-4">Documents</h1>
            <div
              className="documents-main"
              style={{ display: "flex", gap: "20px" }}
            >
              {/* Photo ID */}
              <div className="document-left">
                <div className="d-flex justify-content-between align-items-center">
                  <h4>Photo ID</h4>
                  <div
                    className="upload-icon"
                    onClick={() =>
                      document.getElementById("photoIdInput").click()
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <MdUpload />
                  </div>
                </div>
                <div
                  className={`drag-area ${dragPhotoIdActive ? "active" : ""}`}
                  onDragOver={(e) => handleDragOver(e, setDragPhotoIdActive)}
                  onDragLeave={() => handleDragLeave(setDragPhotoIdActive)}
                  onDrop={(e) =>
                    handleDrop(
                      e,
                      setPhotoIdFile,
                      setPhotoIdProgress,
                      setDragPhotoIdActive,
                      ["image/png", "image/jpeg", "image/jpg"]
                    )
                  }
                >
                  {photoIdFile ? (
                    <>
                      <FaCheck size={30} color="#003399" />
                      <h5 style={{ color: "#003399", marginTop: "10px" }}>
                        Document Uploaded
                      </h5>
                      <div className="text-end w-100">
                        <MdClear
                          size={20}
                          className="upload-icon"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setPhotoIdFile(null);
                            setPhotoIdProgress(0);
                          }}
                        />
                      </div>

                      <div className="progress-bar-file">
                        <div
                          style={{
                            width: `${photoIdProgress}%`,
                            height: "100%",
                            backgroundColor: "#6c63ff",
                            transition: "width 0.2s ease-in-out",
                          }}
                        ></div>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: "#888" }}>
                      Drag and drop your image here
                    </p>
                  )}
                  <input
                    type="file"
                    id="photoIdInput"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange(e, setPhotoIdFile, setPhotoIdProgress, [
                        "image/png",
                        "image/jpeg",
                        "image/jpg",
                      ])
                    }
                    hidden
                  />
                </div>
              </div>

              {/* Address Proof */}
              <div className="document-right">
                <div className="d-flex justify-content-between align-items-center">
                  <h4> Proof of Address</h4>
                  <div
                    className="upload-icon"
                    onClick={() =>
                      document.getElementById("addressProofInput").click()
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <MdUpload size={24} />
                  </div>
                </div>
                <div
                  className={`drag-area ${dragAddressActive ? "active" : ""}`}
                  onDragOver={(e) => handleDragOver(e, setDragAddressActive)}
                  onDragLeave={() => handleDragLeave(setDragAddressActive)}
                  onDrop={(e) =>
                    handleDrop(
                      e,
                      setAddressProofFile,
                      setAddressProofProgress,
                      setDragAddressActive,
                      [
                        "image/png",
                        "image/jpeg",
                        "image/jpg",
                        "application/pdf",
                      ]
                    )
                  }
                >
                  {addressProofFile ? (
                    <>
                      <FaCheck size={30} color="#003399" />
                      <h5 style={{ color: "#003399", marginTop: "10px" }}>
                        Document Uploaded
                      </h5>
                      <div className="w-100 text-end">
                        <MdClear
                          size={20}
                          className="upload-icon"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setAddressProofFile(null);
                            setAddressProofProgress(0);
                          }}
                        />
                      </div>
                      <div className="progress-bar-file">
                        <div
                          style={{
                            width: `${addressProofProgress}%`,
                            height: "100%",
                            backgroundColor: "#6c63ff",
                            transition: "width 0.2s ease-in-out",
                          }}
                        ></div>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: "#888" }}>
                      Drag and drop your image or PDF here
                    </p>
                  )}
                  <input
                    type="file"
                    id="addressProofInput"
                    accept="image/*,application/pdf"
                    onChange={(e) =>
                      handleFileChange(
                        e,
                        setAddressProofFile,
                        setAddressProofProgress,
                        [
                          "image/png",
                          "image/jpeg",
                          "image/jpg",
                          "application/pdf",
                        ]
                      )
                    }
                    hidden
                  />
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end w-100 my-3  ">
              <button className="common-kyc-button" onClick={handlePrevStep}>
                Back
              </button>

              <button className="common-kyc-button" onClick={handleNextStep}>
                Continue
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="kyc-screen common-prop">
            <h1 className="kyc-title mb-4">Signature</h1>
            <div className="w-100">
              <div className="signature-container">
                <div className="signature-pad">
                  <SignatureCanvas
                    ref={sigPad}
                    penColor="#00349A"
                    canvasProps={{
                      className: "sigCanvas",
                    }}
                  />
                </div>
                <div className="signature-buttons">
                  <button onClick={clearSignature}>Clear</button>
                  <button onClick={saveSignature}>Save</button>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end w-100 my-3  ">
              <button className="common-kyc-button" onClick={handlePrevStep}>
                Back
              </button>
              <button className="common-kyc-button" onClick={handleNextStep}>
                Continue
              </button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="kyc-screen common-prop">
            <h2 className="kyc-title my-4">Summary</h2>
            <div className="summary-main">
              <div className="summary-sub">
                <label> Designation </label>
                <span>{formData.designation}</span>
              </div>
              <div className="summary-sub">
                <label>First Name </label>
                <span>{formData.firstName}</span>
              </div>
              <div className="summary-sub">
                <label>Last Name </label>
                <span>{formData.lastName}</span>
              </div>
              <div className="summary-sub">
                <label> Phone </label>
                <span>{formData.phone}</span>
              </div>
              <div className="summary-sub">
                <label>Date of Birth </label>
                <span>{formData.dob}</span>
              </div>
              <div className="summary-sub">
                <label> Gender </label>
                <span>{formData.gender}</span>
              </div>
              <div className="summary-sub">
                <label> Postal Code </label>
                <span>{formData.postal}</span>
              </div>
              <div className="summary-sub">
                <label> Address </label>
                <span>{formData.address}</span>
              </div>
              <div className="summary-sub">
                <label> Street Address </label>
                <span>{formData.street}</span>
              </div>
              <div className="summary-sub">
                <label> City </label>
                <span>{formData.city}</span>
              </div>
              <div className="summary-sub">
                <label> State </label>
                <span>{formData.state}</span>
              </div>
              <div className="summary-sub">
                <label> Country </label>
                <span>{formData.country}</span>
              </div>

              <div className="summary-sub">
                <label> Identity Type </label>
                <span>{formData.identityType}</span>
              </div>
            </div>
            <div className="common-summary">
              <h5>Photo ID </h5>
              <img
                className="summary-img-sub"
                src={URL.createObjectURL(photoIdFile)}
                alt=""
              />
            </div>
            <div className="common-summary">
              <h5 className="pb-3">Address Proof </h5>
              {isImage ? (
                <img
                  className="summary-img-sub"
                  src={URL.createObjectURL(addressProofFile)}
                  alt="Address Proof"
                />
              ) : (
                <Link
                  to={URL.createObjectURL(addressProofFile)}
                  target="_blank"
                  className="view-pdf"
                >
                  View PDF
                </Link>
              )}
            </div>
            <div className="common-summary">
              <h5>Signature</h5>
              <div className="signature-img-container">
                <img
                  className="summary-img-sign"
                  src={signatureUrl}
                  alt="Signature"
                />
              </div>
            </div>

            <div className="summary-btns">
              <button className="common-kyc-button" onClick={handlePrevStep}>
                Back
              </button>
              <button className="common-kyc-button" onClick={handleSubmit}>
                Confirm
              </button>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="kyc-screen common-prop">
            <h1 className="kyc-title my-4">Company Information</h1>
            <div className="personal-info">
              <div className="personal-info-card">
                <div className="per-info-card">
                  <label>Company Name</label>
                  <input
                    type="text"
                    className="personal-inp"
                    name="companyName"
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                  {errors.companyName && (
                    <p className="error-text">{errors.companyName}</p>
                  )}
                </div>
                <div className="per-info-card">
                  <label> Registered Address</label>
                  <input
                    type="text"
                    className="personal-inp"
                    name="companyAddress"
                    placeholder="Company Address"
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                  />
                  {errors.companyAddress && (
                    <p className="error-text">{errors.companyAddress}</p>
                  )}
                </div>
                <div className="per-info-card w-100">
                  <label>Street Address</label>
                  <input
                    type="text"
                    className="personal-inp"
                    name="street"
                    placeholder="Street Address"
                    value={formData.street}
                    onChange={handleInputChange}
                  />
                  {errors.street && (
                    <p className="error-text">{errors.street}</p>
                  )}
                </div>

                <div className="per-info-card">
                  <label>City </label>
                  <input
                    type="text"
                    className="personal-inp"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                  {errors.city && <p className="error-text">{errors.city}</p>}
                </div>
                <div className="per-info-card">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    className="personal-inp"
                    name="postal"
                    placeholder="Postal Code"
                    value={formData.postal}
                    onChange={handleInputChange}
                  />
                  {errors.postal && (
                    <p className="error-text">{errors.postal}</p>
                  )}
                </div>
                <div className="per-info-card">
                  <label>Country of Incorporation</label>
                  <select
                    name="countryOfInc"
                    className="personal-inp"
                    value={formData.countryOfInc}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    {Countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  {errors.countryOfInc && (
                    <p className="error-text">{errors.countryOfInc}</p>
                  )}
                </div>
                <div className="per-info-card">
                  <label>Registration Number</label>
                  <input
                    type="text"
                    className="personal-inp"
                    name="registrationNumber"
                    placeholder="Registration Number"
                    value={formData.registrationNumber}
                    onChange={handleInputChange}
                  />
                  {errors.registrationNumber && (
                    <p className="error-text">{errors.registrationNumber}</p>
                  )}
                </div>
              </div>
              <div className="d-flex justify-content-between my-3">
                <button className="common-kyc-button" onClick={handlePrevStep}>
                  Back
                </button>
                <button className="common-kyc-button" onClick={handleNextStep}>
                  Continue
                </button>
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="kyc-screen common-prop">
            <h1 className="kyc-title mb-4 pt-3">Documents</h1>
            <div
              className="documents-main"
              style={{ display: "flex", gap: "30px" }}
            >
              {/* List of Directors */}
              <div className="document-left">
                <div className="d-flex justify-content-between align-items-center">
                  <h5>List of Directors</h5>
                  <div
                    className="upload-icon"
                    onClick={() =>
                      document.getElementById("listOfDirectors").click()
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <MdUpload />
                  </div>
                </div>
                <div
                  className={`drag-area ${dragListOfDirectors ? "active" : ""}`}
                  onDragOver={(e) => handleDragOver(e, setDragListOfDirectors)}
                  onDragLeave={() => handleDragLeave(setDragListOfDirectors)}
                  onDrop={(e) =>
                    handleDrop(
                      e,
                      setListOfDirectorsFile,
                      setListOfDirectorsProgress,
                      setDragListOfDirectors,
                      ["application/pdf"]
                    )
                  }
                >
                  {listOFDirectorsFile ? (
                    <>
                      <FaCheck size={30} color="#003399" />
                      <h5 style={{ color: "#003399", marginTop: "10px" }}>
                        Document Uploaded
                      </h5>
                      <div className="text-end w-100">
                        <MdClear
                          size={20}
                          className="upload-icon"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setListOfDirectorsFile(null);
                            setListOfDirectorsProgress(0);
                          }}
                        />
                      </div>

                      <div className="progress-bar-file">
                        <div
                          style={{
                            width: `${listOFDirectorsProgress}%`,
                            height: "100%",
                            backgroundColor: "#6c63ff",
                            transition: "width 0.2s ease-in-out",
                          }}
                        ></div>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: "#888" }}>Drag and drop your PDF here</p>
                  )}
                  <input
                    type="file"
                    id="listOfDirectors"
                    accept="application/pdf"
                    onChange={(e) =>
                      handleFileChange(
                        e,
                        setListOfDirectorsFile,
                        setListOfDirectorsProgress,
                        ["application/pdf"]
                      )
                    }
                    hidden
                  />
                </div>
              </div>

              {/* List of Share Holders */}
              <div className="document-right">
                <div className="d-flex justify-content-between align-items-center">
                  <h5>List of Share Holders</h5>
                  <div
                    className="upload-icon"
                    onClick={() =>
                      document.getElementById("ListOfShareHolders").click()
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <MdUpload size={24} />
                  </div>
                </div>
                <div
                  className={`drag-area ${
                    dragListOfShareHolders ? "active" : ""
                  }`}
                  onDragOver={(e) =>
                    handleDragOver(e, setDragListOfShareHolders)
                  }
                  onDragLeave={() => handleDragLeave(setDragListOfShareHolders)}
                  onDrop={(e) =>
                    handleDrop(
                      e,
                      setListOfShareHoldersFile,
                      setListOfShareHoldersProgress,
                      setDragListOfShareHolders,
                      ["application/pdf"]
                    )
                  }
                >
                  {listOFShareHoldersFile ? (
                    <>
                      <FaCheck size={30} color="#003399" />
                      <h5 style={{ color: "#003399", marginTop: "10px" }}>
                        Document Uploaded
                      </h5>
                      <div className="w-100 text-end">
                        <MdClear
                          size={20}
                          className="upload-icon"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setListOfShareHoldersFile(null);
                            setListOfShareHoldersProgress(0);
                          }}
                        />
                      </div>
                      <div className="progress-bar-file">
                        <div
                          style={{
                            width: `${listOFShareHoldersProgress}%`,
                            height: "100%",
                            backgroundColor: "#6c63ff",
                            transition: "width 0.2s ease-in-out",
                          }}
                        ></div>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: "#888" }}>Drag and drop your PDF here</p>
                  )}
                  <input
                    type="file"
                    id="ListOfShareHolders"
                    accept="application/pdf"
                    onChange={(e) =>
                      handleFileChange(
                        e,
                        setListOfShareHoldersFile,
                        setListOfShareHoldersProgress,
                        ["application/pdf"]
                      )
                    }
                    hidden
                  />
                </div>
              </div>

              {/*List of Ultimate Beneficial Owners */}
              <div className="document-right">
                <div className="d-flex justify-content-between align-items-center">
                  <h5>List of Ultimate Beneficial Owners</h5>
                  <div
                    className="upload-icon"
                    onClick={() =>
                      document
                        .getElementById("listOfBeneficialOwnersInput")
                        .click()
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <MdUpload size={24} />
                  </div>
                </div>
                <div
                  className={`drag-area ${
                    dragListOfBeneficialOwners ? "active" : ""
                  }`}
                  onDragOver={(e) =>
                    handleDragOver(e, setDragListOfBeneficialOwners)
                  }
                  onDragLeave={() =>
                    handleDragLeave(setDragListOfBeneficialOwners)
                  }
                  onDrop={(e) =>
                    handleDrop(
                      e,
                      setListOfBeneficialOwnersFile,
                      setListOfBeneficialOwnersProgress,
                      setDragListOfBeneficialOwners,
                      ["application/pdf"]
                    )
                  }
                >
                  {listOFBeneficialOwnersFile ? (
                    <>
                      <FaCheck size={30} color="#003399" />
                      <h5 style={{ color: "#003399", marginTop: "10px" }}>
                        Document Uploaded
                      </h5>
                      <div className="w-100 text-end">
                        <MdClear
                          size={20}
                          className="upload-icon"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setListOfBeneficialOwnersFile(null);
                            setListOfBeneficialOwnersProgress(0);
                          }}
                        />
                      </div>
                      <div className="progress-bar-file">
                        <div
                          style={{
                            width: `${listOFBeneficialOwnersProgress}%`,
                            height: "100%",
                            backgroundColor: "#6c63ff",
                            transition: "width 0.2s ease-in-out",
                          }}
                        ></div>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: "#888" }}>Drag and drop your PDF here</p>
                  )}
                  <input
                    type="file"
                    id="listOfBeneficialOwnersInput"
                    accept="application/pdf"
                    onChange={(e) =>
                      handleFileChange(
                        e,
                        setListOfBeneficialOwnersFile,
                        setListOfBeneficialOwnersProgress,
                        ["application/pdf"]
                      )
                    }
                    hidden
                  />
                </div>
              </div>

              {/*List of Beneficial Owners and their % Holdings */}
              <div className="document-right">
                <div className="d-flex justify-content-between align-items-center">
                  <h5>List of Beneficial Owners and their % Holdings</h5>
                  <div
                    className="upload-icon"
                    onClick={() =>
                      document
                        .getElementById("listOfOwnersHoldingsInput")
                        .click()
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <MdUpload size={24} />
                  </div>
                </div>
                <div
                  className={`drag-area ${
                    dragListOfOwnersHoldings ? "active" : ""
                  }`}
                  onDragOver={(e) =>
                    handleDragOver(e, setDragListOfOwnersHoldings)
                  }
                  onDragLeave={() =>
                    handleDragLeave(setDragListOfOwnersHoldings)
                  }
                  onDrop={(e) =>
                    handleDrop(
                      e,
                      setListOfOwnersHoldingsFile,
                      setListOfOwnersHoldingsProgress,
                      setDragListOfOwnersHoldings,
                      ["application/pdf"]
                    )
                  }
                >
                  {listOFOwnersHoldingsFile ? (
                    <>
                      <FaCheck size={30} color="#003399" />
                      <h5 style={{ color: "#003399", marginTop: "10px" }}>
                        Document Uploaded
                      </h5>
                      <div className="w-100 text-end">
                        <MdClear
                          size={20}
                          className="upload-icon"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setListOfOwnersHoldingsFile(null);
                            setListOfOwnersHoldingsProgress(0);
                          }}
                        />
                      </div>
                      <div className="progress-bar-file">
                        <div
                          style={{
                            width: `${listOFOwnersHoldingsProgress}%`,
                            height: "100%",
                            backgroundColor: "#6c63ff",
                            transition: "width 0.2s ease-in-out",
                          }}
                        ></div>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: "#888" }}>Drag and drop your PDF here</p>
                  )}
                  <input
                    type="file"
                    id="listOfOwnersHoldingsInput"
                    accept="application/pdf"
                    onChange={(e) =>
                      handleFileChange(
                        e,
                        setListOfOwnersHoldingsFile,
                        setListOfOwnersHoldingsProgress,
                        ["application/pdf"]
                      )
                    }
                    hidden
                  />
                </div>
              </div>

              {/*Certificate of Incorporation */}
              <div className="document-right">
                <div className="d-flex justify-content-between align-items-center">
                  <h5>Certificate of Incorporation</h5>
                  <div
                    className="upload-icon"
                    onClick={() =>
                      document
                        .getElementById("certificateOfIncorporateInput")
                        .click()
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <MdUpload size={24} />
                  </div>
                </div>
                <div
                  className={`drag-area ${
                    dragCertificateOfIncorporation ? "active" : ""
                  }`}
                  onDragOver={(e) =>
                    handleDragOver(e, setDragCertificateOfIncorporation)
                  }
                  onDragLeave={() =>
                    handleDragLeave(setDragCertificateOfIncorporation)
                  }
                  onDrop={(e) =>
                    handleDrop(
                      e,
                      setCertificateOfIncorporationFile,
                      setCertificateOfIncorporationProgress,
                      setDragCertificateOfIncorporation,
                      ["application/pdf"]
                    )
                  }
                >
                  {certificateOfIncorporationFile ? (
                    <>
                      <FaCheck size={30} color="#003399" />
                      <h5 style={{ color: "#003399", marginTop: "10px" }}>
                        Document Uploaded
                      </h5>
                      <div className="w-100 text-end">
                        <MdClear
                          size={20}
                          className="upload-icon"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setCertificateOfIncorporationFile(null);
                            setCertificateOfIncorporationProgress(0);
                          }}
                        />
                      </div>
                      <div className="progress-bar-file">
                        <div
                          style={{
                            width: `${certificateOfIncorporationProgress}%`,
                            height: "100%",
                            backgroundColor: "#6c63ff",
                            transition: "width 0.2s ease-in-out",
                          }}
                        ></div>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: "#888" }}>Drag and drop your PDF here</p>
                  )}
                  <input
                    type="file"
                    id="certificateOfIncorporateInput"
                    accept="application/pdf"
                    onChange={(e) =>
                      handleFileChange(
                        e,
                        setCertificateOfIncorporationFile,
                        setCertificateOfIncorporationProgress,
                        ["application/pdf"]
                      )
                    }
                    hidden
                  />
                </div>
              </div>

              {/*Memorandum and articles of Incorporation */}
              <div className="document-right">
                <div className="d-flex justify-content-between align-items-center">
                  <h5>Memorandum and articles of Incorporation</h5>
                  <div
                    className="upload-icon"
                    onClick={() =>
                      document.getElementById("memorandomInput").click()
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <MdUpload size={24} />
                  </div>
                </div>
                <div
                  className={`drag-area ${dragMemorandum ? "active" : ""}`}
                  onDragOver={(e) => handleDragOver(e, setDragMemorandum)}
                  onDragLeave={() => handleDragLeave(setDragMemorandum)}
                  onDrop={(e) =>
                    handleDrop(
                      e,
                      setMemorandumFile,
                      setMemorandumProgress,
                      setDragMemorandum,
                      ["application/pdf"]
                    )
                  }
                >
                  {memorandumFile ? (
                    <>
                      <FaCheck size={30} color="#003399" />
                      <h5 style={{ color: "#003399", marginTop: "10px" }}>
                        Document Uploaded
                      </h5>
                      <div className="w-100 text-end">
                        <MdClear
                          size={20}
                          className="upload-icon"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setMemorandumFile(null);
                            setMemorandumProgress(0);
                          }}
                        />
                      </div>
                      <div className="progress-bar-file">
                        <div
                          style={{
                            width: `${memorandumProgress}%`,
                            height: "100%",
                            backgroundColor: "#6c63ff",
                            transition: "width 0.2s ease-in-out",
                          }}
                        ></div>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: "#888" }}>Drag and drop your PDF here</p>
                  )}
                  <input
                    type="file"
                    id="memorandomInput"
                    accept="application/pdf"
                    onChange={(e) =>
                      handleFileChange(
                        e,
                        setMemorandumFile,
                        setMemorandumProgress,
                        ["application/pdf"]
                      )
                    }
                    hidden
                  />
                </div>
              </div>

              {/*Latest Financial Accounts  */}
              <div className="document-right">
                <div className="d-flex justify-content-between align-items-center">
                  <h5>Latest Financial Accounts </h5>
                  <div
                    className="upload-icon"
                    onClick={() =>
                      document
                        .getElementById("latestfinancialAccountsInput")
                        .click()
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <MdUpload size={24} />
                  </div>
                </div>
                <div
                  className={`drag-area ${
                    dragLatestFinancialAccounts ? "active" : ""
                  }`}
                  onDragOver={(e) =>
                    handleDragOver(e, setDragLatestFinancialAccounts)
                  }
                  onDragLeave={() =>
                    handleDragLeave(setDragLatestFinancialAccounts)
                  }
                  onDrop={(e) =>
                    handleDrop(
                      e,
                      setLatestFinancialAccountsFile,
                      setLatestFinancialAccountsProgress,
                      setDragLatestFinancialAccounts,
                      ["application/pdf"]
                    )
                  }
                >
                  {latestFinancialAccountsFile ? (
                    <>
                      <FaCheck size={30} color="#003399" />
                      <h5 style={{ color: "#003399", marginTop: "10px" }}>
                        Document Uploaded
                      </h5>
                      <div className="w-100 text-end">
                        <MdClear
                          size={20}
                          className="upload-icon"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setLatestFinancialAccountsFile(null);
                            setLatestFinancialAccountsProgress(0);
                          }}
                        />
                      </div>
                      <div className="progress-bar-file">
                        <div
                          style={{
                            width: `${latestFinancialAccountsProgress}%`,
                            height: "100%",
                            backgroundColor: "#6c63ff",
                            transition: "width 0.2s ease-in-out",
                          }}
                        ></div>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: "#888" }}>Drag and drop your PDF here</p>
                  )}
                  <input
                    type="file"
                    id="latestfinancialAccountsInput"
                    accept="application/pdf"
                    onChange={(e) =>
                      handleFileChange(
                        e,
                        setLatestFinancialAccountsFile,
                        setLatestFinancialAccountsProgress,
                        ["application/pdf"]
                      )
                    }
                    hidden
                  />
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end w-100 my-3  ">
              <button className="common-kyc-button" onClick={handlePrevStep}>
                Back
              </button>

              <button className="common-kyc-button" onClick={handleNextStep}>
                Continue
              </button>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="kyc-screen common-prop">
            <h2 className="kyc-title my-4">Summary</h2>
            <div className="summary-main">
              <div className="summary-sub">
                <label>Company Name </label>
                <span>{formData.companyName}</span>
              </div>
              <div className="summary-sub">
                <label>Registered Address </label>
                <span>{formData.companyAddress}</span>
              </div>
              <div className="summary-sub">
                <label> Street Address</label>
                <span>{formData.street}</span>
              </div>
              <div className="summary-sub">
                <label> City </label>
                <span>{formData.city}</span>
              </div>

              <div className="summary-sub">
                <label> Postal Code </label>
                <span>{formData.postal}</span>
              </div>
              <div className="summary-sub">
                <label> Country of Incorporation </label>
                <span>{formData.countryOfInc}</span>
              </div>
            </div>

            <div className="common-summary">
              <h5 className="pb-3">List of Directors</h5>
              <Link
                to={URL.createObjectURL(listOFDirectorsFile)}
                target="_blank"
                className="view-pdf"
              >
                View PDF
              </Link>
            </div>

            <div className="common-summary">
              <h5 className="pb-3">List of Share Holders</h5>
              <Link
                to={URL.createObjectURL(listOFShareHoldersFile)}
                target="_blank"
                className="view-pdf"
              >
                View PDF
              </Link>
            </div>

            <div className="common-summary">
              <h5 className="pb-3">List of Ultimate Beneficial Owners</h5>
              <Link
                to={URL.createObjectURL(listOFBeneficialOwnersFile)}
                target="_blank"
                className="view-pdf"
              >
                View PDF
              </Link>
            </div>

            <div className="common-summary">
              <h5 className="pb-3">
                List of Beneficial Owners and their % Holdings
              </h5>
              <Link
                to={URL.createObjectURL(listOFOwnersHoldingsFile)}
                target="_blank"
                className="view-pdf"
              >
                View PDF
              </Link>
            </div>

            <div className="common-summary">
              <h5 className="pb-3">Certificate of Incorporation</h5>
              <Link
                to={URL.createObjectURL(certificateOfIncorporationFile)}
                target="_blank"
                className="view-pdf"
              >
                View PDF
              </Link>
            </div>

            <div className="common-summary">
              <h5 className="pb-3">Memorandum and articles of Incorporation</h5>
              <Link
                to={URL.createObjectURL(memorandumFile)}
                target="_blank"
                className="view-pdf"
              >
                View PDF
              </Link>
            </div>

            <div className="common-summary">
              <h5 className="pb-3">Latest Financial Accounts </h5>
              <Link
                to={URL.createObjectURL(latestFinancialAccountsFile)}
                target="_blank"
                className="view-pdf"
              >
                View PDF
              </Link>
            </div>

            <div className="summary-btns">
              <button className="common-kyc-button" onClick={handlePrevStep}>
                Back
              </button>
              <button className="common-kyc-button" onClick={handleSubmit}>
                Confirm
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const authData = Cookies.get("auth")
      ? JSON.parse(Cookies.get("auth"))
      : null;
    const kycStatus = authData?.user?.kycstatus;
    if (kycStatus === 2) {
      return navigate("/dashboard/user");
    }
  }, [navigate]);
  return (
    <>
      {loading && <Loader />}
      <div className="dashboard-container"></div>
      <UserSidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        onSpaceToggle={handleSpaceToggle}
        isSpaceActive={isSpaceActive}
      />
      {/* Main Content */}
      <div
        className={`dashboard-main ${sidebarOpen ? "shifted" : ""}  ${
          isSpaceActive ? "freeSpaceDash" : "dashboard-main"
        }`}
      >
        <UserNav title={"KYC in Progress"} />
        <div className="dashboard-content">
          {!final && (
            <>
              {formData.identityType === "company" ? (
                <ProgressBarCompany currentStep={currentStep} />
              ) : (
                <ProgressBar currentStep={currentStep} />
              )}
              <div className="kyc-verification-start">
                <div className="d-flex flex-column justify-content-center  ">
                  <motion.div
                    key={currentStep}
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </div>
              </div>
            </>
          )}

          {final && (
            <div
              className="kyc-screen common-prop"
              style={{ margin: "0px auto" }}
            >
              <MdPendingActions className="b-clr fs-1 animate" />
              {/* <h1 className="kyc-title mt-4">Completed</h1> */}
              <h2 className="my-3">Verification In Progress</h2>
              {/* <p className="kyc-text">
                                Once checks are all complete, we'll let you know via email. This usually takes between 3 minutes to an hour, but sometimes can take up to 24 hours.
                            </p> */}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Kyc;
