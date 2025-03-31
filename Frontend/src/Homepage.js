import React from 'react';
import './HomePage.css'
// import Sidenav from './navigation/Sidenav';
import Timeline from './timeline/Timeline';
function HomePage() {
    return (
        <div className='homepage'>
            <div className='homepage__timeline'>
                <Timeline/>
            </div>
        </div>
    )
}
export default HomePage