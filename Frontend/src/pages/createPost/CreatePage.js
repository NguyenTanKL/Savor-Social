import React from "react";
import { useState, useEffect } from "react";
import "./CreatePage.css";
import UserCreatePost from "./UserCreatePost";
import RestaurantCreatePost from "./RestaurantCreatePost";

function CreatePage() {
    const [userData, setUserData] = useState([
        {
            name: 'Haidilao.vn',
            account_name: 'Haidilaovn',
            job: 'Nhà hàng lấu HAIDILAO VIETNAM',
            followers: '13.6K',
            following: '27',
            posts: '9',
            socialLinks: [
                { platform: 'Facebook', url: 'https://facebook.com/username' },
                { platform: 'Twitter', url: 'https://twitter.com/username' },
                { platform: 'LinkedIn', url: 'https://linkedin.com/in/username' }
            ],
            type: 'restaurant'
        },
        // {
        //     name: 'Nguyen Nhat Dang',
        //     account_name: '_dangnguyen',
        //     job: 'Food review',
        //     followers: '3.6K',
        //     following: '200',
        //     posts: '9',
        //     socialLinks: [
        //         { platform: 'Facebook', url: 'https://facebook.com/username' },
        //         { platform: 'Twitter', url: 'https://twitter.com/username' },
        //         { platform: 'LinkedIn', url: 'https://linkedin.com/in/username' }
        //     ],
        //     type: 'personal'
        // }
    ]);

    return(
        <div>
            {/* <UserCreatePost userData={userData}/> */}
            <RestaurantCreatePost/>
        </div>
    )
};

export default CreatePage