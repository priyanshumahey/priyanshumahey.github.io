import './App.css';
//import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
//import { EffectCoverflow, Pagination } from "swiper";
import { Link } from 'react-router-dom'

function Homepage() {
  return (
    <div className="App fade-in">
        <h1 className="Head_Title">Hello! I'm Priyanshu Mahey!</h1>
        {/* <h2>I am a:<span className="changingText"></span></h2> */}
        {/* <div style={{textAlign:"left"}}>
          <h2 >Who am I?</h2>
          <img alt="Priyanshu's profile" style={{ width: "100%",  maxWidth: "50vh", height: "auto", textAlign:"left", border:"solid"}} src={require("./Images/pf.jpg")} />
        </div> */}
        <h2><Link to="/Experiences">View my experiences here!</Link></h2>
        <h2>
          Still in development!
          To get more information on me, please visit
          <a target="_blank" rel="noreferrer" href="https://www.linkedin.com/in/priyanshu-mahey"> my linkedin!</a>
        </h2>
    
    
    {/* <Swiper
    effect={"coverflow"}
    grabCursor={true}
    centeredSlides={true}
    slidesPerView={"auto"}
    coverflowEffect={{
      rotate: 50,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    }}
    pagination={true}
    modules={[EffectCoverflow, Pagination]}
    className="mySwiper"
  >
      <SwiperSlide>
        <img style={{width:"10vh", height:"10vh"}} src="https://pytorch.org/assets/images/pytorch-logo.png" />
      </SwiperSlide>
      <SwiperSlide>
      <img style={{width:"10vh", height:"10vh"}} src="https://pytorch.org/assets/images/pytorch-logo.png" />
      </SwiperSlide>
      <SwiperSlide>
      <img style={{width:"10vh", height:"10vh"}} src="https://pytorch.org/assets/images/pytorch-logo.png" />
      </SwiperSlide>
      </Swiper> */}

  </div>
  );
}

export default Homepage;