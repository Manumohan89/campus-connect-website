import React from 'react';
import Slider from 'react-slick';
import './CustomCarousel.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const CustomCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        <div className="carousel-slide">
          <img src="/assets/banner1.jpg" alt="Slide 1" className="carousel-image" />
          <div className="carousel-overlay"></div>
          <div className="carousel-caption">
            <h3>Welcome to Campus Connect</h3>
            <p>Empowering students through technology.</p>
          </div>
        </div>
        <div className="carousel-slide">
          <img src="/assets/banner2.jpg" alt="Slide 2" className="carousel-image" />
          <div className="carousel-overlay"></div>
          <div className="carousel-caption">
            <h3>SGPA/CGPA Calculator</h3>
            <p>Track your academic performance with ease.</p>
          </div>
        </div>
        <div className="carousel-slide">
          <img src="/assets/banner3.jpg" alt="Slide 3" className="carousel-image" />
          <div className="carousel-overlay"></div>
          <div className="carousel-caption">
            <h3>Find Job Opportunities</h3>
            <p>Discover jobs and internships relevant to you.</p>
          </div>
        </div>
      </Slider>
    </div>
  );
};

export default CustomCarousel;
