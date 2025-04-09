import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";


const Terms = () => {
    return (
        <>
            <Navbar />

            <div className="mt-top">
                <div className="container">
                    <h1 className="pt-5 common-title c-clr">Terms and Conditions</h1>

                    <h2 className="c-form">Issued and Approved by Premier Quantitative Strategies SP</h2>
                    <p className="common-text-g">The information on this website is issued and approved by Premier Quantitative Strategies SP (hereafter referred to as PQS), which is an open-ended mutual fund regulated by the Cayman Islands Monetary Authority (CIMA).</p>

                    <h2 className="c-form">Investor Classification</h2>
                    <p className="common-text-g">This website is directed only at, and contains information about products and services only available to, those who are Professional Customers or Eligible Counterparties (as defined by the FCA). The definitions can be found on the FCA's website at <Link className="c-clr" to="https://www.fca.gov.uk" target="_blank">www.fca.gov.uk</Link>. The information within this website is unsuitable for any party who does not qualify as a Professional Customer or Eligible Counterparty and, by selecting “I agree”, you confirm that you fall within one of these definitions. PQS cannot and will not conduct business with retail clients: as such, the website is not intended for viewing by retail clients - if you are in any doubt, you should consult a financial adviser.</p>

                    <h2 className="c-form">The Premier Quantitative Strategies (PQS) Fund SP</h2>
                    <p className="common-text-g">A prospective investor who expresses an interest in investing in the PQS Fund SP will be provided with the Offering Memorandum and this document should be carefully read before determining whether an investment in the fund is suitable. Investment in the PQS Fund SP is only suitable for investors who are capable of understanding the risk of loss of all or a substantial part of their investment.</p>
                    <p className="common-text-g">The PQS Fund SP is an offshore open-ended mutual fund based in Cayman. Shares in the PQS Fund SP are not available for sale to persons resident in any jurisdiction in which such a sale would be prohibited. Any investor who acts upon information in this website does so purely at his own personal risk, and PQS accepts no liability for its consequences.</p>
                    <p className="common-text-g">The PQS Fund SP is an unregulated collective investment scheme for the purposes of the Financial Services and Markets Act 2000. Shares are not dealt on a recognised exchange, so an investor may dispose of his shares by way of a redemption.</p>

                    <h2 className="c-form">No Solicitation</h2>
                    <p className="common-text-g">This website is provided for information purposes only. It does not constitute legal advice and should not be used for making investment decisions. PQS accepts no liability for any damage or loss from direct, indirect or consequential use of this website or any of its content. This website does not constitute a distribution or an offer or solicitation to sell units in any jurisdiction where it would be against local law or regulation.</p>

                    <h2 className="c-form">Jurisdiction</h2>
                    <p className="common-text-g">Information on this site is not directed at any person, partnership or corporation being resident in the US, except for those who are current existing investors. The information contained in this website is not directed at you if PQS is prohibited by any law of any jurisdiction from making the information on this site available to you and is not intended for any use that would be contrary to local law or regulation.</p>
                    <p className="common-text-g">The PQS Fund SP is not available for general distribution to or sale to US investors. It will not be registered under the Securities Act of 1933, as amended (the “Securities Act”) and will not be registered under the Investment Company Act of 1940 (as defined in Regulation S under the Securities Act). The PQS Fund SP is not available to any US persons except in a transaction which does not violate the Securities Act, the Investment Company Act or any other applicable US securities laws (including without limitation any applicable law of any of the States of the USA).</p>
                    <p className="common-text-g">Persons who are resident outside the UK and US should consult their professional advisers or local regulator to satisfy themselves of local regulatory requirements.</p>

                    <h2 className="c-form">Risk</h2>
                    <p className="common-text-g">The price of shares in the PQS Fund SP can go down as well as up, and investors may not get back the full amount invested. Past performance is not a reliable indicator of future performance. PQS does not give out any tax advice, and the tax position of investors may vary depending on your own personal circumstances, for which you may need to seek professional advice. The PQS Fund SP reports in Sterling. If you are not a Sterling-based investor, changes in rates of exchange may cause the value of the investment to go up or down when you translate the current Sterling price into your own currency.</p>

                    <h2 className="c-form">Accuracy</h2>
                    <p className="common-text-g">The Fund's administrator, Matco Trust Limited confirms the official Net Asset Value (NAV) for the fund at the end of each day. PQS produces a daily NAV estimate after the markets close and, although every care is taken to ensure the accuracy of this and other statistical information and analysis in this website, no representation or warranty, express or implied, is made to its accuracy or completeness. Although PQS will attempt to update the website on a regular basis, PQS will not guarantee when and will give no notice for any information added or changed, and some data may no longer be valid since its first posting.</p>

                    <h2 className="c-form">Linked Websites</h2>
                    <p className="common-text-g">We do not accept any responsibility or liability (including content and accuracy) for any link to a third-party website that we may show. You must check the legal and privacy policy sections of any site that you link to.</p>

                    <h2 className="c-form">Copyright</h2>
                    <p className="common-text-g">PQS owns the copyright and information in this website. It should only be used for personal reference and not be reproduced or distributed to any other person or body. Some parts of the website are password protected and requests for a password should be made to <a className="c-clr" href="mailto:support@pqs.fund">support@pqs.fund</a>. We will not guarantee that we will issue passwords to all investors or interested parties. Under no circumstances should a password be shared, and the Directors reserve the right to rescind access at any time and for any reason.</p>

                    <h2 className="c-form">Cookies & Privacy</h2>
                    <p className="common-text-g">PQS does not use cookies.</p>

                    <h2 className="c-form">Data Protection</h2>
                    <p className="common-text-g pb-3">PQS collects certain personal information such as name, email address if submitted on this website. This information will be used and stored on our internal systems to ensure compliance internally and under the UK regulatory regime. PQS also collects non-personally identifiable information to track data such as total number of visits to the website.</p>
                </div>

            </div>
            <Footer />
        </>
    );
};

export default Terms;