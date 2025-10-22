import React from 'react';
import Iphone from "../assets/images/iphone-14.jpg";
import HoldingIphone from "../assets/images/iphone-hand.png";
import BKIncLogo from "../assets/images/bkinclogo.png";

function Jumbotron() {
    return (
        <div className='jumbotron-section wrapper'>
            <img src={BKIncLogo} alt="BK Inc Logo" className="bkinc-logo" />
            <div className="content-wrapper">
                <img className='logo' src={Iphone} alt="Iphone 14 Pro" />
                <p className='text'>Big and bigger.</p>
                <span className='description'>
                    Experience the future of mobile technology with the all-new iPhone 14 Pro.
                    From $41.62/mo. for 24 mo. or $999 before trade-in
                </span>
                <ul className='links'>
                    <li>
                        <button className='button'>
                            <span>Buy</span>
                            <span className="arrow">→</span>
                        </button>
                    </li>
                    <li>
                        <a className='link'>Learn More</a>
                    </li>
                </ul>
            </div>
            <div className="iphone-container">
                <img 
                    className='iphone-img' 
                    src={HoldingIphone} 
                    alt="Iphone"
                />
                <div className="glow-effect"></div>
            </div>
        </div>
    );
}

export default Jumbotron;