
import "./ProgressBar.css";

const steps = ["Agreement", "Identity", "Verify", "Documents", "Signature", "Summary"];

const ProgressBar = ({ currentStep }) => {

    return (
        <div className="custom-prog-barr-container">
            <div className="custom-prog-barr">
                {steps.map((step, index) => (
                    <div className="custom-step-wrapper" key={index}>
                        {/* Step Circle */}
                        <div
                            className={`custom-step-circle ${index <= currentStep ? "completed" : ""}`}
                        >
                            {index === currentStep && <div className="step-indicator"></div>}
                        </div>

                        {/* Step Line */}
                        {index < steps.length - 1 && (
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

export default ProgressBar;
