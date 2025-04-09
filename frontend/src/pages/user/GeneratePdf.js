import jsPDF from "jspdf";
import "jspdf-autotable";
import SignLogo from "../assets/images/logo-w.png";
export const exportToPdf = (filteredTransactions, toDetails, period, openingBalance, paidOut, paidIn, closingBalance) => {
    const doc = new jsPDF();

    const image = new Image();
    image.src = SignLogo;

    image.onload = () => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const imageWidth = 50;
        const xOffset = (pageWidth - imageWidth) / 2;
        const imageHeight = (imageWidth * image.height) / image.width;
        doc.addImage(image, "PNG", xOffset, 10, imageWidth, imageHeight);
        doc.setFontSize(16);
        doc.setTextColor("#0E2340");
        doc.text("Premier Quantitative Strategies Statement", pageWidth / 2, imageHeight + 5, {
            align: "center",
        });

        const leftMargin = 14;
        const topMargin = imageHeight + 50;

        doc.setFontSize(10);
        doc.setTextColor("#6E7A8A");

        doc.text("To", leftMargin, topMargin);
        doc.setFontSize(12);
        doc.setTextColor("#0E2340");
        doc.text(toDetails, leftMargin, topMargin + 5);

        doc.setFontSize(10);
        doc.setTextColor("#6E7A8A");
        doc.text("From", leftMargin, topMargin + 30);
        doc.setFontSize(12);
        doc.setTextColor("#0E2340");
        doc.text(
            `System Pay Services Ltd,\nThird Floor\n89 Charterhouse Street\nLondon, EC1M 6PE\nEngland`,
            leftMargin,
            topMargin + 35
        );

        const rightMargin = pageWidth - 80;
        doc.setFontSize(10);
        doc.setTextColor("#6E7A8A");

        doc.text("Period", rightMargin, topMargin);
        doc.text("Opening balance", rightMargin, topMargin + 10);
        doc.text("Paid out", rightMargin, topMargin + 20);
        doc.text("Paid in", rightMargin, topMargin + 30);
        doc.text("Closing balance", rightMargin, topMargin + 40);

        doc.setFontSize(12);
        doc.setTextColor("#0E2340");

        doc.text(period, rightMargin + 40, topMargin);
        doc.text(`${openingBalance} USDT`, rightMargin + 40, topMargin + 10);
        doc.text(`${paidOut} USDT`, rightMargin + 40, topMargin + 20);
        doc.text(`${paidIn} USDT`, rightMargin + 40, topMargin + 30);
        doc.text(`${closingBalance} USDT`, rightMargin + 40, topMargin + 40);

        const columns = ["Date", "Type", "Payment Out", "Payment In", "Transaction ID", "Balance"];
        const rows = filteredTransactions.map((txn) => [
            new Date(txn.date).toLocaleString("en-GB"),
            txn.type,
            txn.amount,
            txn.currency,
            txn._id,
        ]);

        doc.autoTable({
            head: [columns],
            body: rows,
            startY: imageHeight + 60,
        });

        doc.save("transaction-report.pdf");
    };
};
