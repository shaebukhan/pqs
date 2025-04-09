import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

const Signature = ({ signUrl }) => {
    const sigPad = useRef(null);

    // Clear the signature canvas
    const clearSignature = () => {
        sigPad.current.clear();
        if (signUrl) {
            signUrl(null);
        }
    };

    // Save the signature and pass it to the parent component
    const saveSignature = () => {
        if (sigPad.current.isEmpty()) {
            alert("Please provide a signature.");
            return;
        }

        // Get the Base64 URL of the signature
        const signatureDataURL = sigPad.current.getTrimmedCanvas().toDataURL("image/png");
        // Pass the signature back to the parent via signUrl
        if (signUrl) {
            signUrl(signatureDataURL);
        }

        alert("Signature saved successfully!");
    };

    return (
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
    );
};

export default Signature;
