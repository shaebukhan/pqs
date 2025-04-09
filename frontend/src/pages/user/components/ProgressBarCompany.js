
import "./ProgressBar.css";
const steps = ["Company Info", "Identity Verification", "Summary"];
const ProgressBarCompany = ({ currentStep }) => {


    return (
        <div className="custom-prog-barr-container">
            <div className="custom-prog-barr">
                {steps.map((step, index) => (
                    <div className="custom-step-wrapper" key={index}>
                        {/* Step Circle */}
                        <div
                            className={`custom-step-circle ${index <= currentStep - 6 ? "completed" : ""}`}
                        >
                            {index === currentStep - 6 && <div className="step-indicator"></div>}
                        </div>

                        {/* Step Line */}
                        {index < steps.length - 2 && (
                            <div
                                className={`custom-step-line ${index < currentStep ? "active" : ""}`}
                            ></div>
                        )}

                        {/* Step Label */}
                        <div className="custom-step-label">{step}</div>
                    </div>
                ))}
            </div>


        </div>
    );
};

export default ProgressBarCompany;
