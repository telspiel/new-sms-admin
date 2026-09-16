import React, { useState, useContext, useRef } from "react";
import Cropper from "react-easy-crop";
import "./AppearanceBranding.css";
import { Layers, Send, Save, X } from "lucide-react";
import Endpoints from "../../api/endpoint";
import { AuthContext } from "../../context/AuthContext";

const AppearanceBranding = () => {
  const { userData } = useContext(AuthContext);
  const [toastMessage, setToastMessage] = useState("");

  const [brandName, setBrandName] = useState(userData?.brandName || "");

  // Upload type tracker: 'logo' | 'favicon'
  const [uploadType, setUploadType] = useState(null);

  const [logoPreview, setLogoPreview] = useState(userData?.logoUrl || null);
  const [finalLogoFile, setFinalLogoFile] = useState(null);

  // Favicon States
  const [faviconPreview, setFaviconPreview] = useState(userData?.faviconUrl || null);
  const [finalFaviconFile, setFinalFaviconFile] = useState(null);

  // Shared Cropper Modal States
  const [selectedRawImage, setSelectedRawImage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  // Cropper setup
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Separate File Input Refs
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  // Trigger file selection handlers
  const handleChooseLogoClick = () => {
    setUploadType("logo");
    if (logoInputRef.current) logoInputRef.current.click();
  };

  const handleChooseFaviconClick = () => {
    setUploadType("favicon");
    if (faviconInputRef.current) faviconInputRef.current.click();
  };

  // Handle image selection for both inputs
  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadType(type);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setSelectedRawImage(reader.result);
        if (type === "logo") {
          setFinalLogoFile(file);
        } else {
          setFinalFaviconFile(file);
        }
        setShowCropModal(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Canvas helper to generate cropped file
  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const fileName = uploadType === "logo" ? "logo.png" : "favicon.png";
        const file = new File([blob], fileName, { type: "image/png" });
        resolve({ file, url: URL.createObjectURL(blob) });
      }, "image/png");
    });
  };

  // Action: Apply Crop
  const handleApplyCrop = async () => {
    try {
      const { file, url } = await getCroppedImg(
        selectedRawImage,
        croppedAreaPixels
      );
      if (uploadType === "logo") {
        setFinalLogoFile(file);
        setLogoPreview(url);
      } else {
        setFinalFaviconFile(file);
        setFaviconPreview(url);
      }
      setShowCropModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Use Whole Image without cropping
  const handleUseWholeImage = () => {
    if (uploadType === "logo") {
      setLogoPreview(selectedRawImage);
    } else {
      setFaviconPreview(selectedRawImage);
    }
    setShowCropModal(false);
  };

  
  // Remove handlers
  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setFinalLogoFile(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handleRemoveFavicon = () => {
    setFaviconPreview(null);
    setFinalFaviconFile(null);
    if (faviconInputRef.current) faviconInputRef.current.value = "";
  };

  // Unified Save Changes Handler
  const handleSaveChanges = async () => {
    if (!finalLogoFile && !finalFaviconFile && brandName === userData?.brandName) {
      return;
    }

    try {
      let successMessages = [];

      // 1. Upload Logo API
      if (finalLogoFile) {
        const logoData = new FormData();
        logoData.append("loggedInUserName", userData?.username || "");
        logoData.append("file", finalLogoFile);
        logoData.append("brandName", brandName ? brandName.trim() : "");

        const logoUrl = Endpoints.get("uploadLogo");
        const resLogo = await fetch(logoUrl, {
          method: "POST",
          headers: {
            Authorization: userData?.authJwtToken || "",
          },
          body: logoData,
        });

        const responseLogo = await resLogo.json();
        if (responseLogo.code === 1000) {
          successMessages.push("Logo updated");
          handleRemoveLogo();
        }
      }

      // 2. Upload Favicon API (Only sending loggedInUserName and file)
      if (finalFaviconFile) {
        const faviconData = new FormData();
        faviconData.append("loggedInUserName", userData?.username || "");
        faviconData.append("file", finalFaviconFile);

        const faviconUrl = Endpoints.get("uploadFavicon");
        const resFavicon = await fetch(faviconUrl, {
          method: "POST",
          headers: {
            Authorization: userData?.authJwtToken || "",
          },
          body: faviconData,
        });

        const responseFavicon = await resFavicon.json();
        if (responseFavicon.code === 1000) {
          successMessages.push("Favicon updated");
          handleRemoveFavicon();
        }
      }

      if (successMessages.length > 0) {
        setToastMessage(
          `${successMessages.join(" & ")} successfully. Changes will be visible from next login.`
        );
      } else {
        setToastMessage("Saved successfully.");
      }

      setTimeout(() => setToastMessage(""), 4000);
    } catch (error) {
      console.error("Upload error:", error);
      setToastMessage("Something went wrong while saving changes.");
      setTimeout(() => setToastMessage(""), 4000);
    }
  };

  // Enable save button if logo, favicon, or brand name is changed
  const isSaveDisabled =
    !finalLogoFile && !finalFaviconFile && brandName === userData?.brandName;

  return (
    <div className="appearance-branding">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={logoInputRef}
        onChange={(e) => handleFileChange(e, "logo")}
        accept="image/png, image/jpeg, image/jpg, image/svg+xml"
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={faviconInputRef}
        onChange={(e) => handleFileChange(e, "favicon")}
        accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/x-icon"
        style={{ display: "none" }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-message">
          <i className="fa-regular fa-circle-check"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="appearance-branding-header">
        <div className="brand-heading">
          <h1>Appearance & Branding</h1>
          <p>
            Home / Appearance · White-label the platform for your organization
          </p>
        </div>

        <button
          className="appearance-save-btn"
          onClick={handleSaveChanges}
          disabled={isSaveDisabled}
        >
          <Save size={18} strokeWidth={1.8} />
          <span>Save changes</span>
        </button>
      </div>

      {/* Branding Card */}
      <div className="branding-card">
        {/* Card Heading */}
        <div className="branding-card-header">
          <div className="branding-title">
            <Layers size={20} strokeWidth={2} />
            <h2>Brand Name, Logo & Favicon</h2>
          </div>
          <p>
            Set your brand name, logo and browser favicon. They'll appear across
            the admin panel once saved.
          </p>
        </div>

        {/* Brand Name */}
        <div className="branding-field">
          <label>Brand / Product Name</label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Enter Brand Name"
          />
        </div>

        {/* Logo Section */}
        <div className="branding-field">
  <label>Logo</label>
  <div className="upload-box">
    {logoPreview ? (
      <div className="upload-icon preview-icon">
        <img src={logoPreview} alt="Logo preview" />
      </div>
    ) : (
      <div className="upload-icon">
        <Send size={32} strokeWidth={1.8} />
      </div>
    )}

    <div className="upload-content">
      <h3>Upload your logo</h3>
      <p>
        PNG, JPG or SVG · max 1 MB · square works best · crop after choosing
      </p>

      <div className="upload-actions">
        <button
          type="button"
          className="choose-file-btn"
          onClick={handleChooseLogoClick}
        >
          Choose file
        </button>
        {logoPreview && (
          <button
            type="button"
            className="remove-file-btn"
            onClick={handleRemoveLogo}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  </div>
</div>

        {/* Favicon Section */}
        <div className="branding-field favicon-field">
  <label>Favicon</label>
  <div className="upload-box">
    {faviconPreview ? (
      <div className="upload-icon preview-icon">
        <img src={faviconPreview} alt="Favicon preview" />
      </div>
    ) : (
      <div className="upload-icon">
        <Send size={32} strokeWidth={1.8} />
      </div>
    )}

    <div className="upload-content">
      <h3>Upload your favicon</h3>
      <p>
        PNG, ICO or SVG · max 512 KB · square, 32×32 or 512×512 works
        best · crop after choosing
      </p>

      <div className="upload-actions">
        <button
          type="button"
          className="choose-file-btn"
          onClick={handleChooseFaviconClick}
        >
          Choose file
        </button>
        {faviconPreview && (
          <button
            type="button"
            className="remove-file-btn"
            onClick={handleRemoveFavicon}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  </div>
</div>
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="crop-modal-overlay">
          <div className="crop-modal">
            <div className="crop-modal-header">
              <div>
                <h2>Crop {uploadType === "logo" ? "logo" : "favicon"}</h2>
                <p>Drag to reposition · drag the corner to resize</p>
              </div>
              <button
                className="crop-close-btn"
                onClick={() => setShowCropModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="cropper-container">
              <Cropper
                image={selectedRawImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <p className="crop-hint">Square crop (1:1) — recommended.</p>

            <div className="crop-modal-footer">
              <button className="use-whole-btn" onClick={handleUseWholeImage}>
                Use whole image
              </button>
              <button className="apply-crop-btn" onClick={handleApplyCrop}>
                Apply crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppearanceBranding;