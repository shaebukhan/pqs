import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Banner from "../../components/Banner";
import HomeCard from "../../components/HomeCard";
import Technology from "../../assets/images/Vector (1).svg";
import Research from "../../assets/images/Vector (2).svg";
import Databse from "../../assets/images/databse.svg";
import Trading from "../../assets/images/trading.svg";
import Button from "../../components/Button";
import Ctext from "../../components/Ctext";
const Home = (props) => {
    return (
        <>
            <Navbar />
            <Banner />
            <HomeCard title={"Trading"} image={Trading} text={<>PQS strategies are designed to be deployed globally in order to achieve portfolio diversification and deliver high quality returns. We value the importance of rigorous, methodical, systematic implementation across all geographies and asset classes. PQS’s trading discipline has been developed within a highly controlled risk management framework inherited from our market-making culture. We believe in global and continuous market coverage to maximize alpha extraction.</>} />
            <HomeCard title={"Research"} image={Research} text={<>At Premier Quantitative Strategies (PQS) SPC FUND, we believe that collective work and idea sharing spark contagious creativity, forming the foundation of our most successful strategies. Our research teams bring together diverse areas of expertise, including engineers, computer scientists, physicists, mathematicians, data scientists, and fundamental analysts. <br /> <br />
                PQS's research is designed to stimulate intellectual curiosity, encourage cross-disciplinary learning, and promote complex problem-solving. We foster a collaborative environment that serves as a fertile ground for experimental research, driving innovation, disruption, and the exploration of new frontiers. </>} />
            <HomeCard title={"Technology"} image={Technology} text={<>Our tech platform is integral to everything we do at Premier Quantitative Strategies (PQS) SPC FUND. Automation and systematic processes are at the core of our tech culture, enabling efficiency and scalability across our operations. Over the years, we have made significant investments in a global research and execution platform that spans all geographies and asset classes. This platform supports a wide range of activities, from high-turnover, scalable execution expertise that would explore the shorter time frames.
                <br /> <br />
                We leverage a variety of programming languages and tech stacks, including C++ and Python. By fostering an environment that encourages the exploration of emerging and disruptive technologies, we continually seek to uncover new opportunities and drive innovation in our strategy pool.
            </>} />
            <HomeCard title={"Data"} image={Databse} text={<>Data is fundamental to all our activities at Premier Quantitative Strategies (PQS) SPC FUND. Our robust data platform is designed to handle both clean and dirty data from the most granular tick by tick data to minute bars. <br /> <br />
                We maintain a relentless pursuit of data that can enhance our prediction models and drive alpha generation. By continuously evaluating new data sources, embracing emerging data technologies, and managing vast datasets, we fuel PQS’s innovation and maintain our competitive edge.</>} />
           

                <Ctext />
            <Button />
           
            <Footer />
        </>
    );
};

export default Home;